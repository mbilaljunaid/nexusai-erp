// Accounts Payable (AP) API Routes
import express from "express";
import { apService } from "../services/ap";
import { storage } from "../storage";
import { db } from "../db";
import { eq, and } from "drizzle-orm";
import {
    insertApSupplierSchema, insertApInvoiceSchema, insertApPaymentSchema,
    insertApInvoiceLineSchema, insertApPaymentBatchSchema,
    slaJournalHeaders, slaJournalLines
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { aiService } from "../services/ai";
import { treasuryService } from "../services/TreasuryService";

export const apRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- AI Multimodal Capture ---
apRouter.post("/ai-invoice-capture", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        const result = await aiService.processInvoiceExtraction(
            req.file.buffer,
            req.file.mimetype,
            req.file.originalname
        );
        res.json(result);
    } catch (e: any) {
        console.error("[AI Capture Error]", e);
        res.status(500).json({ error: e.message });
    }
});

// --- System Parameters ---
apRouter.get("/system-parameters", async (_req, res) => {
    const params = await apService.getSystemParameters();
    res.json(params || {});
});

apRouter.post("/system-parameters", async (req, res) => {
    try {
        const result = await apService.updateSystemParameters(req.body);
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

// --- Distribution Sets ---
apRouter.get("/distribution-sets", async (_req, res) => {
    const sets = await apService.getDistributionSets();
    res.json(sets);
});

apRouter.post("/distribution-sets", async (req, res) => {
    try {
        const set = await apService.createDistributionSet(req.body);
        res.status(201).json(set);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

// Schema for the compound payload
const createInvoiceSchema = z.object({
    header: insertApInvoiceSchema,
    lines: z.array(insertApInvoiceLineSchema),
});

// Seed demo data
apRouter.post("/seed", async (req, res) => {
    try {
        const result = await apService.seedDemoData();
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to seed AP data" });
    }
});

// Supplier CRUD
apRouter.get("/suppliers", async (req, res) => {
    const list = await storage.listApSuppliers();
    res.json(list);
});

apRouter.get("/suppliers/:id", async (req, res) => {
    const sup = await storage.getApSupplier(req.params.id);
    if (!sup) return res.status(404).json({ error: "Supplier not found" });
    res.json(sup);
});

apRouter.post("/suppliers", async (req, res) => {
    const parse = insertApSupplierSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error);
    const created = await storage.createApSupplier(parse.data as any);
    res.status(201).json(created);
});

apRouter.put("/suppliers/:id", async (req, res) => {
    const parse = insertApSupplierSchema.partial().safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error);
    const updated = await storage.updateApSupplier(req.params.id, parse.data as any);
    if (!updated) return res.status(404).json({ error: "Supplier not found" });
    res.json(updated);
});

apRouter.delete("/suppliers/:id", async (req, res) => {
    const ok = await storage.deleteApSupplier(req.params.id);
    res.json({ deleted: ok });
});

// Toggle credit hold
apRouter.post("/suppliers/:id/hold", async (req, res) => {
    const { hold } = req.body;
    if (typeof hold !== "boolean") return res.status(400).json({ error: "hold must be boolean" });
    const result = await apService.toggleCreditHold(req.params.id, hold);
    if (!result) return res.status(404).json({ error: "Supplier not found" });
    res.json(result);
});

// Invoice CRUD
apRouter.get("/invoices", async (req, res) => {
    const list = await storage.listApInvoices();
    res.json(list);
});

apRouter.get("/invoices/:id", async (req, res) => {
    const inv = await storage.getApInvoice(req.params.id);
    if (!inv) return res.status(404).json({ error: "Invoice not found" });
    res.json(inv);
});

// Schema defined at top


apRouter.post("/invoices", async (req, res) => {
    const parse = createInvoiceSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error);

    try {
        const created = await apService.createInvoice(parse.data);
        res.status(201).json(created);
    } catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
});

apRouter.put("/invoices/:id", async (req, res) => {
    const parse = insertApInvoiceSchema.partial().safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error);
    const updated = await storage.updateApInvoice(req.params.id, parse.data as any);
    if (!updated) return res.status(404).json({ error: "Invoice not found" });
    res.json(updated);
});

apRouter.post("/invoices/:id/validate", async (req, res) => {
    try {
        const result = await apService.validateInvoice(parseInt(req.params.id));
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

apRouter.post("/invoices/:id/match", async (req, res) => {
    try {
        const result = await apService.matchInvoiceToPO(parseInt(req.params.id), req.body);
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

apRouter.get("/invoices/:id/holds", async (req, res) => {
    try {
        const holds = await apService.getInvoiceHolds(parseInt(req.params.id));
        res.json(holds);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

apRouter.post("/invoices/:id/accounting", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const journal = await apService.generateAccounting(id);
        res.json(journal);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

apRouter.get("/invoices/:id/accounting", async (req, res) => {
    const id = req.params.id;
    try {
        const entries = await db.select()
            .from(slaJournalHeaders)
            .where(and(
                eq(slaJournalHeaders.entityId, id),
                eq(slaJournalHeaders.entityTable, "ap_invoices")
            ));

        // Join with lines
        const results = [];
        for (const header of entries) {
            const lines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, header.id));
            results.push({ ...header, lines });
        }

        res.json(results);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

apRouter.post("/holds/:id/release", async (req, res) => {
    try {
        const hold = await apService.releaseHold(parseInt(req.params.id), req.body.releaseCode);
        res.json(hold);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

apRouter.delete("/invoices/:id", async (req, res) => {
    const ok = await storage.deleteApInvoice(req.params.id);
    res.json({ deleted: ok });
});

// Payment apply endpoint
apRouter.post("/payments/apply", async (req, res) => {
    const parse = insertApPaymentSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error);
    const payment = await apService.applyPayment(req.body.invoiceId, parse.data as any);
    if (!payment) return res.status(404).json({ error: "Invoice not found for payment" });
    res.status(201).json(payment);
});

// --- PPR (Payment Process Request) Routes ---

apRouter.get("/payment-batches", async (_req, res) => {
    const list = await apService.listPaymentBatches();
    res.json(list);
});

apRouter.post("/payment-batches", async (req, res) => {
    const parse = insertApPaymentBatchSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error);
    try {
        const batch = await apService.createPaymentBatch(parse.data as any);
        res.status(201).json(batch);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

apRouter.post("/payment-batches/:id/select", async (req, res) => {
    try {
        const result = await apService.selectInvoicesForBatch(parseInt(req.params.id));
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

apRouter.post("/payment-batches/:id/confirm", async (req, res) => {
    try {
        const result = await apService.confirmPaymentBatch(parseInt(req.params.id));
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

apRouter.get("/payment-batches/:id/payments", async (req, res) => {
    try {
        const payments = await apService.getBatchPayments(parseInt(req.params.id));
        res.json(payments);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apRouter.get("/payment-batches/:id/iso20022", async (req, res) => {
    try {
        const batchId = parseInt(req.params.id);
        const xml = await treasuryService.generateISO20022(batchId);

        res.setHeader("Content-Disposition", `attachment; filename=ISO20022_BCH_${batchId}.xml`);
        res.setHeader("Content-Type", "application/xml");
        res.send(xml);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

// --- Reporting ---

apRouter.get("/reports/audit-trail", async (req, res) => {
    try {
        const trail = await apService.getAuditTrail(req.query as any);
        res.json(trail);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apRouter.get("/reports/aging", async (_req, res) => {
    try {
        const aging = await apService.getAgingReport();
        res.json(aging);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// --- Period Control ---

apRouter.get("/periods", async (_req, res) => {
    try {
        const periods = await apService.getPeriods();
        res.json(periods);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apRouter.post("/periods/:id/close", async (req, res) => {
    try {
        const result = await apService.closePeriod(req.params.id, "system"); // Replace with actual userId in real app
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

// --- Prepayments ---

apRouter.get("/invoices/:id/available-prepayments", async (req, res) => {
    try {
        const invoiceId = parseInt(req.params.id);
        const invoice = await apService.getInvoice(req.params.id);
        if (!invoice) return res.status(404).send("Invoice not found");

        const results = await apService.listAvailablePrepayments(invoice.supplierId);
        res.json(results);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apRouter.get("/invoices/:id/prepay-applications", async (req, res) => {
    try {
        const results = await apService.getPrepayApplications(parseInt(req.params.id));
        res.json(results);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apRouter.post("/invoices/:id/apply-prepayment", async (req, res) => {
    try {
        const { prepayId, amount } = req.body;
        const result = await apService.applyPrepayment(parseInt(req.params.id), prepayId, amount, "system");
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

apRouter.delete("/prepay-applications/:id", async (req, res) => {
    try {
        const result = await apService.unapplyPrepayment(parseInt(req.params.id), "system");
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

apRouter.post("/payments/:id/void", async (req, res) => {
    try {
        const result = await apService.voidPayment(parseInt(req.params.id), "system");
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

apRouter.post("/payments/:id/clear", async (req, res) => {
    try {
        const result = await apService.clearPayment(parseInt(req.params.id), "system");
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

export default apRouter;
