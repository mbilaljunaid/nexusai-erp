import { db } from "../db";
import { hrKpiDefinitions, hrAnalyticsSnapshots } from "@shared/schema/hr_analytics";
import { hrAssignments, hrWorkRelationships, hrPersons } from "@shared/schema/hr_worker";
import { eq, and, sql, isNull, count, lte, gte } from "drizzle-orm";

export class HRAnalyticsService {

    /**
     * Generates a daily snapshot for all active KPIs.
     * This would typically be run by a CRON job every night.
     */
    static async generateDailySnapshot(tenantId: string) {
        console.log(`[HR Analytics] Generating snapshots for tenant: ${tenantId}`);

        // 1. Get Active KPIs
        const kpis = await db.select()
            .from(hrKpiDefinitions)
            .where(and(
                eq(hrKpiDefinitions.isActive, true),
                eq(hrKpiDefinitions.category, "WORKFORCE") // Focus on Workforce for now
            ));

        const results = [];

        for (const kpi of kpis) {
            let value = 0;
            let dimensions = {};

            try {
                switch (kpi.code) {
                    case "HR_HEADCOUNT":
                        value = await this.calculateHeadcount(tenantId);
                        break;
                    case "HR_ATTRITION_VOL":
                        value = await this.calculateAttrition(tenantId, "VOLUNTARY");
                        break;
                    case "HR_GENDER_RATIO":
                        // Example of dimensioned metric
                        const metrics = await this.calculateGenderDistribution(tenantId);
                        // For the main snapshot, we might store the percentage of Female?
                        // Or we create separate snapshots for dimensions. 
                        // For simplicity V1: Store "Female %" as the main value.
                        value = metrics.femalePercentage;
                        dimensions = metrics.distribution;
                        break;
                    default:
                        console.warn(`[HR Analytics] KPI ${kpi.code} logic not implemented.`);
                        continue;
                }

                // 2. Save Snapshot
                const [snapshot] = await db.insert(hrAnalyticsSnapshots).values({
                    kpiId: kpi.id,
                    snapshotDate: new Date(),
                    value: value.toString(),
                    dimensions: dimensions,
                    tenantId: tenantId
                }).returning();

                results.push(snapshot);
                console.log(`[HR Analytics] Snapshot saved: ${kpi.name} = ${value}`);

            } catch (err) {
                console.error(`[HR Analytics] Error calculating ${kpi.code}:`, err);
            }
        }

        return results;
    }

    /**
     * Metric: Total Headcount
     * Logic: Count of active assignments
     */
    static async calculateHeadcount(tenantId: string): Promise<number> {
        const result = await db.select({ value: count() })
            .from(hrAssignments)
            .where(and(
                eq(hrAssignments.tenantId, tenantId),
                eq(hrAssignments.assignmentStatus, "ACTIVE"),
                eq(hrAssignments.primaryAssignmentFlag, true) // Only count primary jobs
            ));

        return Number(result[0]?.value || 0);
    }

    /**
     * Metric: Attrition (Voluntary)
     * Logic: Terminations in last 30 days / Current Headcount
     * Note: Simplistic V1 calculation. Real world uses average headcount.
     */
    static async calculateAttrition(tenantId: string, type: "VOLUNTARY" | "INVOLUNTARY"): Promise<number> {
        // 1. Get Terminations in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const terminations = await db.select({ value: count() })
            .from(hrWorkRelationships)
            .where(and(
                eq(hrWorkRelationships.tenantId, tenantId),
                gte(hrWorkRelationships.terminationDate, thirtyDaysAgo.toISOString()),
                // In a real app, we'd check termination reason for Vol/Invol
                // For V1, assuming all are "Voluntary" if we don't have reason codes yet
            ));

        const termCount = Number(terminations[0]?.value || 0);
        const headcount = await this.calculateHeadcount(tenantId);

        if (headcount === 0) return 0;

        // Annualized Rate? Or Monthly? Let's do simple Monthly Rate for now.
        return (termCount / headcount) * 100;
    }

