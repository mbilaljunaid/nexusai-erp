import { db } from "@db";
import { hrComplianceRules, hrComplianceViolations, hrComplianceEvents } from "@shared/schema/hr_compliance";
import { hrAssignments, hrWorkRelationships } from "@shared/schema/hr_worker";
import { eq, sql, count, and, or } from "drizzle-orm";
import { ComplianceService } from "./ComplianceService";

export class ComplianceAnalyticsService {
    static async getSummaryMetrics(tenantId: string, currentUserId?: string) {
        const conditions = await ComplianceService.getAorConditions(tenantId, currentUserId);
        const aorFilter = conditions.length > 0 ? [or(...conditions)] : [];

        const rulesCount = await db.select({ count: count() })
            .from(hrComplianceRules)
            .where(eq(hrComplianceRules.tenantId, tenantId));

        const openViolationsQuery = db.select({ count: count() })
            .from(hrComplianceViolations)
            .leftJoin(hrComplianceEvents, eq(hrComplianceViolations.eventId, hrComplianceEvents.id))
            .leftJoin(hrAssignments, and(
                eq(hrComplianceEvents.entityId, hrAssignments.personId),
                eq(hrComplianceEvents.entityType, "PERSON"),
                eq(hrAssignments.primaryAssignmentFlag, true)
            ))
            .leftJoin(hrWorkRelationships, and(
                eq(hrComplianceEvents.entityId, hrWorkRelationships.personId),
                eq(hrComplianceEvents.entityType, "PERSON"),
                eq(hrWorkRelationships.primaryFlag, true)
            ))
            .where(and(
                eq(hrComplianceViolations.tenantId, tenantId),
                eq(hrComplianceViolations.status, 'open'),
                ...aorFilter
            ));

        const openViolationsCount = await openViolationsQuery;

        const criticalViolationsCount = await db.select({ count: count() })
            .from(hrComplianceViolations)
            .leftJoin(hrComplianceEvents, eq(hrComplianceViolations.eventId, hrComplianceEvents.id))
            .leftJoin(hrAssignments, and(
                eq(hrComplianceEvents.entityId, hrAssignments.personId),
                eq(hrComplianceEvents.entityType, "PERSON"),
                eq(hrAssignments.primaryAssignmentFlag, true)
            ))
            .leftJoin(hrWorkRelationships, and(
                eq(hrComplianceEvents.entityId, hrWorkRelationships.personId),
                eq(hrComplianceEvents.entityType, "PERSON"),
                eq(hrWorkRelationships.primaryFlag, true)
            ))
            .where(and(
                eq(hrComplianceViolations.tenantId, tenantId),
                eq(hrComplianceViolations.severity, 'critical'),
                eq(hrComplianceViolations.status, 'open'),
                ...aorFilter
            ));

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

    static async getViolationTrends(tenantId: string, currentUserId?: string) {
        const conditions = await ComplianceService.getAorConditions(tenantId, currentUserId);
        const aorFilter = conditions.length > 0 ? [or(...conditions)] : [];

        // Grouping by month for the last 6 months
        return db.select({
            month: sql`to_char(${hrComplianceViolations.createdAt}, 'Mon')`,
            count: count(),
            sortOrder: sql`EXTRACT(MONTH FROM ${hrComplianceViolations.createdAt})`
        })
            .from(hrComplianceViolations)
            .leftJoin(hrComplianceEvents, eq(hrComplianceViolations.eventId, hrComplianceEvents.id))
            .leftJoin(hrAssignments, and(
                eq(hrComplianceEvents.entityId, hrAssignments.personId),
                eq(hrComplianceEvents.entityType, "PERSON"),
                eq(hrAssignments.primaryAssignmentFlag, true)
            ))
            .leftJoin(hrWorkRelationships, and(
                eq(hrComplianceEvents.entityId, hrWorkRelationships.personId),
                eq(hrComplianceEvents.entityType, "PERSON"),
                eq(hrWorkRelationships.primaryFlag, true)
            ))
            .where(and(
                eq(hrComplianceViolations.tenantId, tenantId),
                ...aorFilter
            ))
            .groupBy(sql`to_char(${hrComplianceViolations.createdAt}, 'Mon')`, sql`EXTRACT(MONTH FROM ${hrComplianceViolations.createdAt})`)
            .orderBy(sql`EXTRACT(MONTH FROM ${hrComplianceViolations.createdAt})`);
    }

    static async getRegulatoryReadinessScore(tenantId: string) {
        const [violationStats] = await db.select({
            total: sql`count(*)`,
            resolved: sql`count(*) filter (where ${hrComplianceViolations.status} = 'resolved')`,
            critical: sql`count(*) filter (where ${hrComplianceViolations.severity} = 'critical' and ${hrComplianceViolations.status} != 'resolved')`
        })
            .from(hrComplianceViolations)
            .where(eq(hrComplianceViolations.tenantId, tenantId));

        const total = Number(violationStats.total || 0);
        const resolved = Number(violationStats.resolved || 0);
        const critical = Number(violationStats.critical || 0);

        // Score Calculation Heuristic: 
        // Start at 100, -10 for each unresolved critical, -2 for each other unresolved
        let score = 100;
        if (total > 0) {
            score = score - (critical * 15) - ((total - resolved - critical) * 5);
        }

        return {
            score: Math.max(0, score),
            totalViolations: total,
            resolvedCount: resolved,
            criticalUnresolved: critical
        };
    }

    static async getAuditEngagementSummary(tenantId: string) {
        // Mock audit data as we don't have an audit_logs table joinable here easily for trends
        // but we can return counts of high-risk evaluations
        const stats = await db.select({
            result: hrComplianceEvents.evaluationResult,
            count: count()
        })
            .from(hrComplianceEvents)
            .where(eq(hrComplianceEvents.tenantId, tenantId))
            .groupBy(hrComplianceEvents.evaluationResult);

        return stats;
    }
    static async getComplianceVelocity(tenantId: string) {
        // Group by month for last 6 months
        // Count created (opened)
        const opened = await db.select({
            month: sql`to_char(${hrComplianceViolations.createdAt}, 'Mon')`,
            count: count(),
            sortOrder: sql`EXTRACT(MONTH FROM ${hrComplianceViolations.createdAt})`
        })
            .from(hrComplianceViolations)
            .where(and(
                eq(hrComplianceViolations.tenantId, tenantId),
                sql`${hrComplianceViolations.createdAt} > now() - interval '6 months'`
            ))
            .groupBy(sql`to_char(${hrComplianceViolations.createdAt}, 'Mon')`, sql`EXTRACT(MONTH FROM ${hrComplianceViolations.createdAt})`)
            .orderBy(sql`EXTRACT(MONTH FROM ${hrComplianceViolations.createdAt})`);

        // Count resolved
        const resolved = await db.select({
            month: sql`to_char(${hrComplianceViolations.resolvedAt}, 'Mon')`,
            count: count(),
            sortOrder: sql`EXTRACT(MONTH FROM ${hrComplianceViolations.resolvedAt})`
        })
            .from(hrComplianceViolations)
            .where(and(
                eq(hrComplianceViolations.tenantId, tenantId),
                eq(hrComplianceViolations.status, 'resolved'),
                sql`${hrComplianceViolations.resolvedAt} > now() - interval '6 months'`
            ))
            .groupBy(sql`to_char(${hrComplianceViolations.resolvedAt}, 'Mon')`, sql`EXTRACT(MONTH FROM ${hrComplianceViolations.resolvedAt})`)
            .orderBy(sql`EXTRACT(MONTH FROM ${hrComplianceViolations.resolvedAt})`);

        // Merge datasets
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonthIdx = new Date().getMonth();
        // Generate last 6 months labels in order
        const result = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mLabel = months[d.getMonth()];

            const openCount = opened.find(o => o.month === mLabel)?.count || 0;
            const resolveCount = resolved.find(r => r.month === mLabel)?.count || 0;

            result.push({
                month: mLabel,
                opened: Number(openCount),
                resolved: Number(resolveCount)
            });
        }

        return result;
    }
}
