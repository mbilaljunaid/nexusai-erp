import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * EEOComplianceService — REC-OG-01
 * Collects voluntary self-identification data and generates EEO-1 / OFCCP reports.
 */
export class EEOComplianceService {

    async recordApplicantData(params: {
        tenantId: string; applicantId: string; jobRequisitionId?: string;
        gender?: string; raceEthnicity?: string; veteranStatus?: string;
        disabilityStatus?: string; ageBand?: string;
        applicationStage?: string; reportPeriod?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO eeo_applicant_data (
                tenant_id, applicant_id, job_requisition_id, gender, race_ethnicity,
                veteran_status, disability_status, age_band, application_stage, report_period
            ) VALUES (
                ${params.tenantId}, ${params.applicantId}, ${params.jobRequisitionId ?? null},
                ${params.gender ?? 'DECLINED'}, ${params.raceEthnicity ?? 'DECLINED'},
                ${params.veteranStatus ?? 'DECLINED'}, ${params.disabilityStatus ?? 'DECLINED'},
                ${params.ageBand ?? 'DECLINED'}, ${params.applicationStage ?? 'Applied'},
                ${params.reportPeriod ?? null}
            ) RETURNING *
        `)) as any;
        return r;
    }

    async advanceStage(applicantId: string, tenantId: string, stage: string, outcome?: string) {
        await db.execute(sql`
            UPDATE eeo_applicant_data
            SET application_stage = ${stage}, outcome = ${outcome ?? null}
            WHERE applicant_id = ${applicantId} AND tenant_id = ${tenantId}
        `);
        return { applicantId, stage, outcome };
    }

    /**
     * EEO-1 Categorical Report — breakdown by gender × race for a given period.
     */
    async generateEEO1Report(tenantId: string, reportPeriod?: string) {
        let q = sql`
            SELECT
                gender, race_ethnicity,
                COUNT(*) AS total_applicants,
                COUNT(*) FILTER (WHERE outcome = 'Hired') AS hired,
                COUNT(*) FILTER (WHERE outcome = 'Rejected') AS rejected,
                ROUND(COUNT(*) FILTER (WHERE outcome = 'Hired')::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS hire_rate_pct
            FROM eeo_applicant_data
            WHERE tenant_id = ${tenantId}
        `;
        if (reportPeriod) q = sql`${q} AND report_period = ${reportPeriod}`;
        q = sql`${q} GROUP BY gender, race_ethnicity ORDER BY gender, race_ethnicity`;
        return (await db.execute(q) as any).rows;
    }

    async getDispersionAnalysis(tenantId: string, reportPeriod?: string) {
        let q = sql`
            SELECT
                application_stage,
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE gender = 'F' OR gender = 'X') AS minority_gender,
                COUNT(*) FILTER (WHERE race_ethnicity NOT IN ('WHITE', 'DECLINED')) AS minority_race,
                ROUND(COUNT(*) FILTER (WHERE race_ethnicity NOT IN ('WHITE', 'DECLINED'))::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS minority_pct
            FROM eeo_applicant_data WHERE tenant_id = ${tenantId}
        `;
        if (reportPeriod) q = sql`${q} AND report_period = ${reportPeriod}`;
        q = sql`${q} GROUP BY application_stage ORDER BY MIN(created_at)`;
        return (await db.execute(q) as any).rows;
    }

    async getPeriods(tenantId: string) {
        return (await db.execute(sql`SELECT DISTINCT report_period FROM eeo_applicant_data WHERE tenant_id = ${tenantId} AND report_period IS NOT NULL ORDER BY report_period DESC`) as any).rows;
    }
}

export const eeoComplianceService = new EEOComplianceService();
