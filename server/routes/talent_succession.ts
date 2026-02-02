import { Router } from "express";
import { SuccessionService } from "../services/SuccessionService";

const router = Router();

// PLANS
router.get("/succession/plans", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const plans = await SuccessionService.getPlans(tenantId);
        res.json(plans);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/succession/plans", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const data = { ...req.body, tenantId };
        const plan = await SuccessionService.createPlan(data);
        res.status(201).json(plan);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POOLS
router.get("/succession/pools", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const pools = await SuccessionService.getPools(tenantId);
        res.json(pools);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/succession/pools", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const data = { ...req.body, tenantId };
        const pool = await SuccessionService.createPool(data);
        res.status(201).json(pool);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// CANDIDATES (Successors)
router.get("/succession/plans/:id/candidates", async (req, res) => {
    try {
        const candidates = await SuccessionService.getCandidates(req.params.id);
        res.json(candidates);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/succession/plans/:id/candidates", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const data = { ...req.body, planId: req.params.id, tenantId };
        const candidate = await SuccessionService.addCandidate(data);
        res.status(201).json(candidate);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
