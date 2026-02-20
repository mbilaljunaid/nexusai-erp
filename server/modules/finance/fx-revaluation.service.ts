import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * FxRevaluationService — APAR-OG-04
 *
 * Monthly FX revaluation for foreign currency balances per IAS 21 / ASC 830.
 * Steps:
 * 1. Query GL balances for all non-base-currency accounts
 * 2. Fetch current spot rates from fx_rates table
 * 3. Compute unrealised G/L (new BC amount - old BC amount)
 * 4. Generate GL journal entries (Debit/Credit FX G/L account)
 * 5. Persist run + line details
 */
export class FxRevaluationService {

    async runRevaluation(params: {
        tenantId: string;
        ledgerId?: string;
        periodName: string;
        revaluationDate: string;
        baseCurrency?: string;
        fxGlGainAccount?: string;
        fxGlLossAccount?: string;
        runBy?: string;
    }) {
        const baseCurrency = params.baseCurrency ?? 'USD';
        const gainAccount = params.fxGlGainAccount ?? '8100';  // default FX gain GL
        const lossAccount = params.fxGlLossAccount ?? '8110';  // default FX loss GL

        // Create the run record
        const [run] = (await db.execute(sql`
            INSERT INTO fx_revaluation_runs (
                tenant_id, ledger_id, period_name, revaluation_date, base_currency, status, run_by
            ) VALUES (
                ${params.tenantId}, ${params.ledgerId ?? null}, ${params.periodName},
                ${params.revaluationDate}, ${baseCurrency}, 'Draft', ${params.runBy ?? 'system'}
            ) RETURNING *
        `)) as any;

        // Query all FC balances from GL
        const fcBalances = (await db.execute(sql`
            SELECT gb.account_code, gb.account_name, gb.currency_code,
                   SUM(gb.period_net_dr - gb.period_net_cr) AS balance_fc,
                   gb.base_currency_rate AS old_rate
            FROM gl_balances gb
            WHERE gb.tenant_id = ${params.tenantId}
              AND gb.currency_code != ${baseCurrency}
              AND gb.period_name = ${params.periodName}
              ${params.ledgerId ? sql`AND gb.ledger_id = ${params.ledgerId}` : sql``}
            GROUP BY gb.account_code, gb.account_name, gb.currency_code, gb.base_currency_rate
            HAVING SUM(gb.period_net_dr - gb.period_net_cr) != 0
        `) as any).rows ?? [];

        if (fcBalances.length === 0) {
            await db.execute(sql`UPDATE fx_revaluation_runs SET status = 'Posted', total_gain_loss = 0 WHERE id = ${run.id}`);
            return { run: { ...run, status: 'Posted' }, lines: [], totalGainLoss: 0 };
        }

        // Fetch current FX rates
        const currencies = [...new Set(fcBalances.map((b: any) => b.currency_code))] as string[];
        const rateRows = (await db.execute(sql`
            SELECT from_currency, rate FROM fx_rates
            WHERE to_currency = ${baseCurrency}
              AND from_currency = ANY(${currencies})
              AND effective_date <= ${params.revaluationDate}
            ORDER BY effective_date DESC
        `) as any).rows ?? [];

        const rateMap = new Map<string, number>();
        for (const r of rateRows) {
            if (!rateMap.has(r.from_currency)) rateMap.set(r.from_currency, Number(r.rate));
        }

        // Calculate G/L per balance
        const revalLines = [];
        let totalGainLoss = 0;

        for (const bal of fcBalances) {
            const balanceFC = Number(bal.balance_fc);
            const oldRate = Number(bal.old_rate) || 1;
            const newRate = rateMap.get(bal.currency_code) ?? oldRate;

            const oldBC = balanceFC * oldRate;
            const newBC = balanceFC * newRate;
            const gainLoss = newBC - oldBC;

            totalGainLoss += gainLoss;

            const [line] = (await db.execute(sql`
                INSERT INTO fx_revaluation_lines (
                    run_id, foreign_currency, account_code, account_name,
                    balance_fc, old_rate, new_rate, old_bc_amount, new_bc_amount, gain_loss
                ) VALUES (
                    ${run.id}, ${bal.currency_code}, ${bal.account_code}, ${bal.account_name ?? null},
                    ${balanceFC}, ${oldRate}, ${newRate}, ${oldBC}, ${newBC}, ${gainLoss}
                ) RETURNING *
            `)) as any;
            revalLines.push(line);
        }

        // Generate offsetting GL journal
        const journalLines = revalLines.flatMap(l => {
            const isGain = Number(l.gain_loss) > 0;
            return [
                { accountCode: l.account_code, debit: isGain ? 0 : Math.abs(l.gain_loss), credit: isGain ? l.gain_loss : 0, description: `FX Reval ${l.foreign_currency}` },
                { accountCode: isGain ? gainAccount : lossAccount, debit: isGain ? l.gain_loss : 0, credit: isGain ? 0 : Math.abs(l.gain_loss), description: `FX Reval G/L ${l.foreign_currency}` },
            ];
        });

        // Post journal via direct insert (simplified — production uses financeService.createJournal)
        const journalRef = `FXREVAL-${params.periodName}-${Date.now()}`;
        await db.execute(sql`
            INSERT INTO journal_entries (
                tenant_id, journal_number, ledger_id, period_name, journal_date,
                description, status, source
            ) VALUES (
                ${params.tenantId}, ${journalRef}, ${params.ledgerId ?? null}, ${params.periodName},
                ${params.revaluationDate}, ${`FX Revaluation ${params.periodName}`}, 'Posted', 'FX_REVAL'
            )
            ON CONFLICT DO NOTHING
        `);

        await db.execute(sql`UPDATE fx_revaluation_runs SET status = 'Posted', total_gain_loss = ${totalGainLoss} WHERE id = ${run.id}`);

        return { run: { ...run, status: 'Posted', totalGainLoss }, lines: revalLines, totalGainLoss, journalRef };
    }

    async reverseRevaluation(runId: string) {
        const run = (await db.execute(sql`SELECT * FROM fx_revaluation_runs WHERE id = ${runId}`) as any).rows?.[0];
        if (!run) throw new Error('Run not found');
        if (run.status !== 'Posted') throw new Error('Only Posted runs can be reversed');

        await db.execute(sql`UPDATE fx_revaluation_runs SET status = 'Reversed' WHERE id = ${runId}`);
        return { runId, status: 'Reversed' };
    }

    async listRuns(tenantId: string, periodName?: string) {
        if (periodName) {
            return (await db.execute(sql`
                SELECT * FROM fx_revaluation_runs WHERE tenant_id = ${tenantId} AND period_name = ${periodName}
                ORDER BY run_at DESC
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT * FROM fx_revaluation_runs WHERE tenant_id = ${tenantId}
            ORDER BY run_at DESC LIMIT 50
        `) as any).rows;
    }

    async getRunLines(runId: string) {
        return (await db.execute(sql`
            SELECT * FROM fx_revaluation_lines WHERE run_id = ${runId}
            ORDER BY ABS(gain_loss) DESC
        `) as any).rows;
    }

    async getSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT
                COUNT(*) AS total_runs,
                SUM(total_gain_loss) FILTER (WHERE total_gain_loss > 0) AS total_gains,
                SUM(total_gain_loss) FILTER (WHERE total_gain_loss < 0) AS total_losses,
                SUM(total_gain_loss) AS net_impact
            FROM fx_revaluation_runs WHERE tenant_id = ${tenantId} AND status = 'Posted'
        `) as any).rows?.[0];
    }
}

export const fxRevaluationService = new FxRevaluationService();
