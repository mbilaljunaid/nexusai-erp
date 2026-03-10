import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * WHTService — COMP-OG-02
 *
 * Withholding Tax engine:
 * - Rule lookup by country + income type (with treaty rate support)
 * - WHT calculation on AP payments
 * - Statutory XML generation (Form 16A / IRRF / 1042-S stubs)
 * - Remittance batch filing
 */
export class WHTService {

    /**
     * Create or update a WHT rule for a country/income type
     */
    async createRule(params: {
        tenantId: string;
        countryCode: string;
        incomeType: 'Dividend' | 'Interest' | 'Royalty' | 'Services' | 'Other';
        rate: number;
        treatyRate?: number;
        thresholdAmount?: number;
        currencyCode?: string;
        effectiveFrom: string;
        effectiveTo?: string;
    }) {
        const [rule] = (await db.execute(sql`
            INSERT INTO wht_rules (
                tenant_id, country_code, income_type, rate, treaty_rate,
                threshold_amount, currency_code, effective_from, effective_to
            ) VALUES (
                ${params.tenantId}, ${params.countryCode}, ${params.incomeType},
                ${params.rate}, ${params.treatyRate ?? null},
                ${params.thresholdAmount ?? 0}, ${params.currencyCode ?? 'USD'},
                ${params.effectiveFrom}, ${params.effectiveTo ?? null}
            )
            ON CONFLICT DO NOTHING
            RETURNING *
        `)) as any;
        return rule;
    }

