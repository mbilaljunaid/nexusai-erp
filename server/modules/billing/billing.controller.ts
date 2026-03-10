import { Router } from "express";
import { billingService } from "./BillingService";
import { subscriptionService } from "./SubscriptionService";
import { creditMemoService } from "./CreditMemoService";
import { db } from "../../db";
import { arInvoices, arRevenueSchedules, arDunningTemplates, insertArDunningTemplateSchema, type ArInvoice } from "@shared/schema/ar";
import { eq, sql, gte, and } from "drizzle-orm";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

export const billingRouter = Router();

// Ingest a billing event (from external source)
billingRouter.post("/events", async (req, res) => {
    try {
        const entBusinessUnitId = req.headers["x-business-unit-id"] as string | undefined;
        const event = await billingService.processEvent({ ...req.body, entBusinessUnitId });
        res.json(event);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// List unbilled events (Workbench)
billingRouter.get("/events/pending", async (req, res) => {
    try {
        const entBusinessUnitId = req.headers["x-business-unit-id"] as string | undefined;
        const events = await billingService.getUnbilledEvents(entBusinessUnitId);
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

// List Subscriptions (with pagination and filters)
billingRouter.get("/subscriptions", async (req, res) => {
    try {
        const { status, customerId, limit, offset } = req.query;
        const result = await subscriptionService.getAllSubscriptions({
            status: status as string | undefined,
            customerId: customerId as string | undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined,
        });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Create Subscription
billingRouter.post("/subscriptions", async (req, res) => {
    try {
        const entBusinessUnitId = req.headers["x-business-unit-id"] as string | undefined;
        const sub = await subscriptionService.createSubscription({ ...req.body, entBusinessUnitId });
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

// --- USAGE METERING API ---

const { usageMeteringService } = await import("./UsageMeteringService");

// Meter Management
billingRouter.get("/usage/meters", async (req, res) => {
    try {
        const meters = await usageMeteringService.getMeters();
        res.json(meters);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

billingRouter.post("/usage/meters", async (req, res) => {
    try {
        const meter = await usageMeteringService.createMeter(req.body);
        res.json(meter);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

billingRouter.patch("/usage/meters/:id", async (req, res) => {
    try {
        const meter = await usageMeteringService.updateMeter(req.params.id, req.body);
        res.json(meter);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Usage Event Ingestion
billingRouter.post("/usage/events", async (req, res) => {
    try {
        const event = await usageMeteringService.recordUsageEvent(req.body);
        res.json(event);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Usage Summary (for dashboard)
billingRouter.get("/usage/summary/:customerId", async (req, res) => {
    try {
        const { meterId, period } = req.query;
        const summary = await usageMeteringService.getUsageSummary(
            req.params.customerId,
            meterId as string | undefined,
            (period as 'current' | 'last_30_days') || 'current'
        );
        res.json(summary);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Threshold Management
billingRouter.get("/usage/thresholds", async (req, res) => {
    try {
        const { customerId } = req.query;
        const thresholds = await usageMeteringService.getThresholds(customerId as string | undefined);
        res.json(thresholds);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

billingRouter.post("/usage/thresholds", async (req, res) => {
    try {
        const threshold = await usageMeteringService.createThreshold(req.body);
        res.json(threshold);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Usage Dashboard Metrics
billingRouter.get("/usage/metrics", async (req, res) => {
    try {
        const { customerId } = req.query;
        const metrics = await usageMeteringService.getDashboardMetrics(customerId as string | undefined);
        res.json(metrics);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Generate Billing from Usage
billingRouter.post("/usage/generate-billing", async (req, res) => {
    try {
        const { customerId, periodStart, periodEnd } = req.body;
        const result = await usageMeteringService.generateBillingEventsFromUsage(
            customerId,
            new Date(periodStart),
            new Date(periodEnd)
        );
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// --- REVENUE WATERFALL API ---

// Get Revenue Schedules (real data from ar_revenue_schedules)
billingRouter.get("/revenue/schedules", async (req, res) => {
    try {
        const { invoiceId, status } = req.query;
        let query = db.select().from(arRevenueSchedules);
        const conditions = [];
        if (status) conditions.push(eq(arRevenueSchedules.status, status as string));
        if (invoiceId) conditions.push(eq(arRevenueSchedules.invoiceId, invoiceId as string));
        const schedules = conditions.length > 0
            ? await query.where(and(...conditions))
            : await query;
        res.json(schedules);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// POST Dunning Template
billingRouter.post("/dunning/templates", async (req, res) => {
    try {
        const parsed = insertArDunningTemplateSchema.safeParse({
            ...req.body,
            daysOverdueMin: Number(req.body.daysOverdueMin ?? 0),
            daysOverdueMax: Number(req.body.daysOverdueMax ?? 1000),
        });
        if (!parsed.success) {
            return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
        }
        const [template] = await db.insert(arDunningTemplates).values(parsed.data).returning();
        res.status(201).json(template);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get Revenue Waterfall Summary (for chart)
billingRouter.get("/revenue/waterfall", async (req, res) => {
    try {
        const { customerId } = req.query;

        // Aggregate totals
        const conditions = customerId && customerId !== "all"
            ? [eq(arInvoices.customerId, customerId as string)]
            : [];

        const [totals] = await db.select({
            invoiced: sql<string>`COALESCE(SUM(total_amount), 0)`,
            recognized: sql<string>`COALESCE(SUM(CASE WHEN status = 'Paid' THEN total_amount ELSE 0 END), 0)`,
        })
            .from(arInvoices)
            .where(conditions.length ? and(...conditions) : undefined);

        // Deferred revenue from pending schedules
        const [deferredRow] = await db.select({
            deferred: sql<string>`COALESCE(SUM(amount), 0)`
        })
            .from(arRevenueSchedules)
            .where(eq(arRevenueSchedules.status, "Pending"));

        // Unbilled events
        const unbilledResult = await db.select({
            unbilled: sql<string>`COALESCE(SUM(amount), 0)`
        })
            .from(sql`billing_events`)
            .where(sql`status = 'Pending'`)
            .catch(() => [{ unbilled: "0" }]);

        const invoiced = Number(totals?.invoiced || 0);
        const recognized = Number(totals?.recognized || 0);
        const deferred = Number(deferredRow?.deferred || 0);
        const unbilled = Number(unbilledResult[0]?.unbilled || 0);
        const booked = invoiced * 1.5; // TCV approximation

        // Monthly flow: last 12 months
        const monthlyFlow: Array<{ month: string; booked: number; recognized: number; deferred: number }> = [];
        for (let i = 11; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const mStart = startOfMonth(date);
            const mEnd = endOfMonth(date);

            const [mRow] = await db.select({
                invoiced: sql<string>`COALESCE(SUM(total_amount), 0)`,
                recognized: sql<string>`COALESCE(SUM(CASE WHEN status = 'Paid' THEN total_amount ELSE 0 END), 0)`,
            })
                .from(arInvoices)
                .where(and(
                    gte(arInvoices.createdAt, mStart),
                    sql`${arInvoices.createdAt} <= ${mEnd}`,
                    ...(conditions)
                ));

            const mInvoiced = Number(mRow?.invoiced || 0);
            const mRecognized = Number(mRow?.recognized || 0);

            monthlyFlow.push({
                month: format(date, "MMM yy"),
                booked: Math.round(mInvoiced * 1.5),
                recognized: Math.round(mRecognized),
                deferred: Math.round(mInvoiced - mRecognized),
            });
        }

        res.json({
            booked,
            billed: invoiced,
            invoiced,
            recognized,
            deferred,
            unbilled,
            totalDeferred: deferred,
            recognizedMTD: recognized * 0.3,
            upcomingRecognition: deferred * 0.4,
            complianceScore: 98,
            monthlyFlow,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// --- CREDIT MEMO LIST API ---

billingRouter.get("/credit-memos", async (req, res) => {
    try {
        const { customerId, status, limit, offset } = req.query;

        // Query credit memos (invoices with transactionClass = 'CM')
        let query = db.select().from(arInvoices)
            .where(eq(arInvoices.transactionClass, "CM"));

        const creditMemos = await query
            .limit(limit ? parseInt(limit as string) : 50)
            .offset(offset ? parseInt(offset as string) : 0);

        res.json({
            data: creditMemos,
            total: creditMemos.length
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

billingRouter.post("/credit-memos/:id/approve", async (req, res) => {
    try {
        const [updated] = await db.update(arInvoices)
            .set({ status: "Approved" })
            .where(eq(arInvoices.id, req.params.id))
            .returning();
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

billingRouter.post("/credit-memos/:id/reject", async (req, res) => {
    try {
        const { reason } = req.body;
        const [updated] = await db.update(arInvoices)
            .set({ status: "Rejected", description: reason })
            .where(eq(arInvoices.id, req.params.id))
            .returning();
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});
