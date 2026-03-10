import { Router } from "express";
import { evmService, cpqService, renewalService } from "../construction/evm-cpq.service";
import { expenseExtService, lcmService, leaseExtService, stagePPMService, glReconService, mdmService, talentExtService } from "./remaining.service";

export function registerRemainingRoutes(app: any) {
    const r = Router();
    const T = (req: any) => req.headers['x-tenant-id'] || req.query.tenantId || 'default';

    // ── EVM ──────────────────────────────────────────────────────────────────
    r.post('/evm/baselines', async (req, res) => { try { res.json(await evmService.createBaseline({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.post('/evm/control-accounts', async (req, res) => { try { res.json(await evmService.upsertControlAccount({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.post('/evm/control-accounts/actuals', async (req, res) => { try { res.json(await evmService.postEVMActuals(req.body.baselineId, req.body.wbsCode, req.body.earnedValue, req.body.actualCost)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/evm/baselines/:id/metrics', async (req, res) => { try { res.json(await evmService.getMetrics(req.params.id)); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ── Drawing Register ──────────────────────────────────────────────────────
    r.post('/drawings', async (req, res) => { try { res.json(await evmService.createDrawing({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.put('/drawings/:id/approve', async (req, res) => { try { res.json(await evmService.approveDrawing(req.params.id, req.body.approvedBy)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/drawings', async (req, res) => { try { res.json(await evmService.listDrawings(T(req), req.query.projectId as string, req.query.status as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ── CPQ ──────────────────────────────────────────────────────────────────
    r.post('/cpq/quotes', async (req, res) => { try { res.json(await cpqService.createQuote({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.post('/cpq/quotes/:id/lines', async (req, res) => { try { res.json(await cpqService.addLine({ tenantId: T(req), quoteId: req.params.id, ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.post('/cpq/quotes/:id/transition', async (req, res) => { try { res.json(await cpqService.transition(req.params.id, req.body.action, req.body.actor)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/cpq/quotes', async (req, res) => { try { res.json(await cpqService.list(T(req), req.query.status as string, req.query.customerId as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ── Renewal ───────────────────────────────────────────────────────────────
    r.post('/renewals', async (req, res) => { try { res.json(await renewalService.upsert({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.post('/renewals/:id/renew', async (req, res) => { try { res.json(await renewalService.renew(req.params.id, req.body.renewedBy, req.body.notes)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/renewals/upcoming', async (req, res) => { try { res.json(await renewalService.getUpcoming(T(req), Number(req.query.daysAhead ?? 30))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/renewals', async (req, res) => { try { res.json(await renewalService.list(T(req), req.query.status as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ── Expense / Mileage ─────────────────────────────────────────────────────
    r.post('/travel/prereqs', async (req, res) => { try { res.json(await expenseExtService.createTravelRequest({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.post('/travel/prereqs/:id/transition', async (req, res) => { try { res.json(await expenseExtService.transitionTravel(req.params.id, req.body.action, req.body.actor)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/travel/prereqs', async (req, res) => { try { res.json(await expenseExtService.listTravel(T(req), req.query.employeeId as string, req.query.status as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.post('/travel/mileage', async (req, res) => { try { res.json(await expenseExtService.createMileageLog({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/travel/mileage', async (req, res) => { try { res.json(await expenseExtService.listMileage(T(req), req.query.employeeId as string, req.query.status as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/travel/mileage/summary', async (req, res) => { try { res.json(await expenseExtService.getMileageSummary(T(req), req.query.employeeId as string, req.query.period as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ── LCM ───────────────────────────────────────────────────────────────────
    r.post('/lcm/drawback/claims', async (req, res) => { try { res.json(await lcmService.createDrawbackClaim({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.post('/lcm/drawback/:id/file', async (req, res) => { try { res.json(await lcmService.fileDrawback(req.params.id)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.post('/lcm/drawback/:id/approve', async (req, res) => { try { res.json(await lcmService.approveDrawback(req.params.id)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/lcm/drawback/claims', async (req, res) => { try { res.json(await lcmService.listClaims(T(req), req.query.status as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.post('/lcm/ctpat', async (req, res) => { try { res.json(await lcmService.createCTPATAssessment({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.put('/lcm/ctpat/:id', async (req, res) => { try { res.json(await lcmService.updateCTPAT(req.params.id, req.body.status, req.body.score, req.body.findings ?? [])); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/lcm/ctpat', async (req, res) => { try { res.json(await lcmService.listCTPAT(T(req), req.query.partnerId as string, req.query.status as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ── Lease Ext ─────────────────────────────────────────────────────────────
    r.post('/lease/modifications', async (req, res) => { try { res.json(await leaseExtService.createModification({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/lease/modifications', async (req, res) => { try { res.json(await leaseExtService.listModifications(T(req), req.query.leaseId as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.post('/lease/subleases', async (req, res) => { try { res.json(await leaseExtService.createSublease({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/lease/subleases', async (req, res) => { try { res.json(await leaseExtService.listSubleases(T(req), req.query.parentLeaseId as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ── Stage-Gate PPM ────────────────────────────────────────────────────────
    r.post('/ppm/gates', async (req, res) => { try { res.json(await stagePPMService.createGate({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.put('/ppm/gates/:id/review', async (req, res) => { try { res.json(await stagePPMService.reviewGate(req.params.id, req.body.reviewer, req.body.status, req.body.criteriaUpdates ?? [], req.body.notes)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/ppm/gates', async (req, res) => { try { res.json(await stagePPMService.getProjectGates(T(req), req.query.projectId as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.post('/ppm/milestones', async (req, res) => { try { res.json(await stagePPMService.createMilestoneBilling({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.post('/ppm/milestones/:id/trigger', async (req, res) => { try { res.json(await stagePPMService.triggerMilestoneBilling(req.params.id, req.body.invoiceId)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/ppm/milestones', async (req, res) => { try { res.json(await stagePPMService.listMilestones(T(req), req.query.projectId as string, req.query.status as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ── GL Recon ─────────────────────────────────────────────────────────────
    r.post('/gl-recon/runs', async (req, res) => { try { res.json(await glReconService.runRecon({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/gl-recon/runs', async (req, res) => { try { res.json(await glReconService.listRuns(T(req), req.query.period as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ── MDM ───────────────────────────────────────────────────────────────────
    r.post('/mdm/quality', async (req, res) => { try { res.json(await mdmService.score({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/mdm/quality/summary', async (req, res) => { try { res.json(await mdmService.getSummary(T(req))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/mdm/quality/underperformers', async (req, res) => { try { res.json(await mdmService.getUnderperformers(T(req), req.query.entityType as string || 'CUSTOMER', Number(req.query.threshold ?? 70))); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    // ── Talent ────────────────────────────────────────────────────────────────
    r.post('/talent/goals', async (req, res) => { try { res.json(await talentExtService.createGoal({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.put('/talent/goals/:id/progress', async (req, res) => { try { res.json(await talentExtService.updateProgress(req.params.id, req.body.progressPct)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/talent/goals/tree', async (req, res) => { try { res.json(await talentExtService.getGoalTree(T(req), req.query.employeeId as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.post('/talent/nine-box', async (req, res) => { try { res.json(await talentExtService.createNineBox({ tenantId: T(req), ...req.body })); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.get('/talent/nine-box', async (req, res) => { try { res.json(await talentExtService.getNineBoxGrid(T(req), req.query.period as string)); } catch (e: any) { res.status(500).json({ error: e.message }); } });
    r.delete('/talent/nine-box/gdpr-purge', async (req, res) => { try { res.json(await talentExtService.purgeGDPRExpired(T(req))); } catch (e: any) { res.status(500).json({ error: e.message }); } });

    app.use('/api/ext', r);
}
