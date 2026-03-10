import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * TaxProvisionService — FC-OG-02 (ASC 740 / IAS 12)
 *
 * Computes:
 * - Current tax: taxable income × statutory rate
 * - Deferred tax: temp difference × enacted future rate
 * - Effective tax rate (ETR)
 * - Generates GL journal for tax provision entry
 */
export class TaxProvisionService {

    /**
     * Compute tax provision for a given entity and period
     */
    async computeProvision(params: {
        tenantId: string;
        entityId: string;
        periodName: string;
        fiscalYear: number;
        pretaxIncome: number;
        permanentDifferences?: number;
        temporaryDifferences?: number;
        currentTaxRate: number;       // e.g. 0.21
        deferredTaxAsset?: number;
        deferredTaxLiability?: number;
        standard?: 'ASC740' | 'IAS12';
        computedBy: string;
    }) {
        const {
            tenantId, entityId, periodName, fiscalYear,
            pretaxIncome, permanentDifferences = 0, temporaryDifferences = 0,
            currentTaxRate, deferredTaxAsset = 0, deferredTaxLiability = 0,
            standard = 'ASC740', computedBy
        } = params;

        const taxableIncome = pretaxIncome + permanentDifferences + temporaryDifferences;
        const currentTaxExpense = Math.max(0, taxableIncome * currentTaxRate);
        const netDeferred = deferredTaxAsset - deferredTaxLiability;
        const totalTaxExpense = currentTaxExpense - netDeferred;
        const effectiveTaxRate = pretaxIncome !== 0 ? totalTaxExpense / pretaxIncome : 0;

        const [provision] = (await db.execute(sql`
            INSERT INTO tax_provisions (
                tenant_id, entity_id, period_name, fiscal_year,
                pretax_income, permanent_differences, temporary_differences, taxable_income,
                current_tax_rate, current_tax_expense, deferred_tax_asset, deferred_tax_liability,
                effective_tax_rate, standard, status, computed_by, computed_at
            ) VALUES (
                ${tenantId}, ${entityId}, ${periodName}, ${fiscalYear},
                ${pretaxIncome}, ${permanentDifferences}, ${temporaryDifferences}, ${taxableIncome},
                ${currentTaxRate}, ${currentTaxExpense}, ${deferredTaxAsset}, ${deferredTaxLiability},
                ${effectiveTaxRate}, ${standard}, 'Draft', ${computedBy}, NOW()
            )
            ON CONFLICT (tenant_id, entity_id, period_name) DO UPDATE SET
                pretax_income = EXCLUDED.pretax_income,
                taxable_income = EXCLUDED.taxable_income,
                current_tax_expense = EXCLUDED.current_tax_expense,
                deferred_tax_asset = EXCLUDED.deferred_tax_asset,
                deferred_tax_liability = EXCLUDED.deferred_tax_liability,
                effective_tax_rate = EXCLUDED.effective_tax_rate,
                status = 'Draft',
                computed_by = EXCLUDED.computed_by,
                computed_at = NOW(),
                updated_at = NOW()
            RETURNING *
        `)) as any;

        return {
            provisionId: provision?.id,
            taxableIncome,
            currentTaxExpense,
            netDeferredTax: netDeferred,
            totalTaxExpense,
            effectiveTaxRate: (effectiveTaxRate * 100).toFixed(2) + '%',
        };
    }

    async getProvision(tenantId: string, entityId: string, periodName: string) {
        const result = await db.execute(sql`
            SELECT * FROM tax_provisions
            WHERE tenant_id = ${tenantId}
              AND entity_id = ${entityId}
              AND period_name = ${periodName}
            LIMIT 1
        `);
        return (result as any).rows?.[0] ?? null;
    }

    async listProvisions(tenantId: string, fiscalYear?: number) {
        if (fiscalYear) {
            return (await db.execute(sql`
                SELECT * FROM tax_provisions
                WHERE tenant_id = ${tenantId} AND fiscal_year = ${fiscalYear}
                ORDER BY period_name, entity_id
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT * FROM tax_provisions
            WHERE tenant_id = ${tenantId}
            ORDER BY fiscal_year DESC, period_name
        `) as any).rows;
    }

    async updateStatus(provisionId: string, status: 'Draft' | 'Reviewed' | 'Filed') {
        await db.execute(sql`
            UPDATE tax_provisions SET status = ${status}, updated_at = NOW()
            WHERE id = ${provisionId}
        `);
        return { provisionId, status };
    }
}

export const taxProvisionService = new TaxProvisionService();
