// @ts-nocheck
import { Express } from "express";

export function registerHRAnalyticsRoutes(app: Express) {
    const tid = (req: any) => req.user?.tenantId || req.query?.tenantId || "default-tenant";

    // ─── Gender Pay Gap / Pay Equity ─────────────────────────────────────────
    app.post("/api/hr-analytics/pay-equity/snapshots", async (req, res) => {
        try { const { genderPayGapService: s } = await import("./pay-equity.service"); res.status(201).json(await s.upsertSnapshot({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/hr-analytics/pay-equity/unadjusted", async (req, res) => {
        try { const { genderPayGapService: s } = await import("./pay-equity.service"); res.json(await s.getUnadjustedGap(tid(req), req.query.period as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/hr-analytics/pay-equity/adjusted", async (req, res) => {
        try { const { genderPayGapService: s } = await import("./pay-equity.service"); res.json(await s.getAdjustedGap(tid(req), req.query.period as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/hr-analytics/pay-equity/department", async (req, res) => {
        try { const { genderPayGapService: s } = await import("./pay-equity.service"); res.json(await s.getDepartmentBreakdown(tid(req), req.query.period as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/hr-analytics/pay-equity/periods", async (req, res) => {
        try { const { genderPayGapService: s } = await import("./pay-equity.service"); res.json(await s.getPeriods(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Workforce Benchmarking ───────────────────────────────────────────────
    app.post("/api/hr-analytics/benchmarks", async (req, res) => {
        try { const { workforceBenchmarkingService: s } = await import("./pay-equity.service"); res.status(201).json(await s.upsertBenchmark({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/hr-analytics/benchmarks", async (req, res) => {
        try { const { workforceBenchmarkingService: s } = await import("./pay-equity.service"); res.json(await s.listBenchmarks(tid(req), req.query.jobFamily as string, req.query.country as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/hr-analytics/benchmarks/compa-ratio", async (req, res) => {
        try { const { workforceBenchmarkingService: s } = await import("./pay-equity.service"); res.json(await s.getCompaRatioReport(tid(req), req.query.period as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Attrition Prediction ─────────────────────────────────────────────────
    app.post("/api/hr-analytics/attrition/score", async (req, res) => {
        try { const { attritionPredictionService: s } = await import("./attrition-prediction.service"); res.status(201).json(await s.scoreAndSave({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/hr-analytics/attrition/high-risk", async (req, res) => {
        try { const { attritionPredictionService: s } = await import("./attrition-prediction.service"); res.json(await s.getHighRiskEmployees(tid(req), req.query.band as string, Number(req.query.limit ?? 50))); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/hr-analytics/attrition/distribution", async (req, res) => {
        try { const { attritionPredictionService: s } = await import("./attrition-prediction.service"); res.json(await s.getRiskDistribution(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/hr-analytics/attrition/employees/:id/history", async (req, res) => {
        try { const { attritionPredictionService: s } = await import("./attrition-prediction.service"); res.json(await s.getEmployeeHistory(tid(req), req.params.id)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── FCPA Training ────────────────────────────────────────────────────────
    app.post("/api/hr-analytics/fcpa/assign", async (req, res) => {
        try { const { fcpaTrainingTrackerService: s } = await import("./fcpa-and-regcal.service"); res.status(201).json(await s.assignTraining({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/hr-analytics/fcpa/bulk-assign", async (req, res) => {
        try { const { fcpaTrainingTrackerService: s } = await import("./fcpa-and-regcal.service"); res.status(201).json(await s.bulkAssign(tid(req), req.body.employeeIds, req.body.trainingModule, req.body.requiredBy, req.body.passingScorePct)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/hr-analytics/fcpa/assignments/:id/start", async (req, res) => {
        try { const { fcpaTrainingTrackerService: s } = await import("./fcpa-and-regcal.service"); res.json(await s.startTraining(req.params.id)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/hr-analytics/fcpa/assignments/:id/complete", async (req, res) => {
        try { const { fcpaTrainingTrackerService: s } = await import("./fcpa-and-regcal.service"); res.json(await s.completeTraining(req.params.id, req.body.scorePct, req.body.certificateUrl)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/hr-analytics/fcpa/assignments/:id/exempt", async (req, res) => {
        try { const { fcpaTrainingTrackerService: s } = await import("./fcpa-and-regcal.service"); res.json(await s.exemptEmployee(req.params.id, req.body.reason)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/hr-analytics/fcpa/overdue-sweep", async (req, res) => {
        try { const { fcpaTrainingTrackerService: s } = await import("./fcpa-and-regcal.service"); res.json(await s.runOverdueSweep(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/hr-analytics/fcpa/assignments", async (req, res) => {
        try { const { fcpaTrainingTrackerService: s } = await import("./fcpa-and-regcal.service"); res.json(await s.listAssignments(tid(req), req.query.employeeId as string, req.query.status as string, req.query.module as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/hr-analytics/fcpa/summary", async (req, res) => {
        try { const { fcpaTrainingTrackerService: s } = await import("./fcpa-and-regcal.service"); res.json(await s.getComplianceSummary(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Regulatory Calendar ──────────────────────────────────────────────────
    app.post("/api/hr-analytics/regcal/events", async (req, res) => {
        try { const { regulatoryCalendarService: s } = await import("./fcpa-and-regcal.service"); res.status(201).json(await s.createEvent({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/hr-analytics/regcal/events", async (req, res) => {
        try { const { regulatoryCalendarService: s } = await import("./fcpa-and-regcal.service"); res.json(await s.listEvents(tid(req), req.query.regulation as string, req.query.status as string, req.query.from as string, req.query.to as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/hr-analytics/regcal/due-soon", async (req, res) => {
        try { const { regulatoryCalendarService: s } = await import("./fcpa-and-regcal.service"); res.json(await s.getDueSoon(tid(req), Number(req.query.days ?? 30))); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/hr-analytics/regcal/by-regulation", async (req, res) => {
        try { const { regulatoryCalendarService: s } = await import("./fcpa-and-regcal.service"); res.json(await s.getUpcomingByRegulation(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/hr-analytics/regcal/events/:id/status", async (req, res) => {
        try { const { regulatoryCalendarService: s } = await import("./fcpa-and-regcal.service"); res.json(await s.updateStatus(req.params.id, req.body.status, req.body.completedBy)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/hr-analytics/regcal/overdue-sweep", async (req, res) => {
        try { const { regulatoryCalendarService: s } = await import("./fcpa-and-regcal.service"); res.json(await s.runOverdueSweep(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
}
