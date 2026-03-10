import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * BenefitsEnrollmentService — HR-OG-07 (P1-C)
 *
 * Manages benefit plan catalog, open enrollment, life events, and
 * waiver processing. Feeds into payroll deduction elements.
 */
export class BenefitsEnrollmentService {

    async createPlan(params: {
        tenantId: string;
        name: string;
        benefitType: 'Medical' | 'Dental' | 'Vision' | 'Life' | '401k' | 'FSA' | 'HSA';
        providerName?: string;
        employeeCost: number;
        employerCost: number;
        currencyCode?: string;
        enrollmentStart?: string;
        enrollmentEnd?: string;
        effectiveFrom: string;
        effectiveTo?: string;
        maxDependents?: number;
    }) {
        const [plan] = (await db.execute(sql`
            INSERT INTO benefit_plans (
                tenant_id, name, benefit_type, provider_name, employee_cost, employer_cost,
                currency_code, enrollment_start, enrollment_end, effective_from, effective_to, max_dependents
            ) VALUES (
                ${params.tenantId}, ${params.name}, ${params.benefitType}, ${params.providerName ?? null},
                ${params.employeeCost}, ${params.employerCost}, ${params.currencyCode ?? 'USD'},
                ${params.enrollmentStart ?? null}, ${params.enrollmentEnd ?? null},
                ${params.effectiveFrom}, ${params.effectiveTo ?? null}, ${params.maxDependents ?? 10}
            )
            RETURNING *
        `)) as any;
        return plan;
    }

    async getAvailablePlans(tenantId: string) {
        return (await db.execute(sql`
            SELECT * FROM benefit_plans
            WHERE tenant_id = ${tenantId}
              AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
              AND (enrollment_start IS NULL OR enrollment_start <= CURRENT_DATE)
              AND (enrollment_end IS NULL OR enrollment_end >= CURRENT_DATE)
            ORDER BY benefit_type, name
        `) as any).rows;
    }

    async enroll(params: {
        tenantId: string;
        employeeId: string;
        planId: string;
        enrollmentDate: string;
        effectiveFrom: string;
        dependents?: Array<{ name: string; dob: string; relationship: string }>;
    }) {
        const [enrollment] = (await db.execute(sql`
            INSERT INTO benefit_enrollments (
                tenant_id, employee_id, plan_id, enrollment_date, effective_from,
                status, dependents
            ) VALUES (
                ${params.tenantId}, ${params.employeeId}, ${params.planId},
                ${params.enrollmentDate}, ${params.effectiveFrom},
                'Active', ${JSON.stringify(params.dependents ?? [])}
            )
            ON CONFLICT (tenant_id, employee_id, plan_id, effective_from)
            DO UPDATE SET dependents = EXCLUDED.dependents, updated_at = NOW()
            RETURNING *
        `)) as any;
        return enrollment;
    }

    async waiveCoverage(tenantId: string, employeeId: string, planId: string) {
        return (await db.execute(sql`
            INSERT INTO benefit_enrollments (
                tenant_id, employee_id, plan_id, enrollment_date, effective_from, status, waived
            ) VALUES (
                ${tenantId}, ${employeeId}, ${planId},
                CURRENT_DATE, CURRENT_DATE, 'Active', TRUE
            )
            ON CONFLICT (tenant_id, employee_id, plan_id, effective_from)
            DO UPDATE SET waived = TRUE, updated_at = NOW()
            RETURNING *
        `)) as any;
    }

    async terminateEnrollment(enrollmentId: string, effectiveTo: string) {
        return (await db.execute(sql`
            UPDATE benefit_enrollments
            SET status = 'Terminated', effective_to = ${effectiveTo}, updated_at = NOW()
            WHERE id = ${enrollmentId}
            RETURNING *
        `)) as any;
    }

    async getEmployeeEnrollments(tenantId: string, employeeId: string) {
        return (await db.execute(sql`
            SELECT be.*, bp.name AS plan_name, bp.benefit_type, bp.employee_cost, bp.employer_cost, bp.currency_code
            FROM benefit_enrollments be
            JOIN benefit_plans bp ON bp.id = be.plan_id
            WHERE be.tenant_id = ${tenantId} AND be.employee_id = ${employeeId}
              AND be.status = 'Active'
            ORDER BY bp.benefit_type
        `) as any).rows;
    }

    async getTenantSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT
                bp.benefit_type,
                COUNT(be.id) FILTER (WHERE be.status = 'Active' AND NOT be.waived) AS enrolled,
                COUNT(be.id) FILTER (WHERE be.waived) AS waived,
                SUM(bp.employee_cost) FILTER (WHERE be.status = 'Active' AND NOT be.waived) AS employee_cost_total,
                SUM(bp.employer_cost) FILTER (WHERE be.status = 'Active' AND NOT be.waived) AS employer_cost_total
            FROM benefit_enrollments be
            JOIN benefit_plans bp ON bp.id = be.plan_id
            WHERE be.tenant_id = ${tenantId}
            GROUP BY bp.benefit_type
            ORDER BY bp.benefit_type
        `) as any).rows;
    }
}

export const benefitsEnrollmentService = new BenefitsEnrollmentService();
