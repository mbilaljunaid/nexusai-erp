import { Router } from "express";
import { HRAnalyticsService } from "../services/HRAnalyticsService";
import { db } from "../db";
import { hrOrganizations } from "@shared/schema/hr_structures";
import { eq, and } from "drizzle-orm";

const router = Router();

function parseQueryInt(val: any, defaultVal: number): number {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? defaultVal : parsed;
}

// GET /api/hr/analytics/dashboard?tenantId=...
// Returns the latest snapshot values for all active KPIs
router.get("/dashboard", async (req, res) => {
    try {
        const tenantId = (req.query.tenantId as string) || "default";
        const departmentId = req.query.departmentId as string | undefined;
        const leId = req.headers['x-legal-entity-id'] as string | undefined;

        // 1. Get Metrics (with optional filter)
        const { metrics: metricRows, benchmark } = await HRAnalyticsService.getDashboardMetrics(tenantId, { departmentId, leId });

        // 2. Format for Frontend
        const response: any = {
            metrics: {},
            trends: [], // Future: Time series data
            benchmark // Pass through to frontend
        };

        (metricRows as any[]).forEach((m: any) => {
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
        const leId = req.headers['x-legal-entity-id'] as string | undefined;
        const { kpiCode } = req.params;

        let data: any[] = [];

        const page = parseQueryInt(req.query.page, 1);
        const limit = parseQueryInt(req.query.limit, 50);

        switch (kpiCode) {
            case "HR_HEADCOUNT":
                data = await HRAnalyticsService.getHeadcountDetails(tenantId, { page, limit, leId });
                break;
            case "HR_ATTRITION_VOL":
                data = await HRAnalyticsService.getAttritionDetails(tenantId, leId);
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

// GET /api/hr/analytics/departments
// Returns list of available departments for filtering
router.get("/departments", async (req, res) => {
    try {
        const tenantId = (req.query.tenantId as string) || "default";
        const leId = req.headers['x-legal-entity-id'] as string | undefined;

        const whereConditions: any[] = [
            eq(hrOrganizations.tenantId, tenantId),
            eq(hrOrganizations.classificationCode, "DEPARTMENT")
        ];
        if (leId) whereConditions.push(eq(hrOrganizations.entLegalEntityId as any, leId));

        const departments = await db.select({
            id: hrOrganizations.id,
            name: hrOrganizations.name
        }).from(hrOrganizations).where(and(...whereConditions));

        res.json(departments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
