import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * AccountCertificationService — FC-OG-01
 *
 * Manages the Account Reconciliation Certification Portal:
 * Preparer prepares → Reviewer reviews → Certified / Escalated
 * SOX-compliant sign-off with before/after balance comparison.
 */
export class AccountCertificationService {

    /** Create or reset certification for an account+period */
    async createCertification(params: {
        tenantId: string;
        accountId: string;
        ledgerId?: string;
        periodName: string;
        preparerId: string;
        reviewerId: string;
        balancePerGL: number;
        balancePerSub: number;
    }) {
        const { tenantId, accountId, ledgerId, periodName, preparerId, reviewerId, balancePerGL, balancePerSub } = params;

        const [cert] = (await db.execute(sql`
            INSERT INTO account_certifications (
                tenant_id, account_id, ledger_id, period_name,
                preparer_id, reviewer_id, balance_per_gl, balance_per_sub, status
            ) VALUES (
                ${tenantId}, ${accountId}, ${ledgerId ?? null}, ${periodName},
                ${preparerId}, ${reviewerId}, ${balancePerGL}, ${balancePerSub}, 'Pending'
            )
            ON CONFLICT DO NOTHING
            RETURNING *
        `)) as any;

        return cert;
    }

    /** Preparer submits for review */
    async submitForReview(certId: string, preparerId: string, notes?: string) {
        await db.execute(sql`
            UPDATE account_certifications
            SET status = 'In-Review',
                prepared_at = NOW(),
                notes = COALESCE(${notes ?? null}, notes),
                updated_at = NOW()
            WHERE id = ${certId} AND preparer_id = ${preparerId} AND status = 'Pending'
        `);
        return { certId, status: 'In-Review' };
    }

    /** Reviewer certifies */
    async certify(certId: string, reviewerId: string) {
        await db.execute(sql`
            UPDATE account_certifications
            SET status = 'Certified', reviewed_at = NOW(), certified_at = NOW(), updated_at = NOW()
            WHERE id = ${certId} AND reviewer_id = ${reviewerId} AND status = 'In-Review'
        `);
        return { certId, status: 'Certified' };
    }

    /** Reviewer rejects — sends back to preparer */
    async reject(certId: string, reviewerId: string, reason: string) {
        await db.execute(sql`
            UPDATE account_certifications
            SET status = 'Rejected', reviewed_at = NOW(), escalation_reason = ${reason}, updated_at = NOW()
            WHERE id = ${certId} AND reviewer_id = ${reviewerId} AND status = 'In-Review'
        `);
        return { certId, status: 'Rejected' };
    }

    /** Admin escalates (e.g. past deadline) */
    async escalate(certId: string, reason: string) {
        await db.execute(sql`
            UPDATE account_certifications
            SET status = 'Escalated', escalated_at = NOW(), escalation_reason = ${reason}, updated_at = NOW()
            WHERE id = ${certId} AND status IN ('Pending','In-Review')
        `);
        return { certId, status: 'Escalated' };
    }

    /** Get certifications for a period (status overview) */
    async getCertificationsByPeriod(tenantId: string, periodName: string) {
        return (await db.execute(sql`
            SELECT ac.*,
                   p.email AS preparer_email,
                   r.email AS reviewer_email
            FROM account_certifications ac
            LEFT JOIN auth.users p ON ac.preparer_id = p.id::text
            LEFT JOIN auth.users r ON ac.reviewer_id = r.id::text
            WHERE ac.tenant_id = ${tenantId} AND ac.period_name = ${periodName}
            ORDER BY ABS(ac.variance) DESC NULLS LAST
        `) as any).rows;
    }

    /** Summary: count by status for a period */
    async getSummary(tenantId: string, periodName: string) {
        return (await db.execute(sql`
            SELECT status, COUNT(*) AS count,
                   SUM(ABS(variance)) AS total_variance
            FROM account_certifications
            WHERE tenant_id = ${tenantId} AND period_name = ${periodName}
            GROUP BY status
        `) as any).rows;
    }

    /** Escalate all overdue certifications (called by scheduler) */
    async escalateOverdue(tenantId: string, periodName: string, dueDays = 5) {
        const result = await db.execute(sql`
            UPDATE account_certifications
            SET status = 'Escalated', escalated_at = NOW(),
                escalation_reason = 'Overdue — not certified within ' || ${dueDays} || ' days',
                updated_at = NOW()
            WHERE tenant_id = ${tenantId}
              AND period_name = ${periodName}
              AND status IN ('Pending','In-Review')
              AND created_at < NOW() - INTERVAL '1 day' * ${dueDays}
            RETURNING id
        `);
        return { escalatedCount: ((result as any).rows ?? []).length };
    }
}

export const accountCertificationService = new AccountCertificationService();
