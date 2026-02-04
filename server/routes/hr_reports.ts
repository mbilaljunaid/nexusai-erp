
import { Router } from "express";
import { db } from "../db";
import { hrAssignments, hrWorkRelationships, hrPersons } from "@shared/schema/hr_worker";
import { desc, eq, and, gte, lte } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

// GET /api/hr/reports/types
// Returns list of available report definitions
router.get("/types", (req, res) => {
    res.json([
        { id: "TERMINATION_LOG", name: "Termination Log", description: "List of all terminations within a date range." },
        { id: "NEW_HIRES", name: "New Hire Report", description: "List of new joiners within a date range." },
        { id: "HEADCOUNT_DUMP", name: "Active Headcount Dump", description: "Full list of current active employees." }
    ]);
});

// GET /api/hr/reports/generate
// Generates the report data
router.get("/generate", async (req, res) => {
    try {
        const { type, tenantId = "default", startDate, endDate } = req.query;

        if (!type) return res.status(400).json({ error: "Report type is required" });

        let data: any[] = [];

        if (type === "TERMINATION_LOG") {
            data = await db.select({
                personName: sql`concat(${hrPersons.firstName}, ' ', ${hrPersons.lastName})`,
                personNumber: hrPersons.personNumber,
                terminationDate: hrWorkRelationships.terminationDate,
                reason: hrWorkRelationships.reasonCode
            })
                .from(hrWorkRelationships)
                .leftJoin(hrPersons, eq(hrWorkRelationships.personId, hrPersons.id))
                .where(and(
                    eq(hrWorkRelationships.tenantId, tenantId as string),
                    // Basic date filter if provided
                    startDate ? gte(hrWorkRelationships.terminationDate, startDate as string) : undefined as any,
                    endDate ? lte(hrWorkRelationships.terminationDate, endDate as string) : undefined as any
                ))
                .orderBy(desc(hrWorkRelationships.terminationDate))
                .limit(500);

        } else if (type === "NEW_HIRES") {
            data = await db.select({
                personName: sql`concat(${hrPersons.firstName}, ' ', ${hrPersons.lastName})`,
                personNumber: hrPersons.personNumber,
                startDate: hrWorkRelationships.startDate,
                workerType: hrWorkRelationships.workerType
            })
                .from(hrWorkRelationships)
                .leftJoin(hrPersons, eq(hrWorkRelationships.personId, hrPersons.id))
                .where(and(
                    eq(hrWorkRelationships.tenantId, tenantId as string),
                    startDate ? gte(hrWorkRelationships.startDate, startDate as string) : undefined as any
                ))
                .orderBy(desc(hrWorkRelationships.startDate))
                .limit(500);

        } else if (type === "HEADCOUNT_DUMP") {
            data = await db.select({
                personName: sql`concat(${hrPersons.firstName}, ' ', ${hrPersons.lastName})`,
                assignmentNumber: hrAssignments.assignmentNumber,
                jobId: hrAssignments.jobId,
                departmentId: hrAssignments.departmentId,
                jobId: hrAssignments.jobId,
                departmentId: hrAssignments.departmentId,
                locationId: hrAssignments.locationId,
                salary: sql`'120000'` // Mock Salary for V1 (Schema doesn't have it yet)
            })
                .from(hrAssignments)
                .leftJoin(hrPersons, eq(hrAssignments.personId, hrPersons.id))
                .where(and(
                    eq(hrAssignments.tenantId, tenantId as string),
                    eq(hrAssignments.assignmentStatus, "ACTIVE"),
                    eq(hrAssignments.primaryAssignmentFlag, true)
                ))
                .limit(1000);

            // FIELD LEVEL SECURITY (MASKING)
            // Check if user has "VIEW_SENSITIVE" permission
            const canViewSensitive = req.user?.permissions.includes("VIEW_SENSITIVE");

            if (!canViewSensitive) {
                data = data.map(row => ({
                    ...row,
                    salary: "*****" // Masked Value
                }));
            }
        }

        res.json(data);

    } catch (error: any) {
        console.error("Report generation error:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
