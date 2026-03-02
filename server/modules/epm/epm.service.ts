import { db } from "../../db";
import { sql } from "drizzle-orm";

/** ESGPlanningService — EPM-OG-01 */
export class ESGPlanningService {
    async createGoal(params: {
        tenantId: string; goalCode: string; goalName: string; category?: string;
        subcategory?: string; unit?: string; baselineValue?: number; baselineYear?: number;
        targetValue?: number; targetYear?: number; owner?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO esg_goals (tenant_id, goal_code, goal_name, category, subcategory, unit, baseline_value, baseline_year, target_value, target_year, owner, status)
            VALUES (${params.tenantId}, ${params.goalCode}, ${params.goalName}, ${params.category ?? 'ENVIRONMENTAL'},
                ${params.subcategory ?? null}, ${params.unit ?? null}, ${params.baselineValue ?? null},
                ${params.baselineYear ?? null}, ${params.targetValue ?? null}, ${params.targetYear ?? null},
                ${params.owner ?? null}, 'Active')
            RETURNING *
        `)) as any;
        return r;
    }

    async recordActual(params: {
        tenantId: string; goalId: string; period: string; actualValue: number;
        dataSource?: string; verifiedBy?: string; notes?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO esg_actuals (tenant_id, goal_id, period, actual_value, data_source, verified_by, notes)
            VALUES (${params.tenantId}, ${params.goalId}, ${params.period}, ${params.actualValue},
                ${params.dataSource ?? null}, ${params.verifiedBy ?? null}, ${params.notes ?? null})
            ON CONFLICT DO NOTHING
            RETURNING *
        `)) as any;
        // Auto-update goal status based on trajectory
        await this._updateGoalStatus(params.goalId, params.tenantId);
        return r;
    }

    private async _updateGoalStatus(goalId: string, tenantId: string) {
        const goal = (await db.execute(sql`SELECT * FROM esg_goals WHERE id = ${goalId}`) as any).rows?.[0];
        if (!goal?.target_value) return;
        const latest = (await db.execute(sql`
            SELECT actual_value FROM esg_actuals WHERE goal_id = ${goalId} ORDER BY period DESC LIMIT 1
        `) as any).rows?.[0];
        if (!latest) return;
        const progressPct = (Number(latest.actual_value) / Number(goal.target_value)) * 100;
        const status = progressPct >= 100 ? 'Achieved' : progressPct >= 80 ? 'On_Track' : progressPct >= 50 ? 'At_Risk' : 'Off_Track';
        await db.execute(sql`UPDATE esg_goals SET status = ${status} WHERE id = ${goalId}`);
    }

    async listGoals(tenantId: string, ledgerId?: string, category?: string, status?: string) {
        let q = sql`SELECT * FROM esg_goals WHERE tenant_id = ${tenantId}`;
        if (ledgerId) q = sql`${q} AND ent_ledger_id = ${ledgerId}`;
        if (category) q = sql`${q} AND category = ${category}`;
        if (status) q = sql`${q} AND status = ${status}`;
        return (await db.execute(sql`${q} ORDER BY category, goal_code`) as any).rows;
    }

    async getGoalPerformance(tenantId: string, goalId: string) {
        const goal = (await db.execute(sql`SELECT * FROM esg_goals WHERE id = ${goalId}`) as any).rows?.[0];
        const actuals = (await db.execute(sql`
            SELECT * FROM esg_actuals WHERE goal_id = ${goalId} ORDER BY period
        `) as any).rows;
        return { goal, actuals };
    }

    async getSummaryByCategory(tenantId: string) {
        return (await db.execute(sql`
            SELECT category, status, COUNT(*) AS count
            FROM esg_goals WHERE tenant_id = ${tenantId}
            GROUP BY category, status ORDER BY category, status
        `) as any).rows;
    }
}

