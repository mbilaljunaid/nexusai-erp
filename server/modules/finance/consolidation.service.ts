import { db } from "../../db";
import {
    glConsolidationRuns, glEliminationDefinitions,
    glLedgerRelationships
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { financeService } from "./finance.service";

/**
 * ConsolidationService — P1-B Fix (FC-OG-04, FC-OG-05, EPM-OG-03)
 *
 * Replaces the 60%-mocked MVP implementation with:
 * 1. Real IC balance aggregation from ic_entity_balances
 * 2. IC invoice-level matching (AR vs AP per entity pair)
 * 3. Actual elimination journals computed from paired IC balances
 * 4. CTA (Cumulative Translation Adjustment) journals
 * 5. Minority interest allocation per entity ownership %
 */
export class ConsolidationService {

    async runConsolidation(ledgerSetId: string, periodId: string, userId: string) {
        const [run] = await db.insert(glConsolidationRuns).values({
            ledgerSetId,
            periodId,
            status: "Running"
        }).returning();

        try {
            console.log(`[Consolidation] Run ${run.id} starting — LedgerSet: ${ledgerSetId}`);

            // Step 1: Elimination rules
            const rules = await db.select().from(glEliminationDefinitions)
                .where(and(
                    eq(glEliminationDefinitions.ledgerSetId, ledgerSetId),
                    eq(glEliminationDefinitions.enabled, true)
                ));

            const eliminationLedgerId = rules.find(r => r.eliminationLedgerId)?.eliminationLedgerId;

            // Step 2: Fetch real IC balances for this period
            const icResult = await db.execute(sql`
                SELECT entity_id, counterparty_entity_id, account_code,
                       balance_type, functional_amount, cta_amount, minority_interest_pct
                FROM ic_entity_balances
                WHERE period_name = ${periodId}
            `);
            const balanceRows: any[] = (icResult as any).rows ?? [];

            // Step 3: Build elimination pairs (each AR ↔ AP pair)
            type ElimPair = {
                entityId: string; counterpartyId: string; accountCode: string;
                balanceType: string; amount: number; ctaAmount: number; minorityPct: number;
            };
            const eliminations: ElimPair[] = [];
            const seen = new Set<string>();

            for (const row of balanceRows) {
                const pairKey = [row.entity_id, row.counterparty_entity_id, row.account_code].sort().join('|');
                if (seen.has(pairKey)) continue;
                seen.add(pairKey);

                const mirror = balanceRows.find(
                    r => r.entity_id === row.counterparty_entity_id
                        && r.counterparty_entity_id === row.entity_id
                        && r.account_code === row.account_code
                );
                if (mirror) {
                    eliminations.push({
                        entityId: row.entity_id,
                        counterpartyId: row.counterparty_entity_id,
                        accountCode: row.account_code,
                        balanceType: row.balance_type,
                        amount: Math.abs(Number(row.functional_amount)),
                        ctaAmount: Number(row.cta_amount ?? 0),
                        minorityPct: Number(row.minority_interest_pct ?? 0),
                    });
                }
            }

            let totalEliminated = 0;
            let totalCTA = 0;
            let totalMinorityInterest = 0;

            for (const { entityId, counterpartyId, accountCode, balanceType, amount, ctaAmount, minorityPct } of eliminations) {
                if (!eliminationLedgerId) continue;
                const isReceivable = ['AR', 'Revenue', 'Investment'].includes(balanceType);
                const drAccount = isReceivable ? accountCode : `ELIM-${accountCode}`;
                const crAccount = isReceivable ? `ELIM-${accountCode}` : accountCode;

                // IC Elimination journal
                await financeService.createJournal({
                    journalNumber: `ELIM-${run.id.slice(0, 8)}-${entityId.slice(0, 4)}`,
                    description: `IC Elimination: ${balanceType} — ${entityId.slice(0, 8)} ↔ ${counterpartyId.slice(0, 8)} [${accountCode}]`,
                    ledgerId: eliminationLedgerId,
                    currencyCode: "USD",
                    source: "Consolidation",
                    status: "Posted",
                    batchId: run.id
                }, [
                    { accountId: drAccount, enteredDebit: amount, enteredCredit: 0, description: `Elim IC ${balanceType} — ${entityId.slice(0, 8)}` },
                    { accountId: crAccount, enteredDebit: 0, enteredCredit: amount, description: `Elim IC ${balanceType} — ${counterpartyId.slice(0, 8)}` }
                ], userId);
                totalEliminated += amount;

                // CTA journal (FC-OG-05 / EPM-OG-03 — translation adjustment)
                if (Math.abs(ctaAmount) > 0.01) {
                    await financeService.createJournal({
                        journalNumber: `CTA-${run.id.slice(0, 8)}-${entityId.slice(0, 4)}`,
                        description: `CTA Adjustment — ${entityId.slice(0, 8)} [${accountCode}]`,
                        ledgerId: eliminationLedgerId,
                        currencyCode: "USD",
                        source: "Consolidation",
                        status: "Posted",
                        batchId: run.id
                    }, [
                        { accountId: "CONSOL-CTA", enteredDebit: ctaAmount > 0 ? ctaAmount : 0, enteredCredit: ctaAmount < 0 ? Math.abs(ctaAmount) : 0, description: "Cumulative Translation Adjustment" },
                        { accountId: "CONSOL-OCI", enteredDebit: ctaAmount < 0 ? Math.abs(ctaAmount) : 0, enteredCredit: ctaAmount > 0 ? ctaAmount : 0, description: "OCI — CTA offset" }
                    ], userId);
                    totalCTA += Math.abs(ctaAmount);
                }

                // Minority Interest journal (EPM-OG-03)
                if (minorityPct > 0 && minorityPct < 1) {
                    const miAmount = amount * minorityPct;
                    if (miAmount > 0.01) {
                        await financeService.createJournal({
                            journalNumber: `MI-${run.id.slice(0, 8)}-${entityId.slice(0, 4)}`,
                            description: `Minority Interest ${(minorityPct * 100).toFixed(1)}% — ${entityId.slice(0, 8)}`,
                            ledgerId: eliminationLedgerId,
                            currencyCode: "USD",
                            source: "Consolidation",
                            status: "Posted",
                            batchId: run.id
                        }, [
                            { accountId: "CONSOL-RETAINED-EARNINGS", enteredDebit: miAmount, enteredCredit: 0, description: "MI — retained earnings reclassification" },
                            { accountId: "CONSOL-MINORITY-INTEREST", enteredDebit: 0, enteredCredit: miAmount, description: `MI — ${(minorityPct * 100).toFixed(1)}% non-controlling interest` }
                        ], userId);
                        totalMinorityInterest += miAmount;
                    }
                }

                // Record in adjustment table
                await db.execute(sql`
                    INSERT INTO consolidation_adjustments
                        (consolidation_run_id, adjustment_type, entity_id, counterparty_entity_id,
                         account_code, debit_amount, credit_amount, currency_code, description)
                    VALUES (${run.id}, 'IC_Elim', ${entityId}, ${counterpartyId},
                            ${accountCode}, ${amount}, ${amount}, 'USD', ${'IC Elimination: ' + balanceType})
                `);
            }

            // IC Invoice-Level Pre-Consolidation Match (FC-OG-04)
            await this._runICInvoiceMatch(run.id, periodId);

            await db.update(glConsolidationRuns)
                .set({ status: "Completed", completedDate: new Date(), totalEliminations: totalEliminated.toString() })
                .where(eq(glConsolidationRuns.id, run.id));

            console.log(`[Consolidation] ${run.id} complete — Eliminations: ${eliminations.length}, $${totalEliminated.toFixed(2)}, CTA: $${totalCTA.toFixed(2)}, MI: $${totalMinorityInterest.toFixed(2)}`);
            return { success: true, runId: run.id, totalEliminated, totalCTA, totalMinorityInterest, eliminationCount: eliminations.length };

        } catch (error: any) {
            console.error("[Consolidation] Failed:", error);
            await db.update(glConsolidationRuns)
                .set({ status: "Error", errorLog: error.message })
                .where(eq(glConsolidationRuns.id, run.id));
            throw error;
        }
    }

    /** IC Invoice-Level Matching — FC-OG-04 */
    private async _runICInvoiceMatch(runId: string, periodId: string) {
        const pairs = await db.execute(sql`
            SELECT ar.id AS seller_invoice_id, ap.id AS buyer_bill_id,
                   ar.amount_due_remaining AS seller_amount, ap.amount_remaining AS buyer_amount,
                   ar.currency_code, ar.customer_id AS buyer_entity_id, ap.supplier_id AS seller_entity_id
            FROM ar_transactions ar
            JOIN ap_invoices ap ON ar.intercompany_reference = ap.intercompany_reference
            WHERE ar.is_intercompany = true AND ap.is_intercompany = true
              AND ar.period_name = ${periodId} AND ap.period_name = ${periodId}
            LIMIT 500
        `);
        for (const p of ((pairs as any).rows ?? [])) {
            const variance = Math.abs(Number(p.seller_amount) - Number(p.buyer_amount));
            const matchStatus = variance < 0.01 ? 'Matched' : 'Unmatched';
            await db.execute(sql`
                INSERT INTO ic_invoice_matches
                    (consolidation_run_id, period_name, seller_entity_id, buyer_entity_id,
                     seller_invoice_id, buyer_bill_id, seller_amount, buyer_amount, currency_code, match_status)
                VALUES (${runId}, ${periodId}, ${p.seller_entity_id}, ${p.buyer_entity_id},
                        ${p.seller_invoice_id}, ${p.buyer_bill_id},
                        ${p.seller_amount}, ${p.buyer_amount}, ${p.currency_code}, ${matchStatus})
                ON CONFLICT DO NOTHING
            `);
        }
    }

    async getConsolidationHistory(ledgerSetId?: string) {
        if (ledgerSetId) {
            return await db.select().from(glConsolidationRuns)
                .where(eq(glConsolidationRuns.ledgerSetId, ledgerSetId))
                .orderBy(desc(glConsolidationRuns.runDate));
        }
        return await db.select().from(glConsolidationRuns).orderBy(desc(glConsolidationRuns.runDate));
    }

    async getICBalanceDiscrepancies(periodName: string) {
        return await db.execute(sql`
            SELECT *, ABS(variance) AS abs_variance
            FROM ic_invoice_matches
            WHERE match_status IN ('Unmatched','Disputed') AND period_name = ${periodName}
            ORDER BY ABS(variance) DESC LIMIT 200
        `);
    }
}

export const consolidationService = new ConsolidationService();
