import { db } from "../db";
import { hrPersons, hrAssignments } from "@shared/schema/hr_worker";
import { hrmPerfDocuments } from "@shared/schema/talent_performance";
import { hrmJobProfiles, hrmPersonSkills } from "@shared/schema/talent_core";
import { eq, and, sql, avg } from "drizzle-orm";

export class ManagerAnalyticsService {
    /**
     * getTeamMetrics
     * Aggregates real-time performance and stability data for a manager's direct reports.
     */
    static async getTeamMetrics(managerId: string, tenantId: string) {
        // 1. Headcount
        const directs = await db.select()
            .from(hrAssignments)
            .where(and(
                eq(hrAssignments.managerId, managerId),
                eq(hrAssignments.tenantId, tenantId)
            ));

        const headCount = directs.length;

        // 2. Average Team Performance
        const directPersonIds = directs.map(d => d.personId);
        let averageRating = "0.0";

        if (directPersonIds.length > 0) {
            const ratings = await db.select({
                avg: sql<number>`AVG(NULLIF(${hrmPerfDocuments.overallRating}, ''))`
            }).from(hrmPerfDocuments)
                .where(and(
                    sql`${hrmPerfDocuments.personId} IN ${directPersonIds}`,
                    eq(hrmPerfDocuments.tenantId, tenantId)
                ));

            averageRating = Number(ratings[0]?.avg || 0).toFixed(1);
        }

        // 3. Attrition Risk (Demo Logic)
        const attritionRisk = headCount > 0 ? "Low" : "N/A";

        return {
            headCount,
            averageRating,
            attritionRisk,
            utilization: "94%" // Mocked for Tier-1 UI preview
        };
    }

    /**
     * getSkillGaps
     * Compares required vs. actual skills for the team.
     */
    static async getSkillGaps(managerId: string, tenantId: string) {
        // 1. Get Direct Reports
        const directs = await db.select({
            personId: hrAssignments.personId,
            jobId: hrAssignments.jobId
        })
            .from(hrAssignments)
            .where(and(
                eq(hrAssignments.managerId, managerId),
                eq(hrAssignments.tenantId, tenantId),
                eq(hrAssignments.assignmentStatus, "ACTIVE")
            ));

        if (directs.length === 0) return [];

        // 2. Aggregate Gaps
        // Map: SkillName -> { totalRequired: number, missing: number }
        const skillStats = new Map<string, { totalRequired: number, missing: number }>();

        // For each report, fetch their job profile (requirements) and their actual skills
        for (const report of directs) {
            // Get Job Requirements
            const jobProfiles = await db.select()
                .from(hrmJobProfiles)
                .where(eq(hrmJobProfiles.jobId, report.jobId || "")); // Handle null jobId safely

            const requiredSkills = (jobProfiles[0]?.requiredSkills as any[]) || [];

            // Get Person Skills
            const personSkills = await db.select()
                .from(hrmPersonSkills)
                .where(eq(hrmPersonSkills.personId, report.personId));

            const personSkillNames = new Set(personSkills.map(s => s.skillName));

            // Compare
            for (const req of requiredSkills) {
                // req: { skillName: string, level: string }
                if (!skillStats.has(req.skillName)) {
                    skillStats.set(req.skillName, { totalRequired: 0, missing: 0 });
                }

                const stats = skillStats.get(req.skillName)!;
                stats.totalRequired++;

                if (!personSkillNames.has(req.skillName)) {
                    stats.missing++;
                }
            }
        }

        // 3. Format Result
        const results: any[] = [];
        skillStats.forEach((stats, skillName) => {
            const gapPercentage = Math.round((stats.missing / (stats.totalRequired || 1)) * 100);
            let status = "Healthy";
            if (gapPercentage > 50) status = "Critical";
            else if (gapPercentage > 20) status = "Needs Attention";

            results.push({
                skill: skillName,
                gap: gapPercentage,
                status
            });
        });

        return results.sort((a, b) => b.gap - a.gap).slice(0, 5); // Top 5 gaps
    }
}
