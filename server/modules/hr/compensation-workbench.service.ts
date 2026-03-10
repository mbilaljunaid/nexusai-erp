import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * CompensationWorkbenchService — HR-OG-06
 *
 * Manages merit review, bonus, and promotion compensation cycles.
 * Supports manager budget allocation and maker-checker approval flow.
 */
export class CompensationWorkbenchService {

    async createPlan(params: {
        tenantId: string;
        name: string;
        planType: 'MeritReview' | 'BonusCycle' | 'PromoRound';
        cycleStart: string;
        cycleEnd: string;
        budgetTotal?: number;
        currencyCode?: string;
    }) {
        const [plan] = (await db.execute(sql`
            INSERT INTO compensation_plans (
                tenant_id, name, plan_type, cycle_start, cycle_end, budget_total, currency_code
            ) VALUES (
                ${params.tenantId}, ${params.name}, ${params.planType},
                ${params.cycleStart}, ${params.cycleEnd},
                ${params.budgetTotal ?? null}, ${params.currencyCode ?? 'USD'}
            )
            RETURNING *
        `)) as any;
        return plan;
    }

    async submitProposal(params: {
        planId: string;
        employeeId: string;
        currentSalary: number;
        proposedSalary?: number;
        bonusAmount?: number;
        meritPct?: number;
        currencyCode?: string;
        managerId?: string;
        notes?: string;
    }) {
        const [proposal] = (await db.execute(sql`
            INSERT INTO compensation_proposals (
                plan_id, employee_id, current_salary, proposed_salary, bonus_amount, merit_pct,
                currency_code, manager_id, notes
            ) VALUES (
                ${params.planId}, ${params.employeeId}, ${params.currentSalary},
                ${params.proposedSalary ?? null}, ${params.bonusAmount ?? null},
                ${params.meritPct ?? null}, ${params.currencyCode ?? 'USD'},
                ${params.managerId ?? null}, ${params.notes ?? null}
            )
            ON CONFLICT DO NOTHING
            RETURNING *
        `)) as any;
        return proposal;
    }

    async approveProposal(proposalId: string, approvedBy: string) {
        return (await db.execute(sql`
            UPDATE compensation_proposals
            SET status = 'Approved', updated_at = NOW()
            WHERE id = ${proposalId} AND status IN ('Draft', 'Submitted')
            RETURNING *
        `)) as any;
    }

    /**
     * Apply approved proposals — update employee salaries in bulk
     */
    async applyPlan(planId: string, appliedBy: string) {
        const proposals = (await db.execute(sql`
            SELECT * FROM compensation_proposals
            WHERE plan_id = ${planId} AND status = 'Approved'
        `) as any).rows ?? [];

        let applied = 0;
        for (const p of proposals) {
            if (p.proposed_salary) {
                await db.execute(sql`
                    UPDATE employees
                    SET base_salary = ${p.proposed_salary}, updated_at = NOW()
                    WHERE id = ${p.employee_id}
                `);
                await db.execute(sql`
                    UPDATE compensation_proposals SET status = 'Applied', updated_at = NOW()
                    WHERE id = ${p.id}
                `);
                applied++;
            }
        }

        await db.execute(sql`
            UPDATE compensation_plans SET status = 'Applied' WHERE id = ${planId}
        `);

        return { planId, applied, total: proposals.length };
    }

    async listPlans(tenantId: string) {
        return (await db.execute(sql`
            SELECT p.*,
                   COUNT(pr.id) AS proposal_count,
                   SUM(pr.proposed_salary - pr.current_salary) AS total_increase,
                   SUM(pr.bonus_amount) AS total_bonus
            FROM compensation_plans p
            LEFT JOIN compensation_proposals pr ON pr.plan_id = p.id
            WHERE p.tenant_id = ${tenantId}
            GROUP BY p.id
            ORDER BY p.cycle_start DESC
        `) as any).rows;
    }

    async getPlanProposals(planId: string) {
        return (await db.execute(sql`
            SELECT cp.*, e.full_name, e.job_title
            FROM compensation_proposals cp
            LEFT JOIN employees e ON e.id = cp.employee_id
            WHERE cp.plan_id = ${planId}
            ORDER BY cp.status, e.full_name
        `) as any).rows;
    }

    async getBudgetSummary(planId: string) {
        return (await db.execute(sql`
            SELECT
                plan.budget_total,
                plan.currency_code,
                SUM(pr.proposed_salary - pr.current_salary) AS salary_increase_total,
                SUM(pr.bonus_amount) AS bonus_total,
                (plan.budget_total - COALESCE(SUM(pr.proposed_salary - pr.current_salary), 0) - COALESCE(SUM(pr.bonus_amount), 0)) AS remaining_budget,
                COUNT(pr.id) FILTER (WHERE pr.status = 'Approved') AS approved_count,
                COUNT(pr.id) FILTER (WHERE pr.status = 'Draft') AS draft_count
            FROM compensation_plans plan
            LEFT JOIN compensation_proposals pr ON pr.plan_id = plan.id
            WHERE plan.id = ${planId}
            GROUP BY plan.id, plan.budget_total, plan.currency_code
        `) as any).rows?.[0];
    }
}

export const compensationWorkbenchService = new CompensationWorkbenchService();
