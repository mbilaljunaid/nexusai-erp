import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * ReconciliationSignoffService — TREAS-OG-05
 *
 * Bank-to-GL reconciliation workflow:
 * 1. Preparer creates/updates draft with outstanding items
 * 2. Reviewer signs off
 * 3. Approver finalises — triggers GL certification entry
 */
export class ReconciliationSignoffService {

    async createOrUpdateDraft(params: {
        tenantId: string;
        bankAccountId?: string;
        periodName: string;
        statementBalance: number;
        glBalance: number;
        outstandingItems?: Array<{ type: string; amount: number; description: string }>;
        notes?: string;
        preparerId: string;
    }) {
        const outstanding = params.outstandingItems ?? [];
        const reconBalance = params.statementBalance +
            outstanding.filter(i => i.type === 'OutstandingDeposit').reduce((s, i) => s + i.amount, 0) -
            outstanding.filter(i => i.type === 'OutstandingCheque').reduce((s, i) => s + i.amount, 0);

        const [signoff] = (await db.execute(sql`
            INSERT INTO bank_recon_signoffs (
                tenant_id, bank_account_id, period_name, statement_balance, gl_balance,
                outstanding_items, reconciled_balance, status, preparer_id, preparer_signed_at, notes
            ) VALUES (
                ${params.tenantId}, ${params.bankAccountId ?? null}, ${params.periodName},
                ${params.statementBalance}, ${params.glBalance},
                ${JSON.stringify(outstanding)}, ${reconBalance},
                'Draft', ${params.preparerId}, NOW(), ${params.notes ?? null}
            )
            ON CONFLICT (tenant_id, bank_account_id, period_name) DO UPDATE SET
                statement_balance = EXCLUDED.statement_balance,
                gl_balance = EXCLUDED.gl_balance,
                outstanding_items = EXCLUDED.outstanding_items,
                reconciled_balance = EXCLUDED.reconciled_balance,
                notes = EXCLUDED.notes,
                updated_at = NOW()
            RETURNING *
        `)) as any;

        const variance = reconBalance - params.glBalance;
        return { ...signoff, variance, isReconciled: Math.abs(variance) < 0.01 };
    }

    async reviewSignoff(signoffId: string, reviewerId: string) {
        await db.execute(sql`
            UPDATE bank_recon_signoffs
            SET status = 'Reviewed', reviewer_id = ${reviewerId}, reviewer_signed_at = NOW(), updated_at = NOW()
            WHERE id = ${signoffId} AND status = 'Draft'
        `);
        return this._get(signoffId);
    }

    async approveSignoff(signoffId: string, approverId: string) {
        const rec = await this._get(signoffId);
        if (!rec) throw new Error('Signoff not found');
        if (rec.status !== 'Reviewed') throw new Error('Must be Reviewed before Approval');

        const variance = Number(rec.reconciled_balance) - Number(rec.gl_balance);
        if (Math.abs(variance) > 0.01) {
            throw new Error(`Cannot approve unreconciled balance — variance: ${variance.toFixed(2)}`);
        }

        await db.execute(sql`
            UPDATE bank_recon_signoffs
            SET status = 'Approved', approver_id = ${approverId}, approver_signed_at = NOW(), updated_at = NOW()
            WHERE id = ${signoffId}
        `);
        return { signoffId, status: 'Approved', variance };
    }

    async listSignoffs(tenantId: string, status?: string, bankAccountId?: string) {
        const filters = [sql`tenant_id = ${tenantId}`];
        if (status) filters.push(sql`status = ${status}`);
        if (bankAccountId) filters.push(sql`bank_account_id = ${bankAccountId}`);

        return (await db.execute(sql`
            SELECT * FROM bank_recon_signoffs
            WHERE ${sql.join(filters, sql` AND `)}
            ORDER BY period_name DESC LIMIT 50
        `) as any).rows;
    }

    async getSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'Draft') AS drafts,
                COUNT(*) FILTER (WHERE status = 'Reviewed') AS pending_approval,
                COUNT(*) FILTER (WHERE status = 'Approved') AS approved,
                AVG(ABS(reconciled_balance - gl_balance)) AS avg_variance
            FROM bank_recon_signoffs WHERE tenant_id = ${tenantId}
        `) as any).rows?.[0];
    }

    private async _get(id: string) {
        return (await db.execute(sql`SELECT * FROM bank_recon_signoffs WHERE id = ${id}`) as any).rows?.[0] ?? null;
    }
}

export const reconciliationSignoffService = new ReconciliationSignoffService();
