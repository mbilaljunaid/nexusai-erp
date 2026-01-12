// server/routes/ar.ts
import { Router } from "express";
import { arService } from "../services/ar";
import {
    insertArCustomerSchema,
    insertArCustomerAccountSchema,
    insertArCustomerSiteSchema,
    insertArInvoiceSchema,
    insertArReceiptSchema,
    insertArRevenueRuleSchema,
    insertArRevenueScheduleSchema,
    insertArDunningTemplateSchema,
    insertArDunningRunSchema,
    insertArCollectorTaskSchema,
    insertArAdjustmentSchema,
    insertArSystemOptionsSchema, // Added
    slaJournalHeaders,
    slaJournalLines
} from "@shared/schema";
import { storage } from "../storage";
import { ZodError } from "zod";
import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { RevenueWorker } from "../worker/RevenueWorker";

const router = Router();

// Customers (Party)
router.get("/customers", async (req, res) => {
    try {
        const customers = await arService.listCustomers();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: "Failed to list customers" });
    }
});

router.post("/customers", async (req, res) => {
    try {
        const data = insertArCustomerSchema.parse(req.body);
        const customer = await arService.createCustomer(data);
        res.status(201).json(customer);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ message: "Invalid customer data", errors: error.errors });
        } else {
            res.status(500).json({ message: "Failed to create customer" });
        }
    }
});

// Accounts
router.get("/accounts", async (req, res) => {
    try {
        const { customerId } = req.query;
        const accounts = await arService.listAccounts(customerId as string);
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: "Failed to list accounts" });
    }
});

router.post("/accounts", async (req, res) => {
    try {
        const data = insertArCustomerAccountSchema.parse(req.body);
        const account = await arService.createAccount(data);
        res.status(201).json(account);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ message: "Invalid account data", errors: error.errors });
        } else {
            res.status(500).json({ message: "Failed to create account" });
        }
    }
});

router.post("/accounts/:id/score", async (req, res) => {
    try {
        const score = await arService.calculateCreditScore(req.params.id);
        res.json({ score });
    } catch (error) {
        res.status(500).json({ message: "Failed to calculate score" });
    }
});

// Sites
router.get("/sites", async (req, res) => {
    try {
        const { accountId } = req.query;
        if (!accountId) return res.status(400).json({ message: "accountId query param is required" });
        const sites = await arService.listSites(accountId as string);
        res.json(sites);
    } catch (error) {
        res.status(500).json({ message: "Failed to list sites" });
    }
});

router.post("/sites", async (req, res) => {
    try {
        const data = insertArCustomerSiteSchema.parse(req.body);
        const site = await arService.createSite(data);
        res.status(201).json(site);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ message: "Invalid site data", errors: error.errors });
        } else {
            res.status(500).json({ message: "Failed to create site" });
        }
    }
});

// Invoices
router.get("/invoices", async (req, res) => {
    try {
        const { limit, offset } = req.query;
        const invoices = await arService.listInvoices(
            limit ? Number(limit) : undefined,
            offset ? Number(offset) : undefined
        );
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: "Failed to list invoices" });
    }
});

router.post("/invoices", async (req, res) => {
    try {
        const data = insertArInvoiceSchema.parse(req.body);
        const invoice = await arService.createInvoice(data);
        res.status(201).json(invoice);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
        } else {
            res.status(500).json({ message: "Failed to create invoice" });
        }
    }
});

router.post("/invoices/credit-memo", async (req, res) => {
    try {
        const { sourceInvoiceId, amount, reason } = req.body;
        if (!sourceInvoiceId || !amount) {
            return res.status(400).json({ message: "Source Invoice ID and Amount are required" });
        }
        const cm = await arService.createCreditMemo(sourceInvoiceId, Number(amount), reason);
        res.status(201).json(cm);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to create credit memo" });
    }
});

router.post("/invoices/debit-memo", async (req, res) => {
    try {
        const { accountId, siteId, amount, description } = req.body;
        if (!accountId || !siteId || !amount) {
            return res.status(400).json({ message: "Account ID, Site ID and Amount are required" });
        }
        const dm = await arService.createDebitMemo(accountId, siteId, Number(amount), description);
        res.status(201).json(dm);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to create debit memo" });
    }
});

router.post("/invoices/chargeback", async (req, res) => {
    try {
        const { receiptId, invoiceId, amount } = req.body;
        if (!receiptId || !invoiceId || !amount) {
            return res.status(400).json({ message: "Receipt ID, Invoice ID and Amount are required" });
        }
        const cb = await arService.createChargeback(receiptId, invoiceId, Number(amount));
        res.status(201).json(cb);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to create chargeback" });
    }
});

router.get("/invoices/:id/accounting", async (req, res) => {
    try {
        const id = req.params.id;
        const entries = await db.select()
            .from(slaJournalHeaders)
            .where(and(
                eq(slaJournalHeaders.entityId, id),
                eq(slaJournalHeaders.entityTable, "ar_invoices")
            ));

        const results = [];
        for (const header of entries) {
            const lines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, header.id));
            results.push({ ...header, lines });
        }
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch accounting" });
    }
});

