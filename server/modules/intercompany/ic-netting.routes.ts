import { Router } from "express";
import { nettingService, tpAnalyticsService, icDisputeWbService } from "./netting-dispute.service";

export function registerIntercompanyNettingRoutes(app: any) {
    const r = Router();
    const T = (req: any) => req.headers['x-tenant-id'] || req.query.tenantId || 'default';

    // ── Netting sessions ───────────────────────────────────────────────────
    r.post('/netting/sessions', async (req, res) => {
        try { res.json(await nettingService.createSession({ tenantId: T(req), ...req.body })); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/netting/sessions', async (req, res) => {
        try { res.json(await nettingService.listSessions(T(req), req.query.period as string, req.query.status as string)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.post('/netting/sessions/:sessionId/run', async (req, res) => {
        try { res.json(await nettingService.runNetting(req.params.sessionId, T(req))); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.post('/netting/sessions/:sessionId/settle', async (req, res) => {
        try { res.json(await nettingService.settle(req.params.sessionId, req.body.settledBy, req.body.instructions ?? {})); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.post('/netting/sessions/:sessionId/cancel', async (req, res) => {
        try { res.json(await nettingService.cancel(req.params.sessionId)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ── Transfer Pricing ───────────────────────────────────────────────────
    r.post('/tp/policies', async (req, res) => {
        try { res.json(await tpAnalyticsService.createPolicy({ tenantId: T(req), ...req.body })); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/tp/policies', async (req, res) => {
        try { res.json(await tpAnalyticsService.listPolicies(T(req))); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.post('/tp/analyses', async (req, res) => {
        try { res.json(await tpAnalyticsService.runAnalysis({ tenantId: T(req), ...req.body })); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/tp/analyses', async (req, res) => {
        try { res.json(await tpAnalyticsService.listAnalyses(T(req), req.query.period as string, req.query.flaggedOnly === 'true')); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ── IC Disputes ────────────────────────────────────────────────────────
    r.post('/disputes', async (req, res) => {
        try { res.json(await icDisputeWbService.open({ tenantId: T(req), ...req.body })); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/disputes', async (req, res) => {
        try { res.json(await icDisputeWbService.list(T(req), req.query.status as string, req.query.entity as string)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/disputes/summary', async (req, res) => {
        try { res.json(await icDisputeWbService.getSummary(T(req))); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.post('/disputes/:id/event', async (req, res) => {
        try { res.json(await icDisputeWbService.addEvent(req.params.id, req.body.actor, req.body.action, req.body.note)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.post('/disputes/:id/resolve', async (req, res) => {
        try { res.json(await icDisputeWbService.resolve(req.params.id, req.body.resolvedBy, req.body.resolution)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.use('/api/ic', r);
}
