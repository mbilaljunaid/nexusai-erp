import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * DebtCovenantService — TREAS-OG-03
 *
 * Manages debt facilities, covenant definitions, and test execution.
 * Fetches live GL-derived metrics where possible (Leverage Ratio, Interest Coverage, etc.)
 */
export class DebtCovenantService {

    async createFacility(params: {
        tenantId: string;
        facilityName: string;
        lender: string;
        facilityType: string;
        facilityAmount: number;
        drawnAmount?: number;
        currencyCode?: string;
        interestRate?: number;
        maturityDate: string;
    }) {
        const [facility] = (await db.execute(sql`
            INSERT INTO debt_facilities (
                tenant_id, facility_name, lender, facility_type, facility_amount, drawn_amount,
                currency_code, interest_rate, maturity_date
            ) VALUES (
                ${params.tenantId}, ${params.facilityName}, ${params.lender}, ${params.facilityType},
                ${params.facilityAmount}, ${params.drawnAmount ?? 0}, ${params.currencyCode ?? 'USD'},
                ${params.interestRate ?? null}, ${params.maturityDate}
            ) RETURNING *
        `)) as any;
        return facility;
    }

    async addCovenant(params: {
        facilityId: string;
        covenantType: string;
        metricName: string;
        thresholdMin?: number;
        thresholdMax?: number;
        testFrequency?: string;
        nextTestDate?: string;
    }) {
        const [cov] = (await db.execute(sql`
            INSERT INTO debt_covenants (
                facility_id, covenant_type, metric_name, threshold_min, threshold_max,
                test_frequency, next_test_date
            ) VALUES (
                ${params.facilityId}, ${params.covenantType}, ${params.metricName},
                ${params.thresholdMin ?? null}, ${params.thresholdMax ?? null},
                ${params.testFrequency ?? 'Quarterly'}, ${params.nextTestDate ?? null}
            ) RETURNING *
        `)) as any;
        return cov;
    }

    /**
     * Run a covenant test — compute the actual metric value from GL and compare to thresholds.
     * For standard covenant types, GL queries are executed. For Custom, caller provides the value.
     */
    async runCovenantTest(covenantId: string, testDate: string, testedBy: string, overrideValue?: number, notes?: string) {
        const cov = (await db.execute(sql`
            SELECT dc.*, df.tenant_id
            FROM debt_covenants dc JOIN debt_facilities df ON df.id = dc.facility_id
            WHERE dc.id = ${covenantId}
        `) as any).rows?.[0];
        if (!cov) throw new Error('Covenant not found');

        const periodName = testDate.slice(0, 7).replace('-', '-');  // e.g. "2026-03"
        let actualValue = overrideValue;

        // Auto-calculate from GL where possible
        if (actualValue === undefined) {
            actualValue = await this._calculateMetric(cov.covenant_type, cov.tenant_id, periodName);
        }

        let status = 'Pass';
        let headroomMin: number | null = null;
        let headroomMax: number | null = null;

        if (cov.threshold_min !== null && actualValue !== null && actualValue < cov.threshold_min) status = 'Breach';
        if (cov.threshold_max !== null && actualValue !== null && actualValue > cov.threshold_max) status = 'Breach';
        if (cov.threshold_min !== null && actualValue !== null) headroomMin = actualValue - cov.threshold_min;
        if (cov.threshold_max !== null && actualValue !== null) headroomMax = cov.threshold_max - actualValue;

        const [result] = (await db.execute(sql`
            INSERT INTO covenant_test_results (
                covenant_id, test_date, actual_value, status, headroom_min, headroom_max, notes, tested_by
            ) VALUES (
                ${covenantId}, ${testDate}, ${actualValue ?? 0}, ${status},
                ${headroomMin}, ${headroomMax}, ${notes ?? null}, ${testedBy}
            ) RETURNING *
        `)) as any;

        // Update next test date
        const nextDate = this._nextTestDate(cov.test_frequency, testDate);
        await db.execute(sql`UPDATE debt_covenants SET next_test_date = ${nextDate} WHERE id = ${covenantId}`);

        return { ...result, covenant: cov };
    }

