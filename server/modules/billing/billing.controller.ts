import { Router } from "express";
import { billingService } from "./BillingService";

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