/** BudgetaryControlService — EPM-OG-02 */
export class BudgetaryControlService {
    async upsertControl(params: {
        tenantId: string; budgetVersion?: string; costCenter: string; glAccount: string;
        period: string; currency?: string; budgetAmount: number; tolerancePct?: number; controlAction?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO budget_controls (tenant_id, budget_version, cost_center, gl_account, period, currency, budget_amount, tolerance_pct, control_action)
            VALUES (${params.tenantId}, ${params.budgetVersion ?? 'Working'}, ${params.costCenter}, ${params.glAccount},
                ${params.period}, ${params.currency ?? 'USD'}, ${params.budgetAmount},
                ${params.tolerancePct ?? 10.0}, ${params.controlAction ?? 'WARN'})
            ON CONFLICT (tenant_id, budget_version, cost_center, gl_account, period)
            DO UPDATE SET budget_amount = EXCLUDED.budget_amount, tolerance_pct = EXCLUDED.tolerance_pct,
                control_action = EXCLUDED.control_action, updated_at = NOW()
            RETURNING *
        `)) as any;
        return r;
    }

    async check(params: {
        tenantId: string; costCenter: string; glAccount: string; period: string;
        amount: number; checkType?: string; sourceDoc?: string;
    }) {
        const ctrl = (await db.execute(sql`
            SELECT * FROM budget_controls
            WHERE tenant_id = ${params.tenantId} AND cost_center = ${params.costCenter}
              AND gl_account = ${params.glAccount} AND period = ${params.period}
              AND budget_version = 'Approved'
            LIMIT 1
        `) as any).rows?.[0];

        if (!ctrl) return { result: 'PASS', message: 'No approved budget control found — pass by default' };

        const available = Number(ctrl.budget_amount)
            - Number(ctrl.actual_amount)
            - Number(ctrl.committed_amount)
            - Number(ctrl.encumbrance_amount);
        const toleranceAmt = Number(ctrl.budget_amount) * (Number(ctrl.tolerance_pct) / 100);
        const overage = params.amount - available;

        let result: 'PASS' | 'WARN' | 'BLOCKED';
        if (overage <= 0) result = 'PASS';
        else if (overage <= toleranceAmt && ctrl.control_action !== 'HARD_STOP') result = 'WARN';
        else result = 'BLOCKED';

        // Log the check
        await db.execute(sql`
            INSERT INTO budget_check_log (tenant_id, control_id, check_type, amount_checked, available_amount, result, source_doc)
            VALUES (${params.tenantId}, ${ctrl.id}, ${params.checkType ?? 'COMMIT'}, ${params.amount}, ${available}, ${result}, ${params.sourceDoc ?? null})
        `);
        return { result, available, overage: Math.max(0, overage), controlAction: ctrl.control_action, controlId: ctrl.id };
    }

    async postActual(controlId: string, amount: number) {
        await db.execute(sql`
            UPDATE budget_controls SET actual_amount = actual_amount + ${amount}, updated_at = NOW()
            WHERE id = ${controlId}
        `);
        return { controlId, posted: amount };
    }

    async getVarianceReport(tenantId: string, ledgerId?: string, period?: string, budgetVersion = 'Approved') {
        const periodFilter = period ? sql`AND period = ${period}` : sql``;
        const ledgerFilter = ledgerId ? sql`AND ent_ledger_id = ${ledgerId}` : sql``;
        return (await db.execute(sql`
            SELECT cost_center, gl_account, budget_amount, actual_amount, committed_amount, encumbrance_amount,
                (budget_amount - actual_amount - committed_amount - encumbrance_amount) AS available,
                ROUND(100.0 * actual_amount / NULLIF(budget_amount, 0), 2) AS utilization_pct,
                control_action
            FROM budget_controls
            WHERE tenant_id = ${tenantId} ${ledgerFilter} ${periodFilter} AND budget_version = ${budgetVersion}
            ORDER BY utilization_pct DESC NULLS LAST
        `) as any).rows;
    }

    async list(tenantId: string, ledgerId?: string, period?: string, costCenter?: string) {
        let q = sql`SELECT * FROM budget_controls WHERE tenant_id = ${tenantId}`;
        if (ledgerId) q = sql`${q} AND ent_ledger_id = ${ledgerId}`;
        if (period) q = sql`${q} AND period = ${period}`;
        if (costCenter) q = sql`${q} AND cost_center = ${costCenter}`;
        return (await db.execute(sql`${q} ORDER BY utilization_pct DESC NULLS LAST`) as any).rows;
    }
}

/** NarrativeReportingService — EPM-OG-03 */
export class NarrativeReportingService {
    async createReport(params: {
        tenantId: string; reportName: string; reportType?: string;
        period: string; createdBy?: string; templateId?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO narrative_reports (tenant_id, report_name, report_type, period, created_by, template_id, sections)
            VALUES (${params.tenantId}, ${params.reportName}, ${params.reportType ?? 'MD_AND_A'},
                ${params.period}, ${params.createdBy ?? null}, ${params.templateId ?? null}, '[]'::jsonb)
            RETURNING *
        `)) as any;
        return r;
    }

    async upsertSection(reportId: string, section: { id: string; title: string; body: string; order?: number; lastEditedBy?: string }) {
        const report = (await db.execute(sql`SELECT sections FROM narrative_reports WHERE id = ${reportId}`) as any).rows?.[0];
        if (!report) throw new Error('Report not found');
        const sections: any[] = report.sections ?? [];
        const idx = sections.findIndex(s => s.id === section.id);
        const entry = { ...section, last_edited_at: new Date().toISOString(), last_edited_by: section.lastEditedBy ?? 'unknown' };
        if (idx >= 0) sections[idx] = entry;
        else sections.push(entry);
        sections.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        await db.execute(sql`UPDATE narrative_reports SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = ${reportId}`);
        return entry;
    }

    async transition(reportId: string, action: 'SUBMIT' | 'APPROVE' | 'PUBLISH', actor: string) {
        const statusMap: Record<string, string> = { SUBMIT: 'In_Review', APPROVE: 'Approved', PUBLISH: 'Published' };
        const newStatus = statusMap[action];
        await db.execute(sql`
            UPDATE narrative_reports SET status = ${newStatus},
                approved_by = CASE WHEN ${action} = 'APPROVE' THEN ${actor} ELSE approved_by END,
                published_at = CASE WHEN ${action} = 'PUBLISH' THEN NOW() ELSE published_at END
            WHERE id = ${reportId}
        `);
        return { reportId, status: newStatus };
    }

    async listReports(tenantId: string, ledgerId?: string, period?: string, status?: string, reportType?: string) {
        let q = sql`SELECT id, report_name, report_type, period, status, created_by, approved_by, published_at, created_at FROM narrative_reports WHERE tenant_id = ${tenantId}`;
        if (ledgerId) q = sql`${q} AND ent_ledger_id = ${ledgerId}`;
        if (period) q = sql`${q} AND period = ${period}`;
        if (status) q = sql`${q} AND status = ${status}`;
        if (reportType) q = sql`${q} AND report_type = ${reportType}`;
        return (await db.execute(sql`${q} ORDER BY created_at DESC`) as any).rows;
    }

    async getReport(reportId: string) {
        return (await db.execute(sql`SELECT * FROM narrative_reports WHERE id = ${reportId}`) as any).rows?.[0];
    }
}

export const esgPlanningService = new ESGPlanningService();
export const budgetaryControlService = new BudgetaryControlService();
export const narrativeReportingService = new NarrativeReportingService();
