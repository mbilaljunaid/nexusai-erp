import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * FundingLimitService — PA-OG-02
 * Tracks funding sources, enforces spending limits, fires alerts at threshold.
 */
export class FundingLimitService {

    async createFundingLimit(params: {
        tenantId: string; projectId: string; fundingSource: string;
        limitAmount: number; currencyCode?: string; effectiveFrom?: string;
        effectiveTo?: string; alertThresholdPct?: number; restrictCharges?: boolean; notes?: string;
    }) {
        const [fl] = (await db.execute(sql`
            INSERT INTO project_funding_limits (
                tenant_id, project_id, funding_source, limit_amount, currency_code,
                effective_from, effective_to, alert_threshold_pct, restrict_charges, notes
            ) VALUES (
                ${params.tenantId}, ${params.projectId}, ${params.fundingSource},
                ${params.limitAmount}, ${params.currencyCode ?? 'USD'},
                ${params.effectiveFrom ?? null}, ${params.effectiveTo ?? null},
                ${params.alertThresholdPct ?? 80}, ${params.restrictCharges ?? true},
                ${params.notes ?? null}
            ) RETURNING *
        `)) as any;
        return fl;
    }

    async listFundingLimits(tenantId: string, projectId?: string, status?: string) {
        let q = sql`SELECT *, ROUND((utilized_amount / NULLIF(limit_amount,0)) * 100, 1) AS utilization_pct FROM project_funding_limits WHERE tenant_id = ${tenantId}`;
        if (projectId) q = sql`${q} AND project_id = ${projectId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        q = sql`${q} ORDER BY project_id, funding_source`;
        return (await db.execute(q) as any).rows;
    }

    /**
     * Record a charge against a funding limit.
     * If restrict_charges = true and limit would be exceeded, throws.
     */
    async applyCharge(fundingLimitId: string, amount: number, chargedBy?: string) {
        const fl = (await db.execute(sql`SELECT * FROM project_funding_limits WHERE id = ${fundingLimitId} FOR UPDATE`) as any).rows?.[0];
        if (!fl) throw new Error('Funding limit not found');

        const newUtilized = Number(fl.utilized_amount) + amount;
        const utilizationPct = (newUtilized / Number(fl.limit_amount)) * 100;

        if (fl.restrict_charges && newUtilized > Number(fl.limit_amount)) {
            throw new Error(`Charge of ${amount} would exceed funding limit of ${fl.limit_amount} (${fl.funding_source}). Current utilization: ${Number(fl.utilized_amount).toFixed(2)}.`);
        }

        const newStatus = newUtilized >= Number(fl.limit_amount) ? 'Exhausted' : fl.status;

        await db.execute(sql`
            UPDATE project_funding_limits
            SET utilized_amount = ${newUtilized}, status = ${newStatus}
            WHERE id = ${fundingLimitId}
        `);

        // Fire budget alert if threshold crossed
        if (utilizationPct >= Number(fl.alert_threshold_pct)) {
            await db.execute(sql`
                INSERT INTO project_budget_alerts (
                    tenant_id, project_id, alert_type, severity,
                    budget_amount, actual_amount, variance_pct, threshold_pct, description
                ) VALUES (
                    ${fl.tenant_id}, ${fl.project_id}, 'FUNDING_LIMIT',
                    ${utilizationPct >= 100 ? 'Critical' : 'Warning'},
                    ${fl.limit_amount}, ${newUtilized}, ${utilizationPct - 100},
                    ${fl.alert_threshold_pct},
                    ${'Funding limit ' + fl.funding_source + ' at ' + utilizationPct.toFixed(1) + '% utilization'}
                )
            `);
        }

        return { fundingLimitId, newUtilized, utilizationPct: utilizationPct.toFixed(1) + '%', status: newStatus };
    }

    async getFundingUtilizationReport(tenantId: string, projectId: string) {
        return (await db.execute(sql`
            SELECT
                funding_source, limit_amount, utilized_amount,
                limit_amount - utilized_amount AS available,
                ROUND((utilized_amount / NULLIF(limit_amount, 0)) * 100, 1) AS utilization_pct,
                status, alert_threshold_pct, restrict_charges
            FROM project_funding_limits
            WHERE tenant_id = ${tenantId} AND project_id = ${projectId}
            ORDER BY utilization_pct DESC
        `) as any).rows;
    }
}

export const fundingLimitService = new FundingLimitService();

// ─── Progress Billing ──────────────────────────────────────────────────────────
/**
 * ProgressBillingService — PA-OG-03
 */
export class ProgressBillingService {

    async createSchedule(params: {
        tenantId: string; projectId: string; customerId: string;
        billingType?: string; billingFrequency?: string;
        contractValue: number; currencyCode?: string; retentionPct?: number;
    }) {
        const [sched] = (await db.execute(sql`
            INSERT INTO progress_billing_schedules (
                tenant_id, project_id, customer_id, billing_type, billing_frequency,
                contract_value, currency_code, retention_pct
            ) VALUES (
                ${params.tenantId}, ${params.projectId}, ${params.customerId},
                ${params.billingType ?? 'MILESTONE'}, ${params.billingFrequency ?? null},
                ${params.contractValue}, ${params.currencyCode ?? 'USD'}, ${params.retentionPct ?? 0}
            ) RETURNING *
        `)) as any;
        return sched;
    }

    async createBillingEvent(params: {
        tenantId: string; scheduleId: string; projectId: string;
        billingPeriod: string; pctComplete?: number; amountBilled: number;
    }) {
        const sched = (await db.execute(sql`SELECT * FROM progress_billing_schedules WHERE id = ${params.scheduleId}`) as any).rows?.[0];
        const retention = sched ? Math.round(params.amountBilled * Number(sched.retention_pct) / 100 * 100) / 100 : 0;
        const [evt] = (await db.execute(sql`
            INSERT INTO progress_billing_events (
                tenant_id, schedule_id, project_id, billing_period,
                pct_complete, amount_billed, retention_withheld
            ) VALUES (
                ${params.tenantId}, ${params.scheduleId}, ${params.projectId},
                ${params.billingPeriod}, ${params.pctComplete ?? 0},
                ${params.amountBilled}, ${retention}
            ) RETURNING *
        `)) as any;
        return evt;
    }

    async approveEvent(eventId: string, approvedBy: string) {
        await db.execute(sql`UPDATE progress_billing_events SET status = 'Approved', approved_at = NOW(), approved_by = ${approvedBy} WHERE id = ${eventId}`);
        return { eventId, status: 'Approved' };
    }

    async generateInvoice(eventId: string, invoiceNumber: string) {
        await db.execute(sql`UPDATE progress_billing_events SET status = 'Invoiced', invoice_number = ${invoiceNumber} WHERE id = ${eventId}`);
        return { eventId, invoiceNumber, status: 'Invoiced' };
    }

    async listEvents(tenantId: string, projectId: string, status?: string) {
        let q = sql`SELECT e.*, s.billing_type, s.customer_id, s.retention_pct FROM progress_billing_events e JOIN progress_billing_schedules s ON s.id = e.schedule_id WHERE e.tenant_id = ${tenantId} AND e.project_id = ${projectId}`;
        if (status) q = sql`${q} AND e.status = ${status}`;
        q = sql`${q} ORDER BY e.billing_period DESC`;
        return (await db.execute(q) as any).rows;
    }

    async getBilledSummary(tenantId: string, projectId: string) {
        return (await db.execute(sql`
            SELECT
                COUNT(*) AS total_events,
                COALESCE(SUM(amount_billed), 0) AS total_billed,
                COALESCE(SUM(retention_withheld), 0) AS total_retention,
                COALESCE(SUM(amount_billed) FILTER (WHERE status = 'Paid'), 0) AS total_paid,
                COALESCE(SUM(amount_billed) FILTER (WHERE status IN ('Invoiced','Approved')), 0) AS total_outstanding
            FROM progress_billing_events
            WHERE tenant_id = ${tenantId} AND project_id = ${projectId}
        `) as any).rows?.[0];
    }
}

export const progressBillingService = new ProgressBillingService();
