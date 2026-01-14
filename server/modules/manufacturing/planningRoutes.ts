import { Router } from "express";
import { manufacturingPlanningService } from "../../services/ManufacturingPlanningService";
import { insertMrpPlanSchema, insertDemandForecastSchema } from "@shared/schema";
import { z } from "zod";

export function registerManufacturingPlanningRoutes(app: Router) {
    const router = Router();

    // Forecasts
    router.get("/forecasts", async (req, res) => {
        const forecasts = await manufacturingPlanningService.getDemandForecasts();
        res.json(forecasts);
    });

    router.post("/forecasts", async (req, res) => {
        const validated = insertDemandForecastSchema.parse(req.body);
        const result = await manufacturingPlanningService.createDemandForecast(validated);
        res.json(result);
    });

    // MRP Plans
    router.get("/mrp-plans", async (req, res) => {
        const plans = await manufacturingPlanningService.getMrpPlans();
        res.json(plans);
    });

    router.post("/mrp-plans", async (req, res) => {
        const validated = insertMrpPlanSchema.parse(req.body);
        const result = await manufacturingPlanningService.createMrpPlan(validated);
        res.json(result);
    });

    router.post("/mrp-plans/:id/run", async (req, res) => {
        const result = await manufacturingPlanningService.runMRP(req.params.id);
        res.json({ success: true, recommendations: result });
    });

    router.get("/mrp-plans/:id/recommendations", async (req, res) => {
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;
        const result = await manufacturingPlanningService.getRecommendations(req.params.id, limit, offset);
        res.json(result);
    });

    app.use("/api/manufacturing/planning", router);
}
