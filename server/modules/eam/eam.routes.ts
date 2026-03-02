import { Router } from "express";
import { permitToWorkService, cbmService, meterPMService } from "./eam.service";

export function registerEAMRoutes(app: any) {
    const r = Router();
    const T = (req: any) => req.headers['x-tenant-id'] || req.query.tenantId || 'default';
    const INV = (req: any) => (req.headers['x-inventory-org-id'] as string) || undefined;

    // ── Permit-to-Work ────────────────────────────────────────────────────
    r.post('/permits', async (req, res) => {
        try { res.json(await permitToWorkService.create({ tenantId: T(req), entInventoryOrgId: INV(req), ...req.body })); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/permits', async (req, res) => {
        try { res.json(await permitToWorkService.list(T(req), req.query.status as string, req.query.permitType as string)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/permits/expiring', async (req, res) => {
        try { res.json(await permitToWorkService.getExpiring(T(req), Number(req.query.hours ?? 24))); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/permits/asset/:assetId', async (req, res) => {
        try { res.json(await permitToWorkService.listByAsset(T(req), req.params.assetId, req.query.status as string)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.post('/permits/:id/transition', async (req, res) => {
        try { res.json(await permitToWorkService.transition(req.params.id, req.body.actor, req.body.action, req.body.note)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.post('/permits/:id/extend', async (req, res) => {
        try { res.json(await permitToWorkService.extend(req.params.id, req.body.newEnd, req.body.requestedBy, req.body.approvedBy)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ── CBM ────────────────────────────────────────────────────────────────
    r.post('/cbm/thresholds', async (req, res) => {
        try { res.json(await cbmService.upsertThreshold({ tenantId: T(req), entInventoryOrgId: INV(req), ...req.body })); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.post('/cbm/readings', async (req, res) => {
        try { res.json(await cbmService.recordReading({ tenantId: T(req), entInventoryOrgId: INV(req), ...req.body })); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/cbm/trend', async (req, res) => {
        try { res.json(await cbmService.getTrend(T(req), req.query.assetId as string, req.query.parameterName as string, Number(req.query.limit ?? 50))); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/cbm/alerts', async (req, res) => {
        try { res.json(await cbmService.getActiveAlerts(T(req))); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ── Meter PM ───────────────────────────────────────────────────────────
    r.post('/meters', async (req, res) => {
        try { res.json(await meterPMService.createMeter({ tenantId: T(req), entInventoryOrgId: INV(req), ...req.body })); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/meters', async (req, res) => {
        try { res.json(await meterPMService.listMeters(T(req), req.query.assetId as string)); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.post('/meters/:id/readings', async (req, res) => {
        try { res.json(await meterPMService.recordReading({ tenantId: T(req), meterId: req.params.id, entInventoryOrgId: INV(req), ...req.body })); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.post('/meters/schedules', async (req, res) => {
        try { res.json(await meterPMService.createSchedule({ tenantId: T(req), entInventoryOrgId: INV(req), ...req.body })); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    r.get('/meters/schedules/due', async (req, res) => {
        try { res.json(await meterPMService.getDueSchedules(T(req), req.query.includeLeadTime !== 'false')); }
        catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.use('/api/eam', r);
}
