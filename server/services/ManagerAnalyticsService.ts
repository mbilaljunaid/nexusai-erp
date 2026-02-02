import { db } from "../db";
import { hrPersons, hrAssignments } from "@shared/schema/hr_worker";
import { hrmPerfDocuments } from "@shared/schema/talent_performance";
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
     * Compares required vs. actual skills for the team (Oracle Fusion Parity).
     * Currently returns prioritized gap targets for demo.
     */
    static async getSkillGaps(managerId: string, tenantId: string) {
        return [
            { skill: "Digital Leadership", gap: 12, status: "Healthy" },
            { skill: "Financial Acumen", gap: 28, status: "Needs Attention" },
            { skill: "Strategic Planning", gap: 15, status: "Improving" }
        ];
    }
}
