// server/routes/ar.ts
import { Router } from "express";
import { arService } from "../services/ar";
import { insertArCustomerSchema, insertArInvoiceSchema, insertArReceiptSchema } from "@shared/schema";
import { ZodError } from "zod";

const router = Router();

// Customers
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

// Invoices
router.get("/invoices", async (req, res) => {
    try {
        const invoices = await arService.listInvoices();
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
router.post("/customers/:id/hold", async (req, res) => {
    try {
        const { hold } = req.body;
        const customer = await arService.toggleCreditHold(req.params.id, hold);
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: "Failed to update credit hold" });
    }
});

export default router;
