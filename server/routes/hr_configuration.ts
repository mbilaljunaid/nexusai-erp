
import { Router } from "express";
import { db } from "../db";
import { hrKpiDefinitions, hrReportSchedules } from "@shared/schema/hr_analytics";
import { eq, and } from "drizzle-orm";

const router = Router();

// ========================
// KPI CONFIGURATION
// ========================

// GET /api/hr/config/kpis
router.get("/kpis", async (req, res) => {
    try {
        const kpis = await db.select().from(hrKpiDefinitions);
        res.json(kpis);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/hr/config/kpis
// Update/Correct a KPI definition
router.post("/kpis", async (req, res) => {
    try {
        const { id, targetValue, sqlLogic, isActive } = req.body;
        if (!id) return res.status(400).json({ error: "KPI ID is required" });

        await db.update(hrKpiDefinitions)
            .set({ targetValue, sqlLogic, isActive })
            .where(eq(hrKpiDefinitions.id, id));

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ========================
// REPORT SCHEDULING
// ========================

// GET /api/hr/config/schedules
router.get("/schedules", async (req, res) => {
    try {
        const tenantId = (req.query.tenantId as string) || "default";
        const schedules = await db.select()
            .from(hrReportSchedules)
            .where(eq(hrReportSchedules.tenantId, tenantId));
        res.json(schedules);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/hr/config/schedules
router.post("/schedules", async (req, res) => {
    try {
        const { reportType, cronExpression, recipients, tenantId = "default" } = req.body;

        const newSchedule = await db.insert(hrReportSchedules).values({
            reportType,
            cronExpression,
            recipients,
            tenantId
        }).returning();

        res.json(newSchedule[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