    async getDue(tenantId: string, daysAhead = 30) {
        return (await db.execute(sql`
            SELECT dc.*, df.facility_name, df.lender
            FROM debt_covenants dc
            JOIN debt_facilities df ON df.id = dc.facility_id
            WHERE df.tenant_id = ${tenantId}
              AND dc.next_test_date <= CURRENT_DATE + INTERVAL '${sql.raw(String(daysAhead))} days'
              AND df.status = 'Active'
            ORDER BY dc.next_test_date
        `) as any).rows;
    }

    async getFacilities(tenantId: string) {
        return (await db.execute(sql`
            SELECT df.*,
                COUNT(dc.id) AS covenant_count,
                COUNT(ctr.id) FILTER (WHERE ctr.status = 'Breach' AND ctr.test_date >= CURRENT_DATE - INTERVAL '90 days') AS recent_breaches
            FROM debt_facilities df
            LEFT JOIN debt_covenants dc ON dc.facility_id = df.id
            LEFT JOIN covenant_test_results ctr ON ctr.covenant_id = dc.id
            WHERE df.tenant_id = ${tenantId}
            GROUP BY df.id
            ORDER BY df.maturity_date
        `) as any).rows;
    }

    private async _calculateMetric(covenantType: string, tenantId: string, periodName: string): Promise<number | null> {
        switch (covenantType) {
            case 'LeverageRatio': {
                // Net Debt / EBITDA — simplified using GL balances
                try {
                    const ebitda = (await db.execute(sql`
                        SELECT COALESCE(SUM(period_net_cr - period_net_dr), 0) AS ebitda
                        FROM gl_balances
                        WHERE tenant_id = ${tenantId}
                          AND account_type IN ('Revenue')
                          AND period_name = ${periodName}
                    `) as any).rows?.[0]?.ebitda ?? 0;

                    const debt = (await db.execute(sql`
                        SELECT COALESCE(SUM(period_net_dr - period_net_cr), 0) AS debt
                        FROM gl_balances
                        WHERE tenant_id = ${tenantId}
                          AND account_type IN ('Liability')
                          AND period_name = ${periodName}
                    `) as any).rows?.[0]?.debt ?? 0;

                    return ebitda > 0 ? Number(debt) / Number(ebitda) : null;
                } catch { return null; }
            }
            case 'CurrentRatio': {
                try {
                    const assets = (await db.execute(sql`
                        SELECT COALESCE(SUM(period_net_dr - period_net_cr), 0) AS val
                        FROM gl_balances WHERE tenant_id = ${tenantId} AND account_subtype = 'CurrentAsset' AND period_name = ${periodName}
                    `) as any).rows?.[0]?.val ?? 1;
                    const liabs = (await db.execute(sql`
                        SELECT COALESCE(SUM(period_net_cr - period_net_dr), 0) AS val
                        FROM gl_balances WHERE tenant_id = ${tenantId} AND account_subtype = 'CurrentLiability' AND period_name = ${periodName}
                    `) as any).rows?.[0]?.val ?? 1;
                    return Number(liabs) > 0 ? Number(assets) / Number(liabs) : null;
                } catch { return null; }
            }
            default: return null;
        }
    }

    private _nextTestDate(frequency: string, fromDate: string): string {
        const d = new Date(fromDate);
        switch (frequency) {
            case 'Monthly': d.setMonth(d.getMonth() + 1); break;
            case 'Quarterly': d.setMonth(d.getMonth() + 3); break;
            case 'Annual': d.setFullYear(d.getFullYear() + 1); break;
        }
        return d.toISOString().slice(0, 10);
    }
}

export const debtCovenantService = new DebtCovenantService();
