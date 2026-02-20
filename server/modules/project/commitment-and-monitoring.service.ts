import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * CommitmentTrackingService — PA-OG-04
 * Tracks POs, subcontracts, and preliminary estimates versus actual invoices.
 */
export class CommitmentTrackingService {

    async createCommitment(params: {
        tenantId: string; projectId: string; commitmentType?: string;
        referenceNumber?: string; vendorId?: string; description?: string;
        committedAmount: number; currencyCode?: string;
        commitmentDate?: string; expectedCloseDate?: string;
    }) {
        const [c] = (await db.execute(sql`
            INSERT INTO project_commitments (
                tenant_id, project_id, commitment_type, reference_number, vendor_id, description,
                committed_amount, currency_code, commitment_date, expected_close_date
            ) VALUES (
                ${params.tenantId}, ${params.projectId}, ${params.commitmentType ?? 'PO'},
                ${params.referenceNumber ?? null}, ${params.vendorId ?? null}, ${params.description ?? null},
                ${params.committedAmount}, ${params.currencyCode ?? 'USD'},
                ${params.commitmentDate ?? null}, ${params.expectedCloseDate ?? null}
            ) RETURNING *
        `)) as any;
        return c;
    }

    async recordInvoice(commitmentId: string, invoicedAmount: number) {
        const curr = (await db.execute(sql`SELECT * FROM project_commitments WHERE id = ${commitmentId}`) as any).rows?.[0];
        if (!curr) throw new Error('Commitment not found');
        const newInvoiced = Number(curr.invoiced_amount) + invoicedAmount;
        const newStatus = newInvoiced >= Number(curr.committed_amount) ? 'FullyInvoiced' : 'PartiallyInvoiced';
        await db.execute(sql`
            UPDATE project_commitments
            SET invoiced_amount = ${newInvoiced}, status = ${newStatus}
            WHERE id = ${commitmentId}
        `);
        return { commitmentId, newInvoiced, remaining: Number(curr.committed_amount) - newInvoiced, status: newStatus };
    }

    async closeCommitment(commitmentId: string) {
        await db.execute(sql`UPDATE project_commitments SET status = 'Closed' WHERE id = ${commitmentId}`);
        return { commitmentId, status: 'Closed' };
    }

