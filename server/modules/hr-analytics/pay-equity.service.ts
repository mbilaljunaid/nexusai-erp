import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * GenderPayGapService — HR-OG-01
 * Captures compensation snapshots and produces adjusted/unadjusted pay gap metrics.
 */
export class GenderPayGapService {

    async upsertSnapshot(params: {
        tenantId: string; snapshotDate: string; reportPeriod: string;
        employeeId: string; gender?: string; raceEthnicity?: string;
        jobLevel?: string; jobFamily?: string; department?: string; countryCode?: string;
        baseSalary: number; totalCompensation: number; currencyCode?: string;
        yearsExperience?: number; yearsAtCompany?: number; performanceBand?: string;
    }) {
        await db.execute(sql`
            INSERT INTO pay_equity_snapshots (
                tenant_id, snapshot_date, report_period, employee_id, gender, race_ethnicity,
                job_level, job_family, department, country_code,
                base_salary, total_compensation, currency_code,
                years_experience, years_at_company, performance_band
            ) VALUES (
                ${params.tenantId}, ${params.snapshotDate}, ${params.reportPeriod},
                ${params.employeeId}, ${params.gender ?? null}, ${params.raceEthnicity ?? null},
                ${params.jobLevel ?? null}, ${params.jobFamily ?? null},
                ${params.department ?? null}, ${params.countryCode ?? 'US'},
                ${params.baseSalary}, ${params.totalCompensation}, ${params.currencyCode ?? 'USD'},
                ${params.yearsExperience ?? null}, ${params.yearsAtCompany ?? null},
                ${params.performanceBand ?? null}
            )
            ON CONFLICT DO NOTHING
        `);
        return { employeeId: params.employeeId, period: params.reportPeriod };
    }

    /**
     * Unadjusted pay gap — raw median by gender.
     */
    async getUnadjustedGap(tenantId: string, reportPeriod: string, groupBy = 'gender') {
        return (await db.execute(sql`
            SELECT
                gender,
                COUNT(*) AS headcount,
                ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY base_salary)::numeric, 0) AS median_base,
                ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_compensation)::numeric, 0) AS median_tcc,
                ROUND(AVG(base_salary)::numeric, 0) AS mean_base,
                ROUND(AVG(total_compensation)::numeric, 0) AS mean_tcc
            FROM pay_equity_snapshots
            WHERE tenant_id = ${tenantId} AND report_period = ${reportPeriod}
            GROUP BY gender ORDER BY gender
        `) as any).rows;
    }

    /**
     * Adjusted pay gap — controls for job_family, job_level, performance_band.
     * Returns avg base salary ratio: F/M within each cohort.
     */
    async getAdjustedGap(tenantId: string, reportPeriod: string) {
        return (await db.execute(sql`
            SELECT
                job_family, job_level, performance_band,
                ROUND(AVG(base_salary) FILTER (WHERE gender = 'F')::numeric / NULLIF(AVG(base_salary) FILTER (WHERE gender = 'M'), 0), 4) AS f_m_pay_ratio,
                COUNT(*) FILTER (WHERE gender = 'F') AS female_count,
                COUNT(*) FILTER (WHERE gender = 'M') AS male_count
            FROM pay_equity_snapshots
            WHERE tenant_id = ${tenantId} AND report_period = ${reportPeriod}
            GROUP BY job_family, job_level, performance_band
            HAVING COUNT(*) FILTER (WHERE gender = 'F') > 0 AND COUNT(*) FILTER (WHERE gender = 'M') > 0
            ORDER BY f_m_pay_ratio NULLS LAST
        `) as any).rows;
    }

    async getDepartmentBreakdown(tenantId: string, reportPeriod: string) {
        return (await db.execute(sql`
            SELECT department, gender, COUNT(*) AS count,
                ROUND(AVG(total_compensation)::numeric, 0) AS avg_tcc
            FROM pay_equity_snapshots
            WHERE tenant_id = ${tenantId} AND report_period = ${reportPeriod}
            GROUP BY department, gender ORDER BY department, gender
        `) as any).rows;
    }

    async getPeriods(tenantId: string) {
        return (await db.execute(sql`SELECT DISTINCT report_period FROM pay_equity_snapshots WHERE tenant_id = ${tenantId} ORDER BY report_period DESC`) as any).rows;
    }
}

/**
 * WorkforceBenchmarkingService — HR-OG-02
 * Manages market pay benchmarks and computes compa-ratios.
 */
export class WorkforceBenchmarkingService {

    async upsertBenchmark(params: {
        tenantId: string; benchmarkSource?: string; jobFamily: string; jobLevel: string;
        countryCode?: string; p25: number; p50: number; p75: number; p90: number;
        currencyCode?: string; effectiveDate: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO workforce_benchmarks (
                tenant_id, benchmark_source, job_family, job_level, country_code,
                p25_salary, p50_salary, p75_salary, p90_salary, currency_code, effective_date
            ) VALUES (
                ${params.tenantId}, ${params.benchmarkSource ?? 'INTERNAL'}, ${params.jobFamily},
                ${params.jobLevel}, ${params.countryCode ?? 'US'},
                ${params.p25}, ${params.p50}, ${params.p75}, ${params.p90},
                ${params.currencyCode ?? 'USD'}, ${params.effectiveDate}
            )
            ON CONFLICT DO NOTHING RETURNING *
        `)) as any;
        return r;
    }

    async listBenchmarks(tenantId: string, jobFamily?: string, country?: string) {
        let q = sql`SELECT * FROM workforce_benchmarks WHERE tenant_id = ${tenantId}`;
        if (jobFamily) q = sql`${q} AND job_family = ${jobFamily}`;
        if (country) q = sql`${q} AND country_code = ${country}`;
        q = sql`${q} ORDER BY job_family, job_level, effective_date DESC`;
        return (await db.execute(q) as any).rows;
    }

    /**
     * Compa-ratio report: joins pay snapshots with benchmarks to show where each employee sits.
     */
    async getCompaRatioReport(tenantId: string, reportPeriod: string) {
        return (await db.execute(sql`
            SELECT
                s.employee_id, s.job_family, s.job_level, s.gender, s.department,
                s.base_salary,
                b.p50_salary AS market_p50,
                ROUND(s.base_salary / NULLIF(b.p50_salary, 0), 3) AS compa_ratio,
                CASE
                    WHEN s.base_salary < b.p25_salary THEN 'Below P25'
                    WHEN s.base_salary < b.p50_salary THEN 'P25-P50'
                    WHEN s.base_salary < b.p75_salary THEN 'P50-P75'
                    ELSE 'Above P75'
                END AS pay_range_position
            FROM pay_equity_snapshots s
            LEFT JOIN workforce_benchmarks b
                ON b.tenant_id = s.tenant_id
                AND b.job_family = s.job_family
                AND b.job_level = s.job_level
                AND b.country_code = s.country_code
            WHERE s.tenant_id = ${tenantId} AND s.report_period = ${reportPeriod}
            ORDER BY compa_ratio NULLS LAST
        `) as any).rows;
    }
}

export const genderPayGapService = new GenderPayGapService();
export const workforceBenchmarkingService = new WorkforceBenchmarkingService();
