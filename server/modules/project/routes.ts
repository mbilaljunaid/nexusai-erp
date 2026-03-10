// @ts-nocheck
import { Express } from "express";

export function registerProjectRoutes(app: Express) {
    const tid = (req: any) => req.user?.tenantId || req.query?.tenantId || "default-tenant";

    // ─── Revenue Recognition ──────────────────────────────────────────────────
    app.post("/api/project/revenue-methods", async (req, res) => {
        try { const { projectRevenueRecognitionService: s } = await import("./project-revenue-recognition.service"); res.status(201).json(await s.setupMethod({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/project/revenue-events", async (req, res) => {
        try { const { projectRevenueRecognitionService: s } = await import("./project-revenue-recognition.service"); res.status(201).json(await s.recognizeRevenue({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/project/revenue-events", async (req, res) => {
        try { const { projectRevenueRecognitionService: s } = await import("./project-revenue-recognition.service"); res.json(await s.getSchedule(tid(req), req.query.projectId as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/project/revenue-summary", async (req, res) => {
        try { const { projectRevenueRecognitionService: s } = await import("./project-revenue-recognition.service"); res.json(await s.getSummary(tid(req), req.query.projectId as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/project/revenue-events/:id/post-gl", async (req, res) => {
        try { const { projectRevenueRecognitionService: s } = await import("./project-revenue-recognition.service"); res.json(await s.postToGL(req.params.id, req.body.postedBy, req.body.glReference)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Funding Limits ───────────────────────────────────────────────────────
    app.post("/api/project/funding-limits", async (req, res) => {
        try { const { fundingLimitService: s } = await import("./funding-and-billing.service"); res.status(201).json(await s.createFundingLimit({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/project/funding-limits", async (req, res) => {
        try { const { fundingLimitService: s } = await import("./funding-and-billing.service"); res.json(await s.listFundingLimits(tid(req), req.query.projectId as string, req.query.status as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/project/funding-utilization", async (req, res) => {
        try { const { fundingLimitService: s } = await import("./funding-and-billing.service"); res.json(await s.getFundingUtilizationReport(tid(req), req.query.projectId as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/project/funding-limits/:id/charge", async (req, res) => {
        try { const { fundingLimitService: s } = await import("./funding-and-billing.service"); res.json(await s.applyCharge(req.params.id, Number(req.body.amount), req.body.chargedBy)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Progress Billing ─────────────────────────────────────────────────────
    app.post("/api/project/billing-schedules", async (req, res) => {
        try { const { progressBillingService: s } = await import("./funding-and-billing.service"); res.status(201).json(await s.createSchedule({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/project/billing-events", async (req, res) => {
        try { const { progressBillingService: s } = await import("./funding-and-billing.service"); res.status(201).json(await s.createBillingEvent({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/project/billing-events", async (req, res) => {
        try { const { progressBillingService: s } = await import("./funding-and-billing.service"); res.json(await s.listEvents(tid(req), req.query.projectId as string, req.query.status as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/project/billing-summary", async (req, res) => {
        try { const { progressBillingService: s } = await import("./funding-and-billing.service"); res.json(await s.getBilledSummary(tid(req), req.query.projectId as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/project/billing-events/:id/approve", async (req, res) => {
        try { const { progressBillingService: s } = await import("./funding-and-billing.service"); res.json(await s.approveEvent(req.params.id, req.body.approvedBy)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/project/billing-events/:id/invoice", async (req, res) => {
        try { const { progressBillingService: s } = await import("./funding-and-billing.service"); res.json(await s.generateInvoice(req.params.id, req.body.invoiceNumber)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Commitment Tracking ──────────────────────────────────────────────────
    app.post("/api/project/commitments", async (req, res) => {
        try { const { commitmentTrackingService: s } = await import("./commitment-and-monitoring.service"); res.status(201).json(await s.createCommitment({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/project/commitments", async (req, res) => {
        try { const { commitmentTrackingService: s } = await import("./commitment-and-monitoring.service"); res.json(await s.listCommitments(tid(req), req.query.projectId as string, req.query.status as string, req.query.type as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/project/commitments/summary", async (req, res) => {
        try { const { commitmentTrackingService: s } = await import("./commitment-and-monitoring.service"); res.json(await s.getCommitmentSummary(tid(req), req.query.projectId as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/project/commitments/:id/invoice", async (req, res) => {
        try { const { commitmentTrackingService: s } = await import("./commitment-and-monitoring.service"); res.json(await s.recordInvoice(req.params.id, Number(req.body.invoicedAmount))); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/project/commitments/:id/close", async (req, res) => {
        try { const { commitmentTrackingService: s } = await import("./commitment-and-monitoring.service"); res.json(await s.closeCommitment(req.params.id)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Resource Plan vs Actuals ─────────────────────────────────────────────
    app.post("/api/project/resource-plans", async (req, res) => {
        try { const { resourcePlanActualsService: s } = await import("./commitment-and-monitoring.service"); res.status(201).json(await s.upsertPlan({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/project/resource-actuals", async (req, res) => {
        try { const { resourcePlanActualsService: s } = await import("./commitment-and-monitoring.service"); res.status(201).json(await s.recordActuals({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/project/resource-variance", async (req, res) => {
        try { const { resourcePlanActualsService: s } = await import("./commitment-and-monitoring.service"); res.json(await s.getVarianceReport(tid(req), req.query.projectId as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Budget Exception Alerts ──────────────────────────────────────────────
    app.get("/api/project/budget-alerts", async (req, res) => {
        try { const { budgetExceptionAlertService: s } = await import("./commitment-and-monitoring.service"); res.json(await s.listAlerts(tid(req), req.query.projectId as string, req.query.acknowledged === 'true')); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/project/budget-alerts/summary", async (req, res) => {
        try { const { budgetExceptionAlertService: s } = await import("./commitment-and-monitoring.service"); res.json(await s.getAlertSummary(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/project/budget-alerts/:id/acknowledge", async (req, res) => {
        try { const { budgetExceptionAlertService: s } = await import("./commitment-and-monitoring.service"); res.json(await s.acknowledge(req.params.id, req.body.acknowledgedBy)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/project/budget-alerts/detect", async (req, res) => {
        try { const { budgetExceptionAlertService: s } = await import("./commitment-and-monitoring.service"); res.json(await s.runExceptionDetection(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
}
