/**
 * Feature Flag REST Routes
 * Mounted at /api/feature-flags
 */

import { Router, Request, Response } from 'express';
import { featureFlagService } from './feature-flag.service';

const router = Router();

// GET /api/feature-flags — list all flags (optionally filter by tenant_id, module)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { tenant_id, module } = req.query as Record<string, string>;
        const flags = await featureFlagService.list(tenant_id, module);
        res.json({ data: flags, count: flags.length });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/feature-flags/evaluate/:name — evaluate flag for current tenant
router.get('/evaluate/:name', async (req: Request, res: Response) => {
    try {
        const tenantId = (req as any).tenantId || (req.query.tenant_id as string);
        const enabled = await featureFlagService.evaluate(req.params.name, tenantId);
        res.json({ flag: req.params.name, enabled, tenantId });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/feature-flags — create a flag
router.post('/', async (req: Request, res: Response) => {
    try {
        const flag = await featureFlagService.create(req.body);
        res.status(201).json(flag);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /api/feature-flags/:id — update a flag
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const flag = await featureFlagService.update(req.params.id, req.body);
        res.json(flag);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// PATCH /api/feature-flags/:id/toggle — flip enabled bool
router.patch('/:id/toggle', async (req: Request, res: Response) => {
    try {
        const flag = await featureFlagService.toggle(req.params.id);
        res.json(flag);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/feature-flags/:id
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await featureFlagService.delete(req.params.id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