// Receipts
router.get("/receipts", async (req, res) => {
    try {
        const receipts = await arService.listReceipts();
        res.json(receipts);
    } catch (error) {
        res.status(500).json({ message: "Failed to list receipts" });
    }
});

router.post("/receipts", async (req, res) => {
    try {
        const data = insertArReceiptSchema.parse(req.body);
        const receipt = await arService.createReceipt(data);
        res.status(201).json(receipt);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ message: "Invalid receipt data", errors: error.errors });
        } else {
            res.status(500).json({ message: "Failed to create receipt" });
        }
    }
});

router.post("/receipts/:id/apply", async (req, res) => {
    try {
        const { invoiceId, amount } = req.body;
        if (!invoiceId || !amount) return res.status(400).json({ message: "invoiceId and amount are required" });
        const app = await arService.applyReceipt(req.params.id, invoiceId, Number(amount));
        res.json(app);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to apply receipt" });
    }
});

router.get("/receipts/:id/applications", async (req, res) => {
    try {
        const apps = await storage.listArReceiptApplications(req.params.id);
        res.json(apps);
    } catch (error) {
        res.status(500).json({ message: "Failed to list applications" });
    }
});

router.get("/receipts/:id/accounting", async (req, res) => {
    try {
        const id = req.params.id;
        const entries = await db.select()
            .from(slaJournalHeaders)
            .where(and(
                eq(slaJournalHeaders.entityId, id),
                eq(slaJournalHeaders.entityTable, "ar_receipts")
            ));

        const results = [];
        for (const header of entries) {
            const lines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, header.id));
            results.push({ ...header, lines });
        }
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch accounting" });
    }
});

// Premium: Seeding
router.post("/seed", async (req, res) => {
    try {
        await arService.seedDemoData();
        res.json({ message: "AR demo data seeded successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to seed AR data" });
    }
});

// Premium: Credit Management
router.post("/revenue/recognize", async (req, res) => {
    try {
        const { scheduleIds } = req.body;
        if (!Array.isArray(scheduleIds)) return res.status(400).json({ message: "scheduleIds must be an array" });

        const results = [];
        for (const id of scheduleIds) {
            try {
                const result = await arService.recognizeRevenue(id);
                results.push({ id, status: "Success", schedule: result });
            } catch (err: any) {
                results.push({ id, status: "Failed", error: err.message });
            }
        }
        res.json(results);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Failed to recognize revenue" });
    }
});

