
import { Router } from "express";
import { arService } from "../services/ar";
import { storage } from "../storage";
import { db } from "../db";
import { arCustomers } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Mock Auth Middleware for Portal
// In real app, we'd use JWT signed sessions. 
// For this MVP, we will use a simple header 'x-portal-customer-id' or a session cookie mocked.
// Let's implement a simple login that returns the Customer ID to be stored in client localStorage.

router.post("/login", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        // Find customer by email
        // Note: Our arCustomers schema has contactEmail.
        const [customer] = await db.select().from(arCustomers).where(eq(arCustomers.contactEmail, email));

        if (!customer) {
            return res.status(401).json({ message: "Invalid email or customer not found" });
        }

        // Return "Token" (Just the ID for this demo)
        res.json({
            token: customer.id,
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.contactEmail
            }
        });
    } catch (error) {
        console.error("Portal Login Error:", error);
        res.status(500).json({ message: "Internal login error" });
    }
});

// Middleware to check portal auth
const requirePortalAuth = async (req: any, res: any, next: any) => {
    const customerId = req.headers['x-portal-token'];
    if (!customerId) return res.status(401).json({ message: "Unauthorized" });

    // Verify existence?
    req.portalCustomerId = customerId;
    next();
};

router.get("/me", requirePortalAuth, async (req: any, res) => {
    try {
        const customer = await arService.getCustomer(req.portalCustomerId);
        if (!customer) return res.status(404).json({ message: "Customer not found" });

        // Calculate Summary Stats
        const invoices = await arService.listInvoices();
        const myInvoices = invoices.filter(i => i.customerId === customer.id);
        const outstanding = myInvoices
            .filter(i => i.status !== "Paid" && i.status !== "Cancelled")
            .reduce((sum, i) => sum + Number(i.totalAmount), 0); // Need to subtract applied amount ideally

        // Refined Outstanding: existing getAccountBalance is per Account. Customer might have multiple.
        // Let's iterate accounts.
        const accounts = await arService.listAccounts(customer.id);
        let totalOutstanding = 0;
        let totalOverdue = 0;

        for (const acc of accounts) {
            const bal = await arService.getAccountBalance(acc.id);
            totalOutstanding += bal.outstanding;

            // Calc overdue
            const accInvs = invoices.filter(i => i.accountId === acc.id && i.status === "Overdue");
            totalOverdue += accInvs.reduce((sum, i) => sum + Number(i.totalAmount), 0);
        }

        res.json({
            ...customer,
            stats: {
                outstanding: totalOutstanding,
                overdue: totalOverdue,
                openInvoiceCount: myInvoices.filter(i => i.status !== "Paid").length
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});

router.get("/invoices", requirePortalAuth, async (req: any, res) => {
    try {
        const allInvoices = await arService.listInvoices();
        // Filter by customer
        const mine = allInvoices.filter(i => i.customerId === req.portalCustomerId);
        // Sort by Date desc
        mine.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        res.json(mine);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch invoices" });
    }
});

router.post("/pay", requirePortalAuth, async (req: any, res) => {
    try {
        const { invoiceId, amount, paymentMethodId } = req.body;
        // Validate invoice belongs to customer
        const invoice = await arService.getInvoice(invoiceId);
        if (!invoice || invoice.customerId !== req.portalCustomerId) {
            return res.status(403).json({ message: "Invalid invoice" });
        }

        // Create Receipt
        // We'll auto-apply to this invoice
        const receipt = await arService.createReceipt({
            customerId: req.portalCustomerId,
            accountId: invoice.accountId,
            receiptNumber: `PAY-${Date.now()}`,
            amount: String(amount),
            receiptDate: new Date(),
            receiptMethodId: paymentMethodId || "CREDIT_CARD",
            status: "Applied",
            currency: invoice.currency || "USD",
            invoiceId: invoice.id
        } as any);

        res.json({ success: true, receiptId: receipt.id });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Payment failed" });
    }
});

export default router;
