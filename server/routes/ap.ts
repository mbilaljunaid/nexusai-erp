import { Router } from "express";
import { apService } from "../services/ap";
import { insertApSupplierSchema, insertApInvoiceSchema, insertApPaymentSchema, insertApApprovalSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// ================= SUPPLIERS =================
router.get("/suppliers", async (req, res) => {
    try {
        const suppliers = await apService.listSuppliers();
        res.json(suppliers);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/suppliers", async (req, res) => {
    try {
        const data = insertApSupplierSchema.parse(req.body);
        const supplier = await apService.createSupplier(data);
        res.json(supplier);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

router.get("/suppliers/:id", async (req, res) => {
    try {
        const supplier = await apService.getSupplier(req.params.id);
        if (!supplier) return res.status(404).json({ message: "Supplier not found" });
        res.json(supplier);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ================= INVOICES =================
router.get("/invoices", async (req, res) => {
    try {
        const invoices = await apService.listInvoices();
        res.json(invoices);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/invoices", async (req, res) => {
    try {
        const data = insertApInvoiceSchema.parse(req.body);
        const invoice = await apService.createInvoice(data);
        res.json(invoice);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

router.get("/invoices/:id", async (req, res) => {
    try {
        const invoice = await apService.getInvoice(req.params.id);
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });
        res.json(invoice);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/invoices/:id/approve", async (req, res) => {
    try {
        // Determine approval status from body or default to Approved
        const { status } = req.body;
        const newStatus = status || "Approved";
        const invoice = await apService.updateInvoice(req.params.id, { status: newStatus });

        // Log approval action (simplified)
        await apService.createApproval({
            invoiceId: req.params.id,
            decision: newStatus,
            approverId: "system", // In a real app, this would be the logged-in user
            comments: req.body.comments || "Approved via API"
        });

        res.json(invoice);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ================= PAYMENTS =================
router.get("/payments", async (req, res) => {
    try {
        const payments = await apService.listPayments();
        res.json(payments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/payments", async (req, res) => {
    try {
        const data = insertApPaymentSchema.parse(req.body);
        const payment = await apService.createPayment(data);

        // Update invoice status to 'Paid' for all linked invoices
        if (payment.invoiceIds) {
            const invoiceIds = payment.invoiceIds.split(",");
            for (const invId of invoiceIds) {
                await apService.updateInvoice(invId.trim(), { status: "Paid" });
            }
        }

        res.json(payment);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// ================= AI ACTIONS (Simulations) =================
router.post("/ai/simulate", async (req, res) => {
    // Placeholder for AI simulation logic (e.g., payment run preview)
    res.json({
        simulationId: "sim_" + Date.now(),
        action: req.body.action,
        predictedOutcome: "Success",
        impact: "Cash outflow +$15,000",
        details: [
            { step: "Validate invoices", status: "Passed" },
            { step: "Check bank balance", status: "Passed" }
        ]
    });
});

export default router;
