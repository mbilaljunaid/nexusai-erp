import { Express, Request, Response } from "express";
import { storage } from "../../storage";
import { insertInvoiceSchema, insertPaymentSchema, insertRevenueForecastSchema, insertBudgetAllocationSchema } from "../../../shared/schema";
import { financeService } from "../../services/finance";

export function registerFinanceRoutes(app: Express) {
    // Invoices
    app.get("/api/invoices", async (req, res) => {
        try {
            const invoices = await storage.listInvoices();
            res.json(invoices);
        } catch (error) {
            res.status(500).json({ error: "Failed to list invoices" });
        }
    });

    app.get("/api/invoices/:id", async (req, res) => {
        try {
            const invoice = await storage.getInvoice(req.params.id);
            if (!invoice) return res.status(404).json({ error: "Invoice not found" });
            res.json(invoice);
        } catch (error) {
            res.status(500).json({ error: "Failed to get invoice" });
        }
    });

    app.post("/api/invoices", async (req, res) => {
        try {
            const parseResult = insertInvoiceSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const invoice = await storage.createInvoice(parseResult.data);
            res.status(201).json(invoice);
        } catch (error) {
            res.status(500).json({ error: "Failed to create invoice" });
        }
    });

    // Payments
    app.get("/api/payments", async (req, res) => {
        try {
            const payments = await storage.listPayments(req.query.invoiceId as string);
            res.json(payments);
        } catch (error) {
            res.status(500).json({ error: "Failed to list payments" });
        }
    });

    app.post("/api/payments", async (req, res) => {
        try {
            const parseResult = insertPaymentSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const payment = await storage.createPayment(parseResult.data);
            res.status(201).json(payment);
        } catch (error) {
            res.status(500).json({ error: "Failed to create payment" });
        }
    });

    // Revenue Forecasts
    app.get("/api/financial/forecasts", async (req, res) => {
        try {
            const forecasts = await storage.listRevenueForecasts();
            res.json(forecasts);
        } catch (error) {
            res.status(500).json({ error: "Failed to list forecasts" });
        }
    });

    app.post("/api/financial/forecasts", async (req, res) => {
        try {
            const parseResult = insertRevenueForecastSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const forecast = await storage.createRevenueForecast(parseResult.data);
            res.status(201).json(forecast);
        } catch (error) {
            res.status(500).json({ error: "Failed to create forecast" });
        }
    });

    // Budget Allocations
    app.get("/api/financial/budgets", async (req, res) => {
        try {
            const year = req.query.year ? parseInt(req.query.year as string) : undefined;
            const budgets = await storage.listBudgetAllocations(year);
            res.json(budgets);
        } catch (error) {
            res.status(500).json({ error: "Failed to list budgets" });
        }
    });

    app.post("/api/financial/budgets", async (req, res) => {
        try {
            const parseResult = insertBudgetAllocationSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const budget = await storage.createBudgetAllocation(parseResult.data);
            res.status(201).json(budget);
        } catch (error) {
            res.status(500).json({ error: "Failed to create budget" });
        }
    });
    // Financial Reporting (FSG)
    app.get("/api/gl/reports", async (req, res) => {
        try {
            const reports = await financeService.listReports();
            res.json(reports);
        } catch (error) {
            res.status(500).json({ error: "Failed to list reports" });
        }
    });

    app.get("/api/gl/ledgers", async (req, res) => {
        try {
            const ledgers = await financeService.listLedgers();
            res.json(ledgers);
        } catch (error) {
            res.status(500).json({ error: "Failed to list ledgers" });
        }
    });

    app.get("/api/gl/periods", async (req, res) => {
        try {
            const periods = await financeService.listPeriods();
            res.json(periods);
        } catch (error) {
            res.status(500).json({ error: "Failed to list periods" });
        }
    });

    app.post("/api/gl/reports/generate", async (req, res) => {
        try {
            const { reportId, periodName, ledgerId } = req.body;
            if (!reportId || !periodName) {
                return res.status(400).json({ error: "reportId and periodName are required" });
            }
            const report = await financeService.generateFinancialReport(reportId, periodName, ledgerId);
            res.json(report);
        } catch (error) {
            console.error("FSG Generation Error:", error);
            res.status(500).json({ error: "Failed to generate report" });
        }
    });
    // Revaluation
    app.get("/api/gl/revaluations", async (req, res) => {
        try {
            const ledgerId = (req.query.ledgerId as string) || "primary-ledger-001";
            const runs = await storage.listRevaluations(ledgerId);
            res.json(runs);
        } catch (error) {
            res.status(500).json({ error: "Failed to list revaluation runs" });
        }
    });

    app.post("/api/gl/revaluation", async (req, res) => {
        try {
            const { ledgerId, periodName, currencyCode, rateType, unrealizedGainLossAccountId } = req.body;
            if (!periodName || !currencyCode || !unrealizedGainLossAccountId) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            // Default ledger if missing
            const lid = ledgerId || "primary-ledger-001";
            const result = await financeService.runRevaluation(lid, periodName, currencyCode, rateType || "Spot", unrealizedGainLossAccountId);
            res.json(result);
        } catch (error: any) {
            console.error("Revaluation Error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    // Intercompany Rules
    app.get("/api/gl/intercompany-rules", async (req, res) => {
        try {
            const rules = await financeService.listIntercompanyRules();
            res.json(rules);
        } catch (error) {
            res.status(500).json({ error: "Failed to list intercompany rules" });
        }
    });

    app.post("/api/gl/intercompany-rules", async (req, res) => {
        try {
            const rule = await financeService.createIntercompanyRule(req.body);
            res.status(201).json(rule);
        } catch (error) {
            res.status(500).json({ error: "Failed to create intercompany rule" });
        }
    });
}
