import { Router } from "express";
import { HRAnalyticsService } from "../services/HRAnalyticsService";

const router = Router();

// GET /api/hr/analytics/dashboard?tenantId=...
// Returns the latest snapshot values for all active KPIs
router.get("/dashboard", async (req, res) => {
    try {
        const tenantId = (req.query.tenantId as string) || "default";

        // 1. Get Metrics
        const metrics = await HRAnalyticsService.getDashboardMetrics(tenantId);

        // 2. Format for Frontend
        // Grouping or just raw list? Let's return the list and let frontend handle it for now.
        // Or we can shape it to match the dashboard expectation.
        // Frontend expects: { totalHeadcount: 100, turnover: 2.4, ... }

        // Let's return a structured object for easier consumption
        const response: any = {
            metrics: {},
            trends: [] // Future: Time series data
        };

        metrics.forEach((m: any) => {
            response.metrics[m.code] = {
                label: m.name,
                value: Number(m.value),
                date: m.snapshot_date,
                dimensions: m.dimensions
            };
        });

        res.json(response);
    } catch (error: any) {
        console.error("Error fetching HR analytics:", error);
        res.status(500).json({ error: error.message });
    }

});

// GET /api/hr/analytics/details/:kpiCode
// Returns granular data for drill-down
router.get("/details/:kpiCode", async (req, res) => {
    try {
        const tenantId = (req.query.tenantId as string) || "default";
        const { kpiCode } = req.params;

        let data: any[] = [];

        switch (kpiCode) {
            case "HR_HEADCOUNT":
                data = await HRAnalyticsService.getHeadcountDetails(tenantId);
                break;
            case "HR_ATTRITION_VOL":
                data = await HRAnalyticsService.getAttritionDetails(tenantId);
                break;
            default:
                return res.json({ message: "Drill-down not implemented for this metric" });
        }

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/hr/analytics/snapshot/run
// Manually triggers a snapshot generation (Admin/Debug only)
router.post("/snapshot/run", async (req, res) => {
    try {
        const tenantId = (req.body.tenantId as string) || "default";
        const results = await HRAnalyticsService.generateDailySnapshot(tenantId);
        res.json({ success: true, snapshotsGenerated: results.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