    async getRules(tenantId: string, countryCode?: string) {
        if (countryCode) {
            return (await db.execute(sql`
                SELECT * FROM wht_rules
                WHERE tenant_id = ${tenantId} AND country_code = ${countryCode} AND enabled = TRUE
                ORDER BY income_type
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT * FROM wht_rules WHERE tenant_id = ${tenantId} AND enabled = TRUE
            ORDER BY country_code, income_type
        `) as any).rows;
    }

    /**
     * Calculate WHT for a payment and record the transaction
     * Called from AP payment flow
     */
    async calculateAndRecord(params: {
        tenantId: string;
        paymentId: string;
        supplierId: string;
        countryCode: string;
        incomeType: string;
        grossAmount: number;
        currencyCode: string;
        periodName: string;
        glAccountCode?: string;
        useTreatyRate?: boolean;
    }) {
        // Find applicable rule
        const rules = (await db.execute(sql`
            SELECT * FROM wht_rules
            WHERE tenant_id = ${params.tenantId}
              AND country_code = ${params.countryCode}
              AND income_type = ${params.incomeType}
              AND enabled = TRUE
              AND effective_from <= CURRENT_DATE
              AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
            ORDER BY effective_from DESC
            LIMIT 1
        `) as any).rows;

        const rule = rules?.[0];
        if (!rule) {
            // No WHT rule — zero withholding
            return { whtAmount: 0, netAmount: params.grossAmount, ruleApplied: null };
        }

        // Below threshold → no withholding
        if (params.grossAmount <= Number(rule.threshold_amount ?? 0)) {
            return { whtAmount: 0, netAmount: params.grossAmount, ruleApplied: rule.id };
        }

        const rate = params.useTreatyRate && rule.treaty_rate
            ? Number(rule.treaty_rate)
            : Number(rule.rate);

        const whtAmount = parseFloat((params.grossAmount * rate).toFixed(4));
        const netAmount = parseFloat((params.grossAmount - whtAmount).toFixed(4));

        // Generate statutory XML
        const statutoryXml = this._generateStatutoryXML(params.countryCode, {
            ...params, whtAmount, netAmount, rate
        });

        const [txn] = (await db.execute(sql`
            INSERT INTO wht_transactions (
                tenant_id, payment_id, supplier_id, rule_id, country_code, income_type,
                gross_amount, wht_rate, wht_amount, net_amount, currency_code,
                period_name, gl_account_code, statutory_xml
            ) VALUES (
                ${params.tenantId}, ${params.paymentId}, ${params.supplierId}, ${rule.id},
                ${params.countryCode}, ${params.incomeType},
                ${params.grossAmount}, ${rate}, ${whtAmount}, ${netAmount},
                ${params.currencyCode}, ${params.periodName},
                ${params.glAccountCode ?? '2200-WHT-PAYABLE'}, ${statutoryXml}
            )
            ON CONFLICT DO NOTHING
            RETURNING id
        `)) as any;

        return { transactionId: txn?.id, whtAmount, netAmount, rate, ruleApplied: rule.id };
    }

    /**
     * Create a remittance batch for a period/country
     */
    async createRemittanceBatch(params: {
        tenantId: string;
        periodName: string;
        countryCode: string;
        dueDate?: string;
        createdBy: string;
    }) {
        // Aggregate WHT for the period + country
        const agg = (await db.execute(sql`
            SELECT SUM(wht_amount) AS total_wht, currency_code
            FROM wht_transactions
            WHERE tenant_id = ${params.tenantId}
              AND period_name = ${params.periodName}
              AND country_code = ${params.countryCode}
              AND remitted_at IS NULL
            GROUP BY currency_code
            LIMIT 1
        `) as any).rows?.[0];

        const totalWHT = Number(agg?.total_wht ?? 0);

        const [batch] = (await db.execute(sql`
            INSERT INTO wht_remittance_batches (
                tenant_id, period_name, country_code, total_wht, currency_code, due_date, created_by
            ) VALUES (
                ${params.tenantId}, ${params.periodName}, ${params.countryCode},
                ${totalWHT}, ${agg?.currency_code ?? 'USD'},
                ${params.dueDate ?? null}, ${params.createdBy}
            )
            RETURNING *
        `)) as any;

        return { ...batch, totalWHT };
    }

    async markBatchFiled(batchId: string, paymentRef: string) {
        // Update batch
        await db.execute(sql`
            UPDATE wht_remittance_batches
            SET status = 'Filed', filed_at = NOW(), payment_ref = ${paymentRef}
            WHERE id = ${batchId}
        `);
        // Mark transactions as remitted
        await db.execute(sql`
            UPDATE wht_transactions
            SET remittance_ref = ${paymentRef}, remitted_at = NOW(), updated_at = NOW()
            WHERE tenant_id = (SELECT tenant_id FROM wht_remittance_batches WHERE id = ${batchId})
              AND remitted_at IS NULL
        `);
        return { batchId, status: 'Filed' };
    }

    async listTransactions(tenantId: string, periodName: string, countryCode?: string) {
        if (countryCode) {
            return (await db.execute(sql`
                SELECT * FROM wht_transactions
                WHERE tenant_id = ${tenantId} AND period_name = ${periodName} AND country_code = ${countryCode}
                ORDER BY created_at DESC
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT * FROM wht_transactions
            WHERE tenant_id = ${tenantId} AND period_name = ${periodName}
            ORDER BY country_code, created_at DESC
        `) as any).rows;
    }

    async listBatches(tenantId: string) {
        return (await db.execute(sql`
            SELECT * FROM wht_remittance_batches
            WHERE tenant_id = ${tenantId}
            ORDER BY period_name DESC, country_code
        `) as any).rows;
    }

    /** Generate country-specific statutory XML stub */
    private _generateStatutoryXML(countryCode: string, data: any): string {
        switch (countryCode) {
            case 'IN': // Form 16A (India TDS)
                return `<TDSCertificate><Deductor>${data.tenantId}</Deductor>
  <Deductee>${data.supplierId}</Deductee><GrossAmount>${data.grossAmount}</GrossAmount>
  <TDSRate>${data.rate}</TDSRate><TDSAmount>${data.whtAmount}</TDSAmount>
  <Period>${data.periodName}</Period></TDSCertificate>`;

            case 'US': // Form 1042-S
                return `<Form1042S><Recipient>${data.supplierId}</Recipient>
  <IncomeCode>17</IncomeCode><GrossIncome>${data.grossAmount}</GrossIncome>
  <WHT>${data.whtAmount}</WHT><NetIncome>${data.netAmount}</NetIncome></Form1042S>`;

            case 'BR': // IRRF (Brazil)
                return `<IRRF><CNPJ>${data.supplierId}</CNPJ>
  <Natureza>${data.incomeType}</Natureza><ValorBruto>${data.grossAmount}</ValorBruto>
  <AliquotaIRRF>${data.rate}</AliquotaIRRF><ValorIRRF>${data.whtAmount}</ValorIRRF></IRRF>`;

            default: // Generic
                return `<WHTCertificate><Country>${countryCode}</Country>
  <IncomeType>${data.incomeType}</IncomeType><Rate>${data.rate}</Rate>
  <GrossAmount>${data.grossAmount}</GrossAmount><WHTAmount>${data.whtAmount}</WHTAmount></WHTCertificate>`;
        }
    }
}

export const whtService = new WHTService();
