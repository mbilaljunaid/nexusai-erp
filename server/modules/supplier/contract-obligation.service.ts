import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * ContractObligationService — SUP-OG-01
 *
 * Tracks contract obligations per supplier:
 * 1. Create obligations linked to CLM contracts
 * 2. Supplier submits evidence → status → InReview
 * 3. Reviewer marks Met / Waived
 * 4. Overdue checker escalates (level 1 = warn, 2 = manager, 3 = legal)
 * 5. Penalty calculation for breached obligations
 */
export class ContractObligationService {

    async createObligation(params: {
        tenantId: string;
        contractId: string;
        supplierId: string;
        obligationType?: string;
        title: string;
        description?: string;
        dueDate?: string;
        recurrence?: string;
        penaltyAmount?: number;
        currencyCode?: string;
        tenantVisible?: boolean;
    }) {
        const [ob] = (await db.execute(sql`
            INSERT INTO contract_obligations (
                tenant_id, contract_id, supplier_id, obligation_type, title, description,
                due_date, recurrence, penalty_amount, currency_code, tenant_visible
            ) VALUES (
                ${params.tenantId}, ${params.contractId}, ${params.supplierId},
                ${params.obligationType ?? 'DELIVERY'}, ${params.title},
                ${params.description ?? null}, ${params.dueDate ?? null},
                ${params.recurrence ?? 'NONE'}, ${params.penaltyAmount ?? null},
                ${params.currencyCode ?? 'USD'}, ${params.tenantVisible ?? true}
            ) RETURNING *
        `)) as any;
        return ob;
    }

    async listObligations(tenantId: string, supplierId?: string, status?: string, contractId?: string) {
        let q = sql`SELECT * FROM contract_obligations WHERE tenant_id = ${tenantId}`;
        if (supplierId) q = sql`${q} AND supplier_id = ${supplierId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        if (contractId) q = sql`${q} AND contract_id = ${contractId}`;
        q = sql`${q} ORDER BY due_date ASC NULLS LAST, created_at DESC LIMIT 200`;
        return (await db.execute(q) as any).rows;
    }

    async submitEvidence(obligationId: string, evidenceUrl: string, notes?: string) {
        await db.execute(sql`
            UPDATE contract_obligations
            SET status = 'InReview', evidence_url = ${evidenceUrl},
                notes = COALESCE(${notes ?? null}, notes), updated_at = NOW()
            WHERE id = ${obligationId}
        `);
        return { obligationId, status: 'InReview' };
    }

    async review(obligationId: string, decision: 'Met' | 'Waived', reviewedBy: string, notes?: string) {
        await db.execute(sql`
            UPDATE contract_obligations
            SET status = ${decision}, reviewed_by = ${reviewedBy},
                reviewed_at = NOW(), notes = COALESCE(${notes ?? null}, notes),
                escalation_level = 0, updated_at = NOW()
            WHERE id = ${obligationId}
        `);
        return { obligationId, status: decision };
    }

    async escalate(obligationId: string) {
        const ob = (await db.execute(sql`SELECT * FROM contract_obligations WHERE id = ${obligationId}`) as any).rows?.[0];
        if (!ob) throw new Error('Obligation not found');
        const nextLevel = Math.min(3, (ob.escalation_level ?? 0) + 1);
        await db.execute(sql`
            UPDATE contract_obligations
            SET escalation_level = ${nextLevel}, status = 'Overdue', updated_at = NOW()
            WHERE id = ${obligationId}
        `);
        return { obligationId, escalationLevel: nextLevel, label: ['None', 'Warning', 'Manager', 'Legal'][nextLevel] };
    }

    /**
     * Run overdue detection — marks past-due obligations as Overdue and escalates.
     * Called by a scheduled job.
     */
    async processOverdue(tenantId: string) {
        const overdueRows = (await db.execute(sql`
            SELECT id, escalation_level FROM contract_obligations
            WHERE tenant_id = ${tenantId}
              AND due_date < CURRENT_DATE
              AND status IN ('Pending', 'Overdue')
        `) as any).rows ?? [];

        const results = [];
        for (const row of overdueRows) {
            results.push(await this.escalate(row.id));
        }
        return { processed: results.length, results };
    }

    async getSummary(tenantId: string, supplierId?: string) {
        let q = sql`
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
                COUNT(*) FILTER (WHERE status = 'InReview') AS in_review,
                COUNT(*) FILTER (WHERE status = 'Met') AS met,
                COUNT(*) FILTER (WHERE status = 'Overdue') AS overdue,
                COUNT(*) FILTER (WHERE status = 'Waived') AS waived,
                COALESCE(SUM(penalty_amount) FILTER (WHERE status = 'Overdue'), 0) AS total_at_risk
            FROM contract_obligations
            WHERE tenant_id = ${tenantId}
        `;
        if (supplierId) q = sql`${q} AND supplier_id = ${supplierId}`;
        return (await db.execute(q) as any).rows?.[0];
    }

    async getUpcoming(tenantId: string, daysAhead = 30) {
        return (await db.execute(sql`
            SELECT * FROM contract_obligations
            WHERE tenant_id = ${tenantId}
              AND status IN ('Pending')
              AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + ${daysAhead}
            ORDER BY due_date ASC LIMIT 50
        `) as any).rows;
    }
}

export const contractObligationService = new ContractObligationService();
