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
    static async calculateHeadcount(tenantId: string, filter?: { departmentId?: string }): Promise<number> {
        const conditions = [
            eq(hrAssignments.tenantId, tenantId),
            eq(hrAssignments.assignmentStatus, "ACTIVE"),
            eq(hrAssignments.primaryAssignmentFlag, true)
        ];

        if (filter?.departmentId) {
            conditions.push(eq(hrAssignments.departmentId, filter.departmentId));
        }

        const result = await db.select({ value: count() })
            .from(hrAssignments)
            .where(and(...conditions));

        return Number(result[0]?.value || 0);
    }

    /**
     * Metric: Attrition (Voluntary)
     * Logic: Terminations in last 30 days / Current Headcount
     * Note: Simplistic V1 calculation. Real world uses average headcount.
     */
    static async calculateAttrition(tenantId: string, type: "VOLUNTARY" | "INVOLUNTARY", filter?: { departmentId?: string }): Promise<number> {
        // 1. Get Terminations in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Terminations need to join Assignments to get Department (since WorkRel doesn't have Dept ID usually? Check schema.)
        // Actually, WorkRelationship -> Assignments (Last Assignment?).
        // For simplicity V1, we assume Terminated employees had valid assignments. 
        // We need to join `hrAssignments` (Historical or Current?) 
        // `hrAssignments` stores current state. If terminated, the status is INACTIVE.
        // We can check the Department ID from the Assignment table.

        const conditions = [
            eq(hrWorkRelationships.tenantId, tenantId),
            gte(hrWorkRelationships.terminationDate, thirtyDaysAgo.toISOString())
        ];

        let termQuery = db.select({ value: count() })
            .from(hrWorkRelationships);

        if (filter?.departmentId) {
            // Join Assignments to filter by Department
            termQuery = termQuery.innerJoin(hrAssignments, eq(hrWorkRelationships.personId, hrAssignments.personId))
            conditions.push(eq(hrAssignments.departmentId, filter.departmentId));
            // Ensure we pick the relevant assignment (e.g. max date or primary). 
            // For V1, assuming Primary assignment matches.
            conditions.push(eq(hrAssignments.primaryAssignmentFlag, true));
        }

        const terminations = await termQuery.where(and(...conditions));

        const termCount = Number(terminations[0]?.value || 0);
        const headcount = await this.calculateHeadcount(tenantId, filter);

        if (headcount === 0) return 0;

        // Annualized Rate? Or Monthly? Let's do simple Monthly Rate for now.
        return (termCount / headcount) * 100;
    }

    /**
     * Metric: Gender Distribution
     */
    static async calculateGenderDistribution(tenantId: string, filter?: { departmentId?: string }) {
        const conditions = [
            eq(hrAssignments.tenantId, tenantId),
            eq(hrAssignments.assignmentStatus, "ACTIVE"),
            eq(hrAssignments.primaryAssignmentFlag, true)
        ];

        if (filter?.departmentId) {
            conditions.push(eq(hrAssignments.departmentId, filter.departmentId));
        }

        const genderStats = await db.select({
            gender: hrPersons.gender,
            count: count(hrAssignments.id)
        })
            .from(hrAssignments)
            .innerJoin(hrPersons, eq(hrAssignments.personId, hrPersons.id))
            .where(and(...conditions))
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
    /**
     * API: Get latest dashboard metrics
     * Supports Filtering (Phase 12)
     */
    static async getDashboardMetrics(tenantId: string, filter?: { departmentId?: string }) {
        // If Filtering is active, we MUST calculate live values.
        // Snapshots are pre-aggregated Global values.
        if (filter?.departmentId) {
            console.log(`[HR Analytics] Live Query for Department: ${filter.departmentId}`);

            // 1. Live Headcount
            const headcount = await this.calculateHeadcount(tenantId, filter);

            // 2. Live Attrition
            const attrition = await this.calculateAttrition(tenantId, "VOLUNTARY", filter);

            // 3. Live Gender Diversity
            const genderStats = await this.calculateGenderDistribution(tenantId, filter);

            // Construct Response matching Snapshot structure
            return {
                metrics: [
                    {
                        code: "HR_HEADCOUNT",
                        name: "Total Headcount",
                        value: headcount.toString(),
                        snapshot_date: new Date(),
                        dimensions: {}
                    },
                    {
                        code: "HR_ATTRITION_VOL",
                        name: "Voluntary Turnover",
                        value: attrition.toFixed(1),
                        snapshot_date: new Date(),
                        dimensions: {}
                    },
                    {
                        code: "HR_GENDER_RATIO",
                        name: "Gender Diversity",
                        value: genderStats.femalePercentage.toFixed(1),
                        snapshot_date: new Date(),
                        dimensions: genderStats.distribution
                    }
                ],
                benchmark: null // Disable benchmarks when filtered (as they are usually Global)
            };
        }

        // --- GLOBAL VIEW (Uses Snapshots for Performance) ---
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

        // Fetch Real Benchmarks (e.g. for Engineering / Tech)
        // In a real app, we would match this coverage to the Tenant's industry.
        // For V1 Demo: Just fetch the first 'TECH' benchmark found.
        const benchmarks = await db.select({
            p50Salary: hrMarketBenchmarks.p50Salary,
            p90Salary: hrMarketBenchmarks.p90Salary,
            avgTurnoverRate: hrMarketBenchmarks.avgTurnoverRate
        }).from(hrMarketBenchmarks).where(eq(hrMarketBenchmarks.industry, "TECH")).limit(1);

        const benchmark = benchmarks.length > 0 ? benchmarks[0] : null;

        return {
            metrics: latestSnapshots.rows, // Returning raw rows, need to map probably? 
            // Ah, getDashboardMetrics logic in Service just returned rows before.
            // But verify response format in Dashboard.tsx: it expects { metrics: Record<string, HRMetric>, trends: [], benchmark: ... }
            // The existing backend likely structures this map *after* calling Service or the Service does it?
            // Checking step 571 Line 180: `return latestSnapshots.rows`
            // Checking Dashboard.tsx Line 64: `const metrics = data?.metrics || {};` (which is a Record)
            // Wait, the API ROUTE maps the rows to a Record? I need to check `server/routes/hr_analytics.ts`.
            // If the Service returns rows, then standardizing response shape should happen there or in Route.
            // Let's assume for now I attach benchmark here and the Route handles it?
            // Or I should check the Route first to see where the response object is constructed.
            // Actually, for simplicity, I'll return an object { rows: ..., benchmark: ... } and update Route.
            // BUT simpler: Service returns rows. I need to modify Route to fetch benchmarks? 
            // Better: Service handles business logic. 
            // Let's modify Service to return { metrics: mappedMetrics, benchmark } if possible?
            // Or just return the benchmark separately? 

            // Let's look at the Route! `server/routes/hr_analytics.ts`
            benchmark
        };
    }

    /**
     * DRILL-DOWN: Get Headcount Details (Paginated)
     * Returns list of active assignments
     */
    static async getHeadcountDetails(tenantId: string, options?: { page?: number, limit?: number }) {
        const page = options?.page || 1;
        const limit = options?.limit || 50;
        const offset = (page - 1) * limit;

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
            .limit(limit)
            .offset(offset);
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
