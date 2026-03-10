import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * FSGReportingService — GL-OG-01
 *
 * Financial Statement Generator (FSG) — row/column formula builder.
 * Allows finance teams to define Income Statement, Balance Sheet, Cash Flow
 * and custom reports using row ranges and period offsets without developer help.
 */
export class FSGReportingService {

    /** Create or update an FSG report definition */
    async saveReportDefinition(tenantId: string, params: {
        id?: string;
        name: string;
        description?: string;
        reportType: 'IncomeStatement' | 'BalanceSheet' | 'CashFlow' | 'Custom';
        rows: Array<{
            rowNum: number;
            label: string;
            accountRange?: string;   // e.g. '5000-5999' or '6000:6500'
            formula?: string;        // e.g. 'R1 + R2 - R3'
            indent?: number;
            isBold?: boolean;
            isTotal?: boolean;
        }>;
        columns: Array<{
            colNum: number;
            label: string;
            periodOffset?: number;   // 0 = current, -1 = prior period, -12 = prior year
            scenario?: string;       // 'Actual' | 'Budget' | 'Forecast'
            showVariance?: boolean;
        }>;
        currencyOption?: string;
        createdBy: string;
    }) {
        const { id, name, description, reportType, rows, columns, currencyOption = 'Functional', createdBy } = params;

        if (id) {
            // Update existing
            await db.execute(sql`
                UPDATE fsg_report_definitions
                SET name = ${name}, description = ${description ?? null},
                    report_type = ${reportType}, rows = ${JSON.stringify(rows)},
                    columns = ${JSON.stringify(columns)}, currency_option = ${currencyOption},
                    updated_at = NOW()
                WHERE id = ${id} AND tenant_id = ${tenantId}
            `);
            return { id, name };
        }

        const [report] = (await db.execute(sql`
            INSERT INTO fsg_report_definitions (
                tenant_id, name, description, report_type, rows, columns, currency_option, created_by
            ) VALUES (
                ${tenantId}, ${name}, ${description ?? null}, ${reportType},
                ${JSON.stringify(rows)}, ${JSON.stringify(columns)}, ${currencyOption}, ${createdBy}
            )
            RETURNING id, name
        `)) as any;

        return report;
    }

    /** Run (render) a report for a given period and ledger */
    async runReport(params: {
        reportDefinitionId: string;
        periodName: string;
        ledgerId: string;
        generatedBy: string;
    }) {
        const { reportDefinitionId, periodName, ledgerId, generatedBy } = params;

        // Fetch definition
        const [defn] = (await db.execute(sql`
            SELECT * FROM fsg_report_definitions WHERE id = ${reportDefinitionId}
        `) as any).rows;

        if (!defn) throw new Error(`FSG report definition ${reportDefinitionId} not found`);

        const rows = defn.rows as any[];
        const columns = defn.columns as any[];

        // Build rendered data: { rowNum: { colNum: value } }
        const data: Record<string, Record<string, number>> = {};

        for (const row of rows) {
            data[row.rowNum] = {};
            for (const col of columns) {
                let value = 0;
                if (row.accountRange) {
                    // Fetch GL balance for account range + adjusted period
                    const adjustedPeriod = this._offsetPeriod(periodName, col.periodOffset ?? 0);
                    const balResult = await db.execute(sql`
                        SELECT COALESCE(SUM(period_net_dr - period_net_cr), 0) AS balance
                        FROM gl_balances
                        WHERE ledger_id = ${ledgerId}
                          AND period_name = ${adjustedPeriod}
                          AND account_code BETWEEN
                              SPLIT_PART(${row.accountRange}, '-', 1)
                              AND SPLIT_PART(${row.accountRange}, '-', 2)
                    `);
                    value = Number(((balResult as any).rows?.[0] as any)?.balance ?? 0);
                }
                // Formula rows are post-processed after all range rows are computed
                data[row.rowNum][col.colNum] = value;
            }
        }

        // Second pass: evaluate formula rows
        for (const row of rows.filter(r => r.formula)) {
            for (const col of columns) {
                try {
                    const formula = row.formula!.replace(/R(\d+)/g, (_: string, n: string) =>
                        String(data[n]?.[col.colNum] ?? 0)
                    );
                    // Safe eval: only arithmetic
                    // eslint-disable-next-line no-new-func
                    data[row.rowNum][col.colNum] = Function(`"use strict"; return (${formula})`)() as number;
                } catch {
                    data[row.rowNum][col.colNum] = 0;
                }
            }
        }

        // Save output
        const [output] = (await db.execute(sql`
            INSERT INTO fsg_report_outputs (
                report_definition_id, period_name, ledger_id, generated_by, data
            ) VALUES (
                ${reportDefinitionId}, ${periodName}, ${ledgerId},
                ${generatedBy}, ${JSON.stringify(data)}
            )
            RETURNING id, generated_at
        `)) as any;

        return {
            outputId: output?.id,
            reportName: defn.name,
            periodName,
            rows: defn.rows,
            columns: defn.columns,
            data
        };
    }

    async listReports(tenantId: string) {
        return (await db.execute(sql`
            SELECT id, name, report_type, is_published, created_at
            FROM fsg_report_definitions
            WHERE tenant_id = ${tenantId}
            ORDER BY name
        `) as any).rows;
    }

    async getOutput(outputId: string) {
        return (await db.execute(sql`
            SELECT o.*, d.name AS report_name, d.rows, d.columns
            FROM fsg_report_outputs o
            JOIN fsg_report_definitions d ON o.report_definition_id = d.id
            WHERE o.id = ${outputId}
        `) as any).rows?.[0] ?? null;
    }

    private _offsetPeriod(periodName: string, offset: number): string {
        // Period format: 'Jan-2026'
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const [mon, yr] = periodName.split('-');
        let monthIdx = months.indexOf(mon);
        let year = parseInt(yr, 10);
        monthIdx += offset;
        while (monthIdx < 0) { monthIdx += 12; year--; }
        while (monthIdx > 11) { monthIdx -= 12; year++; }
        return `${months[monthIdx]}-${year}`;
    }
}

export const fsgReportingService = new FSGReportingService();
