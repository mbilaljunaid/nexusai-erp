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

router.delete("/succession/candidates/:candidateId", async (req, res) => {
    try {
        const deleted = await SuccessionService.removeCandidate(req.params.candidateId);
        res.json({ success: true, deleted });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ASSESSMENTS
router.post("/succession/candidates/:candidateId/assess", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const assessorId = (req as any).user?.userId || "system";

        const data = {
            ...req.body,
            candidateId: req.params.candidateId,
            tenantId,
            assessorId
        };

        const assessment = await SuccessionService.assessCandidateReadiness(data);
        res.status(201).json(assessment);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/succession/candidates/:candidateId/assessment-history", async (req, res) => {
    try {
        const history = await SuccessionService.getAssessmentHistory(req.params.candidateId);
        res.json(history);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Update candidate 9-box position
router.patch("/succession/candidates/:candidateId/position", async (req, res) => {
    try {
        const { nineBoxPosition } = req.body;
        const updated = await SuccessionService.updateCandidatePosition(
            req.params.candidateId,
            nineBoxPosition
        );
        res.json(updated);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Auto-position candidate based on latest assessment
router.post("/succession/candidates/:candidateId/auto-position", async (req, res) => {
    try {
        const updated = await SuccessionService.autoPositionCandidate(req.params.candidateId);
        res.json(updated);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get position history for candidate
router.get("/succession/candidates/:candidateId/position-history", async (req, res) => {
    try {
        const history = await SuccessionService.getPositionHistory(req.params.candidateId);
        res.json(history);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
