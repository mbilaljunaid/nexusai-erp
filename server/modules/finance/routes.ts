import { Express, Request, Response } from "express";
import { storage } from "../../storage";
import { insertInvoiceSchema, insertPaymentSchema, insertRevenueForecastSchema, insertBudgetAllocationSchema } from "../../../shared/schema";

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
}
