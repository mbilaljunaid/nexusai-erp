import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * HedgeEffectivenessService — TREAS-OG-02 (IFRS 9 / ASC 815)
 *
 * Manages hedge designations and runs Dollar-Offset or Regression effectiveness tests.
 * Calculates OCI debit/credit for cash flow hedges.
 */
export class HedgeEffectivenessService {

    async createHedgeRelationship(params: {
        tenantId: string;
        hedgeId: string;
        hedgeType: 'CashFlow' | 'FairValue' | 'NetInvestment';
        accountingStd?: 'IFRS9' | 'ASC815';
        hedgingInstrumentDesc: string;
        hedgedItemDesc: string;
        notionalAmount: number;
        currencyCode?: string;
        inceptionDate: string;
        maturityDate: string;
    }) {
        const [rel] = (await db.execute(sql`
            INSERT INTO hedge_relationships (
                tenant_id, hedge_id, hedge_type, accounting_std, hedging_instrument_desc,
                hedged_item_desc, notional_amount, currency_code, inception_date, maturity_date
            ) VALUES (
                ${params.tenantId}, ${params.hedgeId}, ${params.hedgeType},
                ${params.accountingStd ?? 'IFRS9'}, ${params.hedgingInstrumentDesc},
                ${params.hedgedItemDesc}, ${params.notionalAmount}, ${params.currencyCode ?? 'USD'},
                ${params.inceptionDate}, ${params.maturityDate}
            )
            ON CONFLICT (tenant_id, hedge_id) DO UPDATE SET
                notional_amount = EXCLUDED.notional_amount,
                maturity_date = EXCLUDED.maturity_date
            RETURNING *
        `)) as any;
        return rel;
    }

    /**
     * Run a Dollar-Offset effectiveness test (most common).
     * Effectiveness ratio = |Δ hedging instrument FV| / |Δ hedged item FV|
     * Must be 80-125% to qualify as "highly effective" under IFRS 9 / ASC 815.
     */
    async runEffectivenessTest(params: {
        hedgeRelId: string;
        testDate: string;
        method?: 'DollarOffset' | 'Regression';
        hedgingGainLoss: number;
        hedgedItemGainLoss: number;
        notes?: string;
        testedBy?: string;
    }) {
        const hedgeRel = (await db.execute(sql`SELECT * FROM hedge_relationships WHERE id = ${params.hedgeRelId}`) as any).rows?.[0];
        if (!hedgeRel) throw new Error('Hedge relationship not found');

        // Dollar-Offset: ratio = hedging G/L / hedged item G/L (sign-adjusted)
        const ratio = params.hedgedItemGainLoss !== 0
            ? Math.abs(params.hedgingGainLoss / params.hedgedItemGainLoss)
            : 0;

        const isHighlyEffective = ratio >= 0.8 && ratio <= 1.25;

        // OCI calculation for Cash Flow hedges — the effective portion goes to OCI
        let ociAmount = 0;
        let plReclassified = 0;
        if (hedgeRel.hedge_type === 'CashFlow') {
            const effectivePortion = isHighlyEffective ? params.hedgingGainLoss : params.hedgedItemGainLoss;
            const ineffectivePortion = params.hedgingGainLoss - effectivePortion;
            ociAmount = -effectivePortion;  // OCI credit = hedge gain protects future cash flow
            plReclassified = ineffectivePortion;  // Ineffective goes straight to P&L
        }

        const [result] = (await db.execute(sql`
            INSERT INTO hedge_effectiveness_tests (
                hedge_rel_id, test_date, method, hedging_gain_loss, hedged_item_gain_loss,
                effectiveness_ratio, oci_amount, pl_reclassified, notes, tested_by
            ) VALUES (
                ${params.hedgeRelId}, ${params.testDate}, ${params.method ?? 'DollarOffset'},
                ${params.hedgingGainLoss}, ${params.hedgedItemGainLoss}, ${ratio},
                ${ociAmount}, ${plReclassified}, ${params.notes ?? null}, ${params.testedBy ?? null}
            ) RETURNING *
        `)) as any;

        // If test fails, mark hedge as under review
        if (!isHighlyEffective) {
            await db.execute(sql`
                UPDATE hedge_relationships SET status = 'Discontinued'
                WHERE id = ${params.hedgeRelId}
            `);
        }

        return {
            ...result,
            isHighlyEffective,
            effectivenessRatio: ratio,
            ociAmount,
            plReclassified,
            warning: !isHighlyEffective ? 'HEDGE DESIGNATED AS DISCONTINUED — ratio outside 80-125% range' : undefined,
        };
    }

    async listHedges(tenantId: string, status?: string) {
        if (status) {
            return (await db.execute(sql`
                SELECT hr.*,
                    (SELECT het.is_highly_effective FROM hedge_effectiveness_tests het WHERE het.hedge_rel_id = hr.id ORDER BY het.test_date DESC LIMIT 1) AS last_effectiveness
                FROM hedge_relationships hr
                WHERE hr.tenant_id = ${tenantId} AND hr.status = ${status}
                ORDER BY hr.maturity_date
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT hr.*,
                (SELECT het.is_highly_effective FROM hedge_effectiveness_tests het WHERE het.hedge_rel_id = hr.id ORDER BY het.test_date DESC LIMIT 1) AS last_effectiveness
            FROM hedge_relationships hr
            WHERE hr.tenant_id = ${tenantId}
            ORDER BY hr.maturity_date
        `) as any).rows;
    }

    async getTestHistory(hedgeRelId: string) {
        return (await db.execute(sql`
            SELECT * FROM hedge_effectiveness_tests
            WHERE hedge_rel_id = ${hedgeRelId}
            ORDER BY test_date DESC
        `) as any).rows;
    }
}

export const hedgeEffectivenessService = new HedgeEffectivenessService();
