
import { Router } from "express";
import { HRPredictiveService } from "../services/HRPredictiveService";

const router = Router();

// GET /api/hr/predictive/attrition
// Returns prediction data for attrition risk
router.get("/attrition", async (req, res) => {
    try {
        const tenantId = (req.query.tenantId as string) || "default";
        const prediction = await HRPredictiveService.getAttritionForecast(tenantId);
        res.json(prediction);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/hr/predictive/train
// Trigger model training (Mock V1)
router.post("/train", async (req, res) => {
    try {
        const tenantId = (req.body.tenantId as string) || "default";
        const { kpiCode } = req.body;

        if (!kpiCode) return res.status(400).json({ error: "kpiCode is required" });

        const result = await HRPredictiveService.trainModel(tenantId, kpiCode);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
