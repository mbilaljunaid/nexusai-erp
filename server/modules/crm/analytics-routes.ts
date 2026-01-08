import { Router } from "express";
import { dbStorage } from "../../storage-db";

const router = Router();

// Pipeline Metrics
router.get("/pipeline", async (req, res) => {
    try {
        const metrics = await dbStorage.getPipelineMetrics();
        res.json(metrics);
    } catch (error) {
        console.error("Failed to fetch pipeline metrics:", error);
        res.status(500).json({ error: "Failed to fetch pipeline metrics" });
    }
});

// Revenue Metrics
router.get("/revenue", async (req, res) => {
    try {
        const metrics = await dbStorage.getRevenueMetrics();
        res.json(metrics);
    } catch (error) {
        console.error("Failed to fetch revenue metrics:", error);
        res.status(500).json({ error: "Failed to fetch revenue metrics" });
    }
});

// Lead Source Metrics
router.get("/lead-sources", async (req, res) => {
    try {
        const metrics = await dbStorage.getLeadSourceMetrics();
        res.json(metrics);
    } catch (error) {
        console.error("Failed to fetch lead source metrics:", error);
        res.status(500).json({ error: "Failed to fetch lead source metrics" });
    }
});

// Case Metrics
router.get("/cases", async (req, res) => {
    try {
        const metrics = await dbStorage.getCaseMetrics();
        res.json(metrics);
    } catch (error) {
        console.error("Failed to fetch case metrics:", error);
        res.status(500).json({ error: "Failed to fetch case metrics" });
    }
});

export const analyticsRoutes = router;
