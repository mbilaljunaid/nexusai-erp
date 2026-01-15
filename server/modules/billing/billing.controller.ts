import { Router } from "express";
import { billingService } from "./BillingService";
import { subscriptionService } from "./SubscriptionService";

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
