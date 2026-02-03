import { db } from "@db";
import { hrComplianceRules, hrComplianceViolations, hrComplianceEvents } from "@shared/schema/hr_compliance";
import { eq, sql, count } from "drizzle-orm";

export class ComplianceAnalyticsService {
    static async getSummaryMetrics(tenantId: string) {
        const rulesCount = await db.select({ count: count() })
            .from(hrComplianceRules)
            .where(eq(hrComplianceRules.tenantId, tenantId));

        const openViolationsCount = await db.select({ count: count() })
            .from(hrComplianceViolations)
            .where(sql`${hrComplianceViolations.tenantId} = ${tenantId} AND ${hrComplianceViolations.status} = 'open'`);

        const criticalViolationsCount = await db.select({ count: count() })
            .from(hrComplianceViolations)
            .where(sql`${hrComplianceViolations.tenantId} = ${tenantId} AND ${hrComplianceViolations.severity} = 'critical' AND ${hrComplianceViolations.status} = 'open'`);

        return {
            totalRules: Number(rulesCount[0]?.count || 0),
            openViolations: Number(openViolationsCount[0]?.count || 0),
            criticalIssues: Number(criticalViolationsCount[0]?.count || 0),
        };
    }

    static async getRiskDistribution(tenantId: string) {
        return db.select({
            severity: hrComplianceRules.severity,
            count: count()
        })
            .from(hrComplianceRules)
            .where(eq(hrComplianceRules.tenantId, tenantId))
            .groupBy(hrComplianceRules.severity);
    }

    static async getViolationTrends(tenantId: string) {
        // Grouping by month for the last 6 months
        return db.select({
            month: sql`to_char(${hrComplianceViolations.createdAt}, 'Mon')`,
            count: count(),
            sortOrder: sql`EXTRACT(MONTH FROM ${hrComplianceViolations.createdAt})`
        })
            .from(hrComplianceViolations)
            .where(eq(hrComplianceViolations.tenantId, tenantId))
            .groupBy(sql`to_char(${hrComplianceViolations.createdAt}, 'Mon')`, sql`EXTRACT(MONTH FROM ${hrComplianceViolations.createdAt})`)
            .orderBy(sql`EXTRACT(MONTH FROM ${hrComplianceViolations.createdAt})`);
    }
}
