
import { Router } from "express";
import { SalesForecastingService } from "../../services/SalesForecastingService";

export const forecastingRoutes = Router();

forecastingRoutes.get("/summary", async (req, res) => {
    try {
        const userId = req.query.userId as string; // For testing, allow query param. In prod, use req.user.id
        const period = req.query.period as string;

        if (!userId) return res.status(400).json({ error: "UserId is required" });

        const summary = await SalesForecastingService.getForecastSummary(userId, period);
        res.json(summary);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
