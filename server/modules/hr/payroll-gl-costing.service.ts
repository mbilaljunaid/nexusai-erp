import { db } from "../../db";
import { sql } from "drizzle-orm";
import { financeService } from "../../services/finance";

/**
 * PayrollGLCostingService — HR-OG-04 (GL costing leg)
 *
 * Generates GL journal entries from an approved payroll run.
 * Maps payroll element result lines to their GL accounts and posts the journal.
 */
export class PayrollGLCostingService {

    async postCostingJournal(runId: string, userId: string) {
        // Load run header
        const run = (await db.execute(sql`SELECT * FROM payroll_runs WHERE id = ${runId}`) as any).rows?.[0];
        if (!run) throw new Error('Payroll run not found');
        if (!['Approved', 'Paid'].includes(run.status)) throw new Error('Run must be Approved before GL posting');

        // Aggregate by GL account
        const aggregated = (await db.execute(sql`
            SELECT gl_account_code, element_type_proxy, SUM(calculated_amount) AS total
            FROM (
                SELECT rr.gl_account_code,
                       pe.element_type AS element_type_proxy,
                       rr.calculated_amount
                FROM payroll_run_results rr
                JOIN payroll_elements pe ON pe.id = rr.element_id
                WHERE rr.run_id = ${runId} AND rr.gl_account_code IS NOT NULL
            ) sub
            GROUP BY gl_account_code, element_type_proxy
        `) as any).rows ?? [];

        const lines: Array<{
            accountId: string;
            enteredDebit: number;
            enteredCredit: number;
            description: string;
        }> = [];

        for (const row of aggregated) {
            const amount = Number(row.total ?? 0);
            const isDeduction = ['Deduction', 'Tax', 'Employer_Contribution'].includes(row.element_type_proxy);

            lines.push({
                accountId: row.gl_account_code,
                enteredDebit: isDeduction ? 0 : amount,
                enteredCredit: isDeduction ? amount : 0,
                description: `Payroll ${run.payroll_name} — ${row.element_type_proxy}`,
            });
        }

        // Balancing entry: Net payroll payable
        const netPayable = Number(run.net_total);
        lines.push({
            accountId: '2100-PAYROLL-PAYABLE',
            enteredDebit: 0,
            enteredCredit: netPayable,
            description: `Payroll Payable — ${run.payroll_name}`,
        });

        const journal = await financeService.createJournal({
            journalNumber: `PAY-${runId.slice(0, 8).toUpperCase()}`,
            description: `Payroll Costing — ${run.payroll_name} (${run.period_start} to ${run.period_end})`,
            ledgerId: 'PRIMARY',
            currencyCode: run.currency_code,
            source: 'Payroll',
            status: 'Posted',
            batchId: runId,
        }, lines, userId);

        // Update run with GL batch reference
        await db.execute(sql`
            UPDATE payroll_runs SET gl_batch_id = ${journal.id}, updated_at = NOW()
            WHERE id = ${runId}
        `);

        return { runId, journalId: journal.id, lineCount: lines.length };
    }
}

export const payrollGLCostingService = new PayrollGLCostingService();
