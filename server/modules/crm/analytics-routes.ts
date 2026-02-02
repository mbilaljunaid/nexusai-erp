
import { Router } from "express";
import { AnalyticsService } from "../../services/AnalyticsService";

export const analyticsRoutes = Router();

// Get All Executive Metrics
analyticsRoutes.get("/metrics", async (req, res) => {
    try {
        const [pipeline, winRate, service, leaderboard] = await Promise.all([
            AnalyticsService.getPipelineOverview(),
            AnalyticsService.getWinRate(),
            AnalyticsService.getServiceHealth(),
            AnalyticsService.getSalesLeaderboard()
        ]);

        res.json({
            pipeline,
            winRate,
            service,
            leaderboard
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
