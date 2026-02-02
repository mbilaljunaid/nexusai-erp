import { Router } from "express";
import { billingService } from "./BillingService";
import { subscriptionService } from "./SubscriptionService";
import { creditMemoService } from "./CreditMemoService";
import { db } from "../../db";
import { arInvoices, type ArInvoice } from "@shared/schema/ar";
import { eq } from "drizzle-orm";

export const billingRouter = Router();

// Ingest a billing event (from external source)
billingRouter.post("/events", async (req, res) => {
    try {
        const event = await billingService.processEvent(req.body);
        res.json(event);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// List unbilled events (Workbench)
billingRouter.get("/events/pending", async (req, res) => {
    try {
        const events = await billingService.getUnbilledEvents();
        res.json(events);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Trigger Auto-Invoice
billingRouter.post("/process-batch", async (req, res) => {
    try {
        const userId = (req as any).user?.id || "System"; // Fallback if auth missing
        const result = await billingService.runAutoInvoice(userId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// --- DASHBOARD METRICS ---

billingRouter.get("/metrics", async (req, res) => {
    try {
        const metrics = await billingService.getDashboardMetrics();
        res.json(metrics);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// --- INTELLIGENCE (ANOMALIES) ---

billingRouter.get("/anomalies", async (req, res) => {
    try {
        const anomalies = await billingService.getAnomalies();
        res.json(anomalies);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

billingRouter.post("/anomalies/scan", async (req, res) => {
    try {
        const result = await billingService.detectAnomalies();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// --- ADJUSTMENTS & APPROVALS (PHASE VI/VII) ---

billingRouter.post("/credit-memo", async (req, res) => {
    try {
        const { invoiceId, amount, reason } = req.body;
        const cm = await creditMemoService.createCreditMemo(invoiceId, amount, reason, (req as any).user?.id);
        res.json(cm);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

billingRouter.post("/invoices/:id/approve", async (req, res) => {
    try {
        const invoiceId = req.params.id;

        // Fetch Invoice to check Amount
        const [invoice] = await db.select().from(arInvoices).where(eq(arInvoices.id, invoiceId));
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });

        // Tiered Approval Logic
        // Limit: $10,000
        const limit = 10000;
        let newStatus = "Issued";

        if (Number(invoice.totalAmount) > limit) {
            // Check if user has VP Role (Mocked)
            // For now, we enforce a 2-step flow.
            // If current status is 'Draft', it goes to 'Pending VP Approval'.
            // If status is 'Pending VP Approval', it goes to 'Issued'.

            if (invoice.status === 'Pending VP Approval') {
                newStatus = "Issued"; // VP Approved
            } else {
                newStatus = "Pending VP Approval";
            }
        }

        const [updated] = await db.update(arInvoices)
            .set({ status: newStatus })
            .where(eq(arInvoices.id, invoiceId))
            .returning();

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// --- BILLING PROFILES ---

billingRouter.get("/profiles", async (req, res) => {
    try {
        const profiles = await billingService.getProfiles();
        res.json(profiles);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

billingRouter.post("/profiles", async (req, res) => {
    try {
        const profile = await billingService.createProfile(req.body);
        res.json(profile);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

billingRouter.patch("/profiles/:id", async (req, res) => {
    try {
        const profile = await billingService.updateProfile(req.params.id, req.body);
        res.json(profile);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});


// --- SUBSCRIPTION MANAGEMENT API ---

// Create Subscription
billingRouter.post("/subscriptions", async (req, res) => {
    try {
        const sub = await subscriptionService.createSubscription(req.body);
        res.json(sub);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get Subscription Details
billingRouter.get("/subscriptions/:id", async (req, res) => {
    try {
        const sub = await subscriptionService.getSubscription(req.params.id);
        if (!sub) return res.status(404).json({ message: "Not Found" });
        res.json(sub);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Amend
billingRouter.post("/subscriptions/:id/amend", async (req, res) => {
    try {
        const sub = await subscriptionService.amendSubscription(req.params.id, req.body);
        res.json(sub);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Renew
billingRouter.post("/subscriptions/:id/renew", async (req, res) => {
    try {
        const sub = await subscriptionService.renewSubscription(req.params.id);
        res.json(sub);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Terminate
billingRouter.post("/subscriptions/:id/terminate", async (req, res) => {
    try {
        const result = await subscriptionService.terminateSubscription(req.params.id, req.body.reason);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Run Billing Cycle
billingRouter.post("/subscriptions/process-billing", async (req, res) => {
    try {
        const result = await subscriptionService.generateBillingEvents();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});
