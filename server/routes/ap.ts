// Accounts Payable (AP) API Routes
import express from "express";
import { apService } from "../services/ap";
import { storage } from "../storage";
import { insertApSupplierSchema, insertApInvoiceSchema, insertApPaymentSchema } from "@shared/schema/ap";
import { z } from "zod";

export const apRouter = express.Router();

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

apRouter.post("/invoices", async (req, res) => {
    const parse = insertApInvoiceSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error);
    const created = await storage.createApInvoice(parse.data as any);
    res.status(201).json(created);
});

apRouter.put("/invoices/:id", async (req, res) => {
    const parse = insertApInvoiceSchema.partial().safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error);
    const updated = await storage.updateApInvoice(req.params.id, parse.data as any);
    if (!updated) return res.status(404).json({ error: "Invoice not found" });
    res.json(updated);
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

export default apRouter;