// Collections / Dunning
router.get("/dunning/templates", async (req, res) => {
    try {
        const templates = await arService.listDunningTemplates();
        res.json(templates);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
});

router.post("/dunning/templates", async (req, res) => {
    try {
        const data = insertArDunningTemplateSchema.parse(req.body);
        const t = await arService.createDunningTemplate(data);
        res.json(t);
    } catch (e: any) {
        if (e instanceof ZodError) {
            res.status(400).json({ message: "Invalid template data", errors: e.errors });
        } else {
            res.status(500).json({ message: e.message });
        }
    }
});

router.post("/dunning/run", async (req, res) => {
    try {
        const result = await arService.createDunningRun();
        res.json(result);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
});

router.get("/collections/tasks", async (req, res) => {
    try {
        const tasks = await arService.listCollectorTasks(req.query.assignedTo as string, req.query.status as string);
        res.json(tasks);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
});

router.patch("/collections/tasks/:id", async (req, res) => {
    try {
        const task = await arService.updateCollectorTask(req.params.id, req.body);
        res.json(task);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
});

router.post("/collections/tasks/:id/email", async (req, res) => {
    try {
        const { invoiceId } = req.body;
        if (!invoiceId) return res.status(400).json({ message: "invoiceId required" });
        const text = await arService.generateAiCollectionEmail(invoiceId);
        res.json({ emailBody: text });
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
});

router.post("/accounts/:id/hold", async (req, res) => {
    try {
        const { hold } = req.body;
        const account = await arService.toggleCreditHold(req.params.id, hold);
        res.json(account);
    } catch (error) {
        res.status(500).json({ message: "Failed to update credit hold" });
    }
});

// Premium: Revenue Schedules
router.get("/revenue-schedules", async (req, res) => {
    try {
        const { invoiceId } = req.query;
        const all = await storage.listArRevenueSchedules();
        if (invoiceId) {
            res.json(all.filter(s => s.invoiceId === Number(invoiceId)));
        } else {
            res.json(all);
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to list revenue schedules" });
    }
});

router.post("/revenue-schedules", async (req, res) => {
    try {
        const data = insertArRevenueScheduleSchema.parse(req.body);
        const schedule = await storage.createArRevenueSchedule(data);
        res.status(201).json(schedule);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ message: "Invalid schedule data", errors: error.errors });
        } else {
            res.status(500).json({ message: "Failed to create revenue schedule" });
        }
    }
});

router.post("/revenue-schedules/:id/recognize", async (req, res) => {
    try {
        const schedule = await storage.updateArRevenueSchedule(req.params.id, { status: "Recognized" });
        if (!schedule) return res.status(404).json({ message: "Schedule not found" });

        // Also update invoice recognition status if all schedules are recognized
        const allSchedules = await storage.listArRevenueSchedules();
        const invoiceSchedules = allSchedules.filter(s => s.invoiceId === schedule.invoiceId);
        const allRecognized = invoiceSchedules.every(s => s.status === "Recognized");

        if (allRecognized) {
            await storage.updateArInvoiceStatus(String(schedule.invoiceId), "Posted");
        }

        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: "Failed to recognize revenue" });
    }
});

// Revenue Management Routes
router.get("/revenue/rules", async (req, res) => {
    try {
        const rules = await arService.listRevenueRules();
        res.json(rules);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Failed to list revenue rules" });
    }
});

router.post("/revenue/rules", async (req, res) => {
    try {
        const data = insertArRevenueRuleSchema.parse(req.body);
        const rule = await arService.createRevenueRule(data);
        res.status(201).json(rule);
    } catch (e) {
        if (e instanceof ZodError) {
            res.status(400).json({ message: "Invalid rule data", errors: e.errors });
        } else {
            res.status(500).json({ message: "Failed to create revenue rule" });
        }
    }
});

router.get("/revenue/schedules", async (req, res) => {
    try {
        const status = req.query.status as string;
        const schedules = await arService.listRevenueSchedules(status);
        res.json(schedules);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Failed to list schedules" });
    }
});

router.post("/revenue/recognize", async (req, res) => {
    try {
        const { scheduleIds } = req.body;
        if (!Array.isArray(scheduleIds)) return res.status(400).json({ message: "scheduleIds must be an array" });

        const results = [];
        for (const id of scheduleIds) {
            try {
                const result = await arService.recognizeRevenue(id);
                results.push({ id, status: "Success", schedule: result });
            } catch (err: any) {
                results.push({ id, status: "Failed", error: err.message });
            }
        }
        res.json(results);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Failed to recognize revenue" });
    }
});

router.post("/revenue/sweep", async (req, res) => {
    try {
        const { periodDate } = req.body;
        const targetDate = periodDate ? new Date(periodDate) : new Date();
        const result = await RevenueWorker.processMonthlySweep(targetDate);
        res.json({ message: "Revenue sweep complete", ...result });
    } catch (e: any) {
        res.status(500).json({ message: e.message || "Failed to sweep revenue" });
    }
});

// Adjustments
router.post("/adjustments", async (req, res) => {
    try {
        const data = insertArAdjustmentSchema.parse(req.body);
        const adjustment = await arService.createAdjustment(data);
        res.status(201).json(adjustment);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ message: "Invalid adjustment data", errors: error.errors });
        } else {
            res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create adjustment" });
        }
    }
});

router.get("/adjustments", async (req, res) => {
    try {
        const { invoiceId } = req.query;
        if (!invoiceId) return res.status(400).json({ message: "invoiceId required" });
        const adjustments = await arService.listAdjustments(invoiceId as string);
        res.json(adjustments);
    } catch (error) {
        res.status(500).json({ message: "Failed to list adjustments" });
    }
});


// AR Period Close & Reconciliation
router.get("/periods", async (req, res) => {
    try {
        const periods = await arService.listPeriods();
        res.json(periods);
    } catch (error) {
        console.error("Error listing AR periods:", error);
        res.status(500).json({ error: "Failed to list periods" });
    }
});

router.post("/periods/:name/close", async (req, res) => {
    try {
        const auditId = "USER-123"; // TODO: Get from session
        const result = await arService.closePeriod(req.params.name, auditId);
        res.json(result);
    } catch (error) {
        console.error("Error closing AR period:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Failed to close period" });
    }
});

router.get("/reconciliation", async (req, res) => {
    try {
        // Placeholder: This would call a reconciliation service method
        // For now, return a mocked summary
        res.json({
            subledgerBalance: 125000,
            glBalance: 125000,
            difference: 0,
            currency: "USD",
            asOf: new Date()
        });
    } catch (error) {
        console.error("Error fetching reconciliation:", error);
        res.status(500).json({ error: "Failed to get reconciliation report" });
    }
});

// System Options
router.get("/system-options/:ledgerId", async (req, res) => {
    try {
        const options = await arService.getSystemOptions(req.params.ledgerId);
        if (!options) return res.status(404).json({ message: "System options not found for this ledger" });
        res.json(options);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
});

router.post("/system-options", async (req, res) => {
    try {
        const data = insertArSystemOptionsSchema.parse(req.body);
        const options = await arService.upsertSystemOptions(data);
        res.json(options);
    } catch (e: any) {
        if (e instanceof ZodError) {
            res.status(400).json({ message: "Invalid options data", errors: e.errors });
        } else {
            res.status(500).json({ message: e.message });
        }
    }
});

export default router;