    /**
     * Metric: Gender Distribution
     */
    static async calculateGenderDistribution(tenantId: string) {
        // Query: Count of active assignments grouped by gender
        // We join Assignments -> Persons to get Gender
        const genderStats = await db.select({
            gender: hrPersons.gender,
            count: count(hrAssignments.id)
        })
            .from(hrAssignments)
            .innerJoin(hrPersons, eq(hrAssignments.personId, hrPersons.id))
            .where(and(
                eq(hrAssignments.tenantId, tenantId),
                eq(hrAssignments.assignmentStatus, "ACTIVE"),
                eq(hrAssignments.primaryAssignmentFlag, true)
            ))
            .groupBy(hrPersons.gender);

        let total = 0;
        let femaleCount = 0;
        const distribution: Record<string, number> = {};

        genderStats.forEach(stat => {
            const countVal = Number(stat.count);
            const label = stat.gender === 'F' ? 'Female' : stat.gender === 'M' ? 'Male' : 'Other';

            distribution[label] = countVal;
            total += countVal;
            if (stat.gender === 'F') femaleCount += countVal;
        });

        // Calculate Percentages
        const femalePercentage = total > 0 ? (femaleCount / total) * 100 : 0;

        // Convert counts to percentages for the chart
        const finalDistribution: Record<string, number> = {};
        for (const [key, value] of Object.entries(distribution)) {
            finalDistribution[key] = total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0;
        }

        return {
            femalePercentage,
            distribution: finalDistribution
        };
    }

    /**
     * API: Get latest dashboard metrics
     */
    static async getDashboardMetrics(tenantId: string) {
        // Query latest snapshot for each KPI
        const latestSnapshots = await db.execute(sql`
            SELECT DISTINCT ON (k.code)
                k.name, 
                k.code, 
                s.value, 
                s.snapshot_date,
                s.dimensions
            FROM hr_analytics_snapshots s
            JOIN hr_kpi_definitions k ON s.kpi_id = k.id
            WHERE s.tenant_id = ${tenantId}
            ORDER BY k.code, s.snapshot_date DESC
        `);

        return latestSnapshots.rows;
    }

    /**
     * DRILL-DOWN: Get Headcount Details
     * Returns list of active assignments
     */
    static async getHeadcountDetails(tenantId: string) {
        return await db.select({
            id: hrAssignments.id,
            personName: sql`concat(${hrPersons.firstName}, ' ', ${hrPersons.lastName})`,
            assignmentNumber: hrAssignments.assignmentNumber,
            departmentId: hrAssignments.departmentId,
            jobId: hrAssignments.jobId,
            startDate: hrAssignments.effectiveStartDate
        })
            .from(hrAssignments)
            .leftJoin(hrPersons, eq(hrAssignments.personId, hrPersons.id))
            .where(and(
                eq(hrAssignments.tenantId, tenantId),
                eq(hrAssignments.assignmentStatus, "ACTIVE"),
                eq(hrAssignments.primaryAssignmentFlag, true)
            ))
            .limit(100); // Pagination in V2
    }

    /**
     * DRILL-DOWN: Get Attrition Details
     * Returns list of recent terminations
     */
    static async getAttritionDetails(tenantId: string) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return await db.select({
            id: hrWorkRelationships.id,
            personName: sql`concat(${hrPersons.firstName}, ' ', ${hrPersons.lastName})`,
            terminationDate: hrWorkRelationships.terminationDate,
            workerType: hrWorkRelationships.workerType
        })
            .from(hrWorkRelationships)
            .leftJoin(hrPersons, eq(hrWorkRelationships.personId, hrPersons.id))
            .where(and(
                eq(hrWorkRelationships.tenantId, tenantId),
                gte(hrWorkRelationships.terminationDate, thirtyDaysAgo.toISOString())
            ))
            .limit(100);
    }
}
