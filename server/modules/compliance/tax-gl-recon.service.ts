import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * TaxGLReconService — COMP-OG-03
 *
 * Reconciles tax return lines against GL account balances for a period.
 * Produces matched/unmatched variance report and stores each line's status.
 */
export class TaxGLReconService {

    /**
     * Run a full tax-GL reconciliation for a period
     */
    async runRecon(params: {
        tenantId: string;
        periodName: string;
        ledgerId?: string;
        taxReturnLines: Array<{
            lineRef: string;           // e.g. 'VAT_OUTPUT_BOX_1'
            taxAmount: number;
            glAccountCode: string;
        }>;
        runBy: string;
    }) {
        const { tenantId, periodName, ledgerId, taxReturnLines, runBy } = params;

        const [run] = (await db.execute(sql`
            INSERT INTO tax_gl_recon_runs (tenant_id, period_name, ledger_id, status, run_by)
            VALUES (${tenantId}, ${periodName}, ${ledgerId ?? null}, 'Running', ${runBy})
            RETURNING *
        `)) as any;

        let matchedCount = 0;
        let unmatchedCount = 0;
        let varianceTotal = 0;

        try {
            for (const line of taxReturnLines) {
                // Fetch GL balance for this account in the period
                const glResult = await db.execute(sql`
                    SELECT COALESCE(SUM(period_net_dr - period_net_cr), 0) AS balance
                    FROM gl_balances
                    WHERE ${ledgerId ? sql`ledger_id = ${ledgerId} AND` : sql``}
                          account_code = ${line.glAccountCode}
                      AND period_name = ${periodName}
                `);
                const glAmount = Number(((glResult as any).rows?.[0] as any)?.balance ?? 0);
                const variance = glAmount - line.taxAmount;
                const matchStatus = Math.abs(variance) < 0.01 ? 'Matched' : 'Unmatched';

                if (matchStatus === 'Matched') matchedCount++;
                else { unmatchedCount++; varianceTotal += Math.abs(variance); }

                await db.execute(sql`
                    INSERT INTO tax_gl_recon_lines (
                        run_id, tax_return_line, tax_amount, gl_account_code, gl_amount, match_status
                    ) VALUES (
                        ${run.id}, ${line.lineRef}, ${line.taxAmount},
                        ${line.glAccountCode}, ${glAmount}, ${matchStatus}
                    )
                `);
            }

            await db.execute(sql`
                UPDATE tax_gl_recon_runs
                SET status = 'Completed', matched_count = ${matchedCount},
                    unmatched_count = ${unmatchedCount},
                    variance_total = ${varianceTotal},
                    completed_at = NOW()
                WHERE id = ${run.id}
            `);

            return {
                runId: run.id, periodName, matchedCount, unmatchedCount,
                varianceTotal, totalLines: taxReturnLines.length,
            };

        } catch (error: any) {
            await db.execute(sql`
                UPDATE tax_gl_recon_runs
                SET status = 'Error', error_log = ${error.message}
                WHERE id = ${run.id}
            `);
            throw error;
        }
    }

    async getRunLines(runId: string) {
        return (await db.execute(sql`
            SELECT * FROM tax_gl_recon_lines
            WHERE run_id = ${runId}
            ORDER BY match_status DESC, ABS(tax_amount - gl_amount) DESC
        `) as any).rows;
    }

    async listRuns(tenantId: string, periodName?: string) {
        if (periodName) {
            return (await db.execute(sql`
                SELECT * FROM tax_gl_recon_runs
                WHERE tenant_id = ${tenantId} AND period_name = ${periodName}
                ORDER BY started_at DESC
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT * FROM tax_gl_recon_runs
            WHERE tenant_id = ${tenantId}
            ORDER BY started_at DESC LIMIT 50
        `) as any).rows;
    }

    async markLineDisputed(lineId: string, notes: string) {
        await db.execute(sql`
            UPDATE tax_gl_recon_lines
            SET match_status = 'Disputed', notes = ${notes}
            WHERE id = ${lineId}
        `);
        return { lineId, status: 'Disputed' };
    }

    /** Compliance controls: create or update a control item */
    async upsertComplianceControl(params: {
        tenantId: string;
        controlClass: string;
        countryCode?: string;
        dueDate: string;
        periodName: string;
        description?: string;
        ownerId?: string;
    }) {
        const [control] = (await db.execute(sql`
            INSERT INTO compliance_controls (
                tenant_id, control_class, country_code, due_date, period_name, description, owner_id
            ) VALUES (
                ${params.tenantId}, ${params.controlClass}, ${params.countryCode ?? null},
                ${params.dueDate}, ${params.periodName}, ${params.description ?? null}, ${params.ownerId ?? null}
            )
            ON CONFLICT DO NOTHING
            RETURNING *
        `)) as any;
        return control;
    }

    async listComplianceControls(tenantId: string, periodName?: string) {
        if (periodName) {
            return (await db.execute(sql`
                SELECT * FROM compliance_controls
                WHERE tenant_id = ${tenantId} AND period_name = ${periodName}
                ORDER BY due_date ASC
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT * FROM compliance_controls
            WHERE tenant_id = ${tenantId}
            ORDER BY due_date ASC LIMIT 100
        `) as any).rows;
    }

    async completeControl(controlId: string, evidenceUrl?: string) {
        await db.execute(sql`
            UPDATE compliance_controls
            SET status = 'Complete', completed_at = NOW(),
                evidence_url = ${evidenceUrl ?? null}, updated_at = NOW()
            WHERE id = ${controlId}
        `);
        return { controlId, status: 'Complete' };
    }
}

export const taxGLReconService = new TaxGLReconService();
