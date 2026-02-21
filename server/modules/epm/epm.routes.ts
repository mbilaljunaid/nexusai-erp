import { Router } from "express";
import { esgPlanningService, budgetaryControlService, narrativeReportingService } from "./epm.service";

export function registerEPMRoutes(app: any) {
    const r = Router();
    const T = (req: any) => req.headers['x-tenant-id'] || req.query.tenantId || 'default';

    // ── ESG Goals ──────────────────────────────────────────────────────────
    r.post('/esg/goals', async (req, res) => {
        try { res.json(await esgPlanningService.createGoal({ tenantId: T(req), ...req.body })); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/esg/goals', async (req, res) => {
        try { res.json(await esgPlanningService.listGoals(T(req), req.query.category as string, req.query.status as string)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/esg/goals/summary', async (req, res) => {
        try { res.json(await esgPlanningService.getSummaryByCategory(T(req))); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/esg/goals/:goalId', async (req, res) => {
        try { res.json(await esgPlanningService.getGoalPerformance(T(req), req.params.goalId)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.post('/esg/actuals', async (req, res) => {
        try { res.json(await esgPlanningService.recordActual({ tenantId: T(req), ...req.body })); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ── Budgetary Control ─────────────────────────────────────────────────
    r.post('/budget/controls', async (req, res) => {
        try { res.json(await budgetaryControlService.upsertControl({ tenantId: T(req), ...req.body })); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/budget/controls', async (req, res) => {
        try { res.json(await budgetaryControlService.list(T(req), req.query.period as string, req.query.costCenter as string)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.post('/budget/check', async (req, res) => {
        try { res.json(await budgetaryControlService.check({ tenantId: T(req), ...req.body })); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/budget/variance', async (req, res) => {
        try { res.json(await budgetaryControlService.getVarianceReport(T(req), req.query.period as string, req.query.budgetVersion as string)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.post('/budget/controls/:id/post-actual', async (req, res) => {
        try { res.json(await budgetaryControlService.postActual(req.params.id, req.body.amount)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ── Narrative Reports ─────────────────────────────────────────────────
    r.post('/narrative/reports', async (req, res) => {
        try { res.json(await narrativeReportingService.createReport({ tenantId: T(req), ...req.body })); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/narrative/reports', async (req, res) => {
        try { res.json(await narrativeReportingService.listReports(T(req), req.query.period as string, req.query.status as string, req.query.reportType as string)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/narrative/reports/:id', async (req, res) => {
        try { res.json(await narrativeReportingService.getReport(req.params.id)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.put('/narrative/reports/:id/sections', async (req, res) => {
        try { res.json(await narrativeReportingService.upsertSection(req.params.id, req.body)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.post('/narrative/reports/:id/transition', async (req, res) => {
        try { res.json(await narrativeReportingService.transition(req.params.id, req.body.action, req.body.actor)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.use('/api/epm', r);
}