    async listCommitments(tenantId: string, projectId?: string, status?: string, type?: string) {
        let q = sql`SELECT * FROM project_commitments WHERE tenant_id = ${tenantId}`;
        if (projectId) q = sql`${q} AND project_id = ${projectId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        if (type) q = sql`${q} AND commitment_type = ${type}`;
        q = sql`${q} ORDER BY commitment_date DESC NULLS LAST LIMIT 200`;
        return (await db.execute(q) as any).rows;
    }

    async getCommitmentSummary(tenantId: string, projectId: string) {
        return (await db.execute(sql`
            SELECT
                commitment_type,
                COUNT(*) AS count,
                SUM(committed_amount) AS total_committed,
                SUM(invoiced_amount) AS total_invoiced,
                SUM(remaining_amount) AS total_remaining
            FROM project_commitments
            WHERE tenant_id = ${tenantId} AND project_id = ${projectId}
              AND status NOT IN ('Cancelled', 'Closed')
            GROUP BY commitment_type
            ORDER BY total_remaining DESC
        `) as any).rows;
    }
}

export const commitmentTrackingService = new CommitmentTrackingService();

// ─── Resource Plan vs Actuals ──────────────────────────────────────────────────
/**
 * ResourcePlanActualsService — PA-OG-05
 */
export class ResourcePlanActualsService {

    async upsertPlan(params: { tenantId: string; projectId: string; resourceId: string; resourceType?: string; role?: string; periodStart: string; periodEnd: string; plannedHours?: number; plannedCost?: number; currencyCode?: string }) {
        const [p] = (await db.execute(sql`
            INSERT INTO project_resource_plans (
                tenant_id, project_id, resource_id, resource_type, role,
                period_start, period_end, planned_hours, planned_cost, currency_code
            ) VALUES (
                ${params.tenantId}, ${params.projectId}, ${params.resourceId}, ${params.resourceType ?? 'LABOR'},
                ${params.role ?? null}, ${params.periodStart}, ${params.periodEnd},
                ${params.plannedHours ?? 0}, ${params.plannedCost ?? 0}, ${params.currencyCode ?? 'USD'}
            ) ON CONFLICT DO NOTHING RETURNING *
        `)) as any;
        return p;
    }

    async recordActuals(params: { tenantId: string; projectId: string; resourceId: string; resourceType?: string; periodStart: string; periodEnd: string; actualHours?: number; actualCost?: number; currencyCode?: string; source?: string }) {
        const [a] = (await db.execute(sql`
            INSERT INTO project_resource_actuals (
                tenant_id, project_id, resource_id, resource_type,
                period_start, period_end, actual_hours, actual_cost, currency_code, source
            ) VALUES (
                ${params.tenantId}, ${params.projectId}, ${params.resourceId}, ${params.resourceType ?? 'LABOR'},
                ${params.periodStart}, ${params.periodEnd}, ${params.actualHours ?? 0},
                ${params.actualCost ?? 0}, ${params.currencyCode ?? 'USD'}, ${params.source ?? 'MANUAL'}
            ) RETURNING *
        `)) as any;
        return a;
    }

    async getVarianceReport(tenantId: string, projectId: string) {
        return (await db.execute(sql`
            SELECT
                p.resource_id, p.resource_type, p.role,
                p.period_start, p.period_end,
                p.planned_hours, COALESCE(a.actual_hours, 0) AS actual_hours,
                p.planned_hours - COALESCE(a.actual_hours, 0) AS hour_variance,
                p.planned_cost, COALESCE(a.actual_cost, 0) AS actual_cost,
                p.planned_cost - COALESCE(a.actual_cost, 0) AS cost_variance,
                CASE WHEN p.planned_cost > 0
                    THEN ROUND(((COALESCE(a.actual_cost, 0) - p.planned_cost) / p.planned_cost) * 100, 1)
                    ELSE 0 END AS variance_pct
            FROM project_resource_plans p
            LEFT JOIN project_resource_actuals a
                ON a.project_id = p.project_id AND a.resource_id = p.resource_id
               AND a.period_start = p.period_start
            WHERE p.tenant_id = ${tenantId} AND p.project_id = ${projectId}
            ORDER BY p.period_start, p.resource_id
        `) as any).rows;
    }

    async getProjectSummary(tenantId: string, projectId: string) {
        return (await db.execute(sql`
            SELECT
                SUM(p.planned_hours) AS total_planned_hours,
                SUM(a.actual_hours) AS total_actual_hours,
                SUM(p.planned_cost) AS total_planned_cost,
                SUM(a.actual_cost) AS total_actual_cost,
                SUM(p.planned_cost) - COALESCE(SUM(a.actual_cost), 0) AS cost_variance
            FROM project_resource_plans p
            LEFT JOIN project_resource_actuals a USING (tenant_id, project_id, resource_id, period_start)
            WHERE p.tenant_id = ${tenantId} AND p.project_id = ${projectId}
        `) as any).rows?.[0];
    }
}

export const resourcePlanActualsService = new ResourcePlanActualsService();

// ─── Budget Exception Alert Service — PA-OG-06 ────────────────────────────────
export class BudgetExceptionAlertService {

    async createAlert(params: {
        tenantId: string; projectId: string; alertType: string; severity?: string;
        budgetAmount?: number; actualAmount?: number; variancePct?: number;
        thresholdPct?: number; description?: string;
    }) {
        const [a] = (await db.execute(sql`
            INSERT INTO project_budget_alerts (
                tenant_id, project_id, alert_type, severity,
                budget_amount, actual_amount, variance_pct, threshold_pct, description
            ) VALUES (
                ${params.tenantId}, ${params.projectId}, ${params.alertType},
                ${params.severity ?? 'Warning'}, ${params.budgetAmount ?? null},
                ${params.actualAmount ?? null}, ${params.variancePct ?? null},
                ${params.thresholdPct ?? null}, ${params.description ?? null}
            ) RETURNING *
        `)) as any;
        return a;
    }

    async listAlerts(tenantId: string, projectId?: string, acknowledged = false) {
        let q = sql`SELECT * FROM project_budget_alerts WHERE tenant_id = ${tenantId} AND is_acknowledged = ${acknowledged}`;
        if (projectId) q = sql`${q} AND project_id = ${projectId}`;
        q = sql`${q} ORDER BY created_at DESC LIMIT 200`;
        return (await db.execute(q) as any).rows;
    }

    async acknowledge(alertId: string, acknowledgedBy: string) {
        await db.execute(sql`
            UPDATE project_budget_alerts
            SET is_acknowledged = TRUE, acknowledged_by = ${acknowledgedBy}, acknowledged_at = NOW()
            WHERE id = ${alertId}
        `);
        return { alertId, acknowledged: true };
    }

    /**
     * Sweep all projects and generate alerts where cost > threshold.
     */
    async runExceptionDetection(tenantId: string) {
        const projects = (await db.execute(sql`
            SELECT
                p.project_id,
                SUM(p.planned_cost) AS planned,
                COALESCE(SUM(a.actual_cost), 0) AS actual
            FROM project_resource_plans p
            LEFT JOIN project_resource_actuals a USING (tenant_id, project_id, resource_id, period_start)
            WHERE p.tenant_id = ${tenantId}
            GROUP BY p.project_id
            HAVING SUM(p.planned_cost) > 0
        `) as any).rows ?? [];

        const alerts = [];
        for (const proj of projects) {
            const variancePct = ((Number(proj.actual) - Number(proj.planned)) / Number(proj.planned)) * 100;
            if (variancePct >= 10) {
                alerts.push(await this.createAlert({
                    tenantId,
                    projectId: proj.project_id,
                    alertType: 'COST_OVERRUN',
                    severity: variancePct >= 25 ? 'Critical' : 'Warning',
                    budgetAmount: Number(proj.planned),
                    actualAmount: Number(proj.actual),
                    variancePct,
                    thresholdPct: 10,
                    description: `Cost overrun of ${variancePct.toFixed(1)}% detected`,
                }));
            }
        }
        return { projectsScanned: projects.length, alertsCreated: alerts.length };
    }

    async getAlertSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT
                COUNT(*) FILTER (WHERE NOT is_acknowledged AND severity = 'Critical') AS critical,
                COUNT(*) FILTER (WHERE NOT is_acknowledged AND severity = 'Warning') AS warnings,
                COUNT(*) FILTER (WHERE NOT is_acknowledged AND severity = 'Info') AS info,
                COUNT(*) FILTER (WHERE is_acknowledged) AS acknowledged
            FROM project_budget_alerts WHERE tenant_id = ${tenantId}
        `) as any).rows?.[0];
    }
}

export const budgetExceptionAlertService = new BudgetExceptionAlertService();
