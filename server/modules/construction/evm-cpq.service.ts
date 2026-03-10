import { db } from "../../db";
import { sql } from "drizzle-orm";

/** EVMService — EVM Earned Value Management */
export class EVMService {
    async createBaseline(params: { tenantId: string; projectId: string; baselineName: string; totalBac?: number }) {
        const [r] = (await db.execute(sql`
            INSERT INTO evm_baselines (tenant_id, project_id, baseline_name, total_bac)
            VALUES (${params.tenantId}, ${params.projectId}, ${params.baselineName}, ${params.totalBac ?? null})
            RETURNING *
        `)) as any;
        return r;
    }

    async upsertControlAccount(params: {
        tenantId: string; baselineId: string; wbsCode: string; description?: string;
        plannedValue?: number; earnedValue?: number; actualCost?: number; currency?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO evm_control_accounts (tenant_id, baseline_id, wbs_code, description, planned_value, earned_value, actual_cost, currency)
            VALUES (${params.tenantId}, ${params.baselineId}, ${params.wbsCode}, ${params.description ?? null},
                ${params.plannedValue ?? 0}, ${params.earnedValue ?? 0}, ${params.actualCost ?? 0}, ${params.currency ?? 'USD'})
            ON CONFLICT DO NOTHING
            RETURNING *
        `)) as any;
        return r;
    }

    async postEVMActuals(baselineId: string, wbsCode: string, earnedValue: number, actualCost: number) {
        await db.execute(sql`
            UPDATE evm_control_accounts SET earned_value = earned_value + ${earnedValue}, actual_cost = actual_cost + ${actualCost}
            WHERE baseline_id = ${baselineId} AND wbs_code = ${wbsCode}
        `);
    }

    async getMetrics(baselineId: string) {
        const rows = (await db.execute(sql`
            SELECT wbs_code, description, planned_value AS pv, earned_value AS ev, actual_cost AS ac,
                (earned_value - planned_value)         AS sv,
                (earned_value - actual_cost)           AS cv,
                ROUND(earned_value / NULLIF(actual_cost,0), 4)       AS cpi,
                ROUND(earned_value / NULLIF(planned_value,0), 4)     AS spi
            FROM evm_control_accounts WHERE baseline_id = ${baselineId}
            ORDER BY wbs_code
        `) as any).rows;
        const totals = rows.reduce((s: any, r: any) => ({
            pv: s.pv + Number(r.pv ?? 0), ev: s.ev + Number(r.ev ?? 0), ac: s.ac + Number(r.ac ?? 0)
        }), { pv: 0, ev: 0, ac: 0 });
        return { controlAccounts: rows, totals, eac: totals.ac + (Number(totals.pv) - Number(totals.ev)) };
    }

    // Drawing Register
    async createDrawing(params: {
        tenantId: string; projectId: string; drawingNumber: string; title: string;
        discipline?: string; rev?: string; fileUrl?: string; issuedBy?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO drawing_register (tenant_id, project_id, drawing_number, title, discipline, rev, file_url, issued_by, status)
            VALUES (${params.tenantId}, ${params.projectId}, ${params.drawingNumber}, ${params.title},
                ${params.discipline ?? null}, ${params.rev ?? 'A'}, ${params.fileUrl ?? null}, ${params.issuedBy ?? null}, 'For_Review')
            ON CONFLICT (tenant_id, project_id, drawing_number, rev) DO NOTHING
            RETURNING *
        `)) as any;
        return r;
    }

    async approveDrawing(drawingId: string, approvedBy: string) {
        const evt = { at: new Date().toISOString(), by: approvedBy, action: 'APPROVED' };
        await db.execute(sql`
            UPDATE drawing_register SET status = 'Approved', approved_by = ${approvedBy}, issued_at = NOW(),
                revisions = revisions || ${JSON.stringify([evt])}::jsonb
            WHERE id = ${drawingId}
        `);
        return { drawingId, status: 'Approved' };
    }

    async listDrawings(tenantId: string, projectId: string, status?: string) {
        let q = sql`SELECT * FROM drawing_register WHERE tenant_id = ${tenantId} AND project_id = ${projectId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        return (await db.execute(sql`${q} ORDER BY drawing_number, rev`) as any).rows;
    }
}

/** CPQService — Configure Price Quote */
export class CPQService {
    async createQuote(params: {
        tenantId: string; customerId: string; opportunityId?: string;
        currency?: string; validUntil?: string; createdBy?: string;
    }) {
        const quoteNumber = `Q-${Date.now().toString(36).toUpperCase()}`;
        const [r] = (await db.execute(sql`
            INSERT INTO cpq_quotes (tenant_id, quote_number, customer_id, opportunity_id, currency, valid_until, created_by)
            VALUES (${params.tenantId}, ${quoteNumber}, ${params.customerId}, ${params.opportunityId ?? null},
                ${params.currency ?? 'USD'}, ${params.validUntil ?? null}, ${params.createdBy ?? null})
            RETURNING *
        `)) as any;
        return r;
    }

    async addLine(params: {
        tenantId: string; quoteId: string; productId: string; description?: string;
        quantity: number; unitPrice: number; discountPct?: number; productConfig?: any;
    }) {
        const [lastLine] = (await db.execute(sql`
            SELECT MAX(line_number) AS max_line FROM cpq_quote_lines WHERE quote_id = ${params.quoteId}
        `)) as any;
        const lineNumber = (Number(lastLine?.max_line ?? 0)) + 1;
        const [r] = (await db.execute(sql`
            INSERT INTO cpq_quote_lines (tenant_id, quote_id, line_number, product_id, description, quantity, unit_price, discount_pct, product_config)
            VALUES (${params.tenantId}, ${params.quoteId}, ${lineNumber}, ${params.productId}, ${params.description ?? null},
                ${params.quantity}, ${params.unitPrice}, ${params.discountPct ?? 0}, ${JSON.stringify(params.productConfig ?? {})}::jsonb)
            RETURNING *
        `)) as any;
        // Re-compute quote totals
        await this._recalcTotals(params.quoteId);
        return r;
    }

    private async _recalcTotals(quoteId: string) {
        await db.execute(sql`
            UPDATE cpq_quotes q SET
                list_total = (SELECT COALESCE(SUM(quantity * unit_price), 0) FROM cpq_quote_lines WHERE quote_id = q.id),
                net_total  = (SELECT COALESCE(SUM(net_price), 0) FROM cpq_quote_lines WHERE quote_id = q.id),
                margin_pct = NULL -- calc separately if cost data available
            WHERE id = ${quoteId}
        `);
    }

    async transition(quoteId: string, action: 'SUBMIT' | 'APPROVE' | 'PRESENT' | 'WIN' | 'LOSE' | 'EXPIRE', actor: string) {
        const statusMap: Record<string, string> = { SUBMIT: 'Pending_Approval', APPROVE: 'Approved', PRESENT: 'Presented', WIN: 'Won', LOSE: 'Lost', EXPIRE: 'Expired' };
        const newStatus = statusMap[action];
        await db.execute(sql`
            UPDATE cpq_quotes SET status = ${newStatus},
                approved_by = CASE WHEN ${action} = 'APPROVE' THEN ${actor} ELSE approved_by END,
                presented_at = CASE WHEN ${action} = 'PRESENT' THEN NOW() ELSE presented_at END
            WHERE id = ${quoteId}
        `);
        return { quoteId, status: newStatus };
    }

    async list(tenantId: string, status?: string, customerId?: string) {
        let q = sql`
            SELECT q.*, (SELECT json_agg(l) FROM cpq_quote_lines l WHERE l.quote_id = q.id) AS lines
            FROM cpq_quotes q WHERE q.tenant_id = ${tenantId}`;
        if (status) q = sql`${q} AND q.status = ${status}`;
        if (customerId) q = sql`${q} AND q.customer_id = ${customerId}`;
        return (await db.execute(sql`${q} ORDER BY q.created_at DESC LIMIT 100`) as any).rows;
    }
}

/** RenewalService — Contract renewal automation */
export class RenewalService {
    async upsert(params: {
        tenantId: string; contractNumber: string; customerId: string; renewalDate: string;
        subscriptionId?: string; mrr?: number; currency?: string; autoRenew?: boolean;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO renewal_contracts (tenant_id, contract_number, customer_id, renewal_date, subscription_id, mrr, currency, auto_renew)
            VALUES (${params.tenantId}, ${params.contractNumber}, ${params.customerId}, ${params.renewalDate},
                ${params.subscriptionId ?? null}, ${params.mrr ?? null}, ${params.currency ?? 'USD'}, ${params.autoRenew ?? false})
            ON CONFLICT DO NOTHING
            RETURNING *
        `)) as any;
        return r;
    }

    async renew(contractId: string, renewedBy: string, notes?: string) {
        await db.execute(sql`
            UPDATE renewal_contracts SET status = 'Renewed', renewed_by = ${renewedBy}, renewed_at = NOW(), notes = ${notes ?? null}
            WHERE id = ${contractId}
        `);
        return { contractId, status: 'Renewed' };
    }

    async getUpcoming(tenantId: string, daysAhead = 30) {
        return (await db.execute(sql`
            SELECT *, (renewal_date - CURRENT_DATE) AS days_until_renewal
            FROM renewal_contracts
            WHERE tenant_id = ${tenantId} AND status = 'Pending'
              AND renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + ${daysAhead}
            ORDER BY renewal_date
        `) as any).rows;
    }

    async list(tenantId: string, status?: string) {
        let q = sql`SELECT *, (renewal_date - CURRENT_DATE) AS days_until_renewal FROM renewal_contracts WHERE tenant_id = ${tenantId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        return (await db.execute(sql`${q} ORDER BY renewal_date`) as any).rows;
    }
}

export const evmService = new EVMService();
export const cpqService = new CPQService();
export const renewalService = new RenewalService();
