
import { db } from "../../db";
import { slaJournalHeaders, slaJournalLines, slaEventClasses, slaEventTypes } from "../../../shared/schema/sla";
import { glCodeCombinations, glLedgers, glPeriods } from "../../../shared/schema/finance";
import { eq, and, sql, desc } from "drizzle-orm";

export class SlaReportingService {

    /**
     * Account Analysis Report
     * Returns detailed transaction listing for a given ledger/period/account.
     */
    async getAccountAnalysis(params: {
        ledgerId: string;
        periodName: string;
        segment1?: string; // Company
        segment3?: string; // Account
    }) {
        console.log(`[Report] Generatng Account Analysis for ${params.ledgerId} / ${params.periodName}`);

        // 1. Get Date Range for Period
        const period = await db.query.glPeriods.findFirst({
            where: and(
                eq(glPeriods.periodName, params.periodName),
                eq(glPeriods.ledgerId, params.ledgerId)
            )
        });

        if (!period || !period.startDate || !period.endDate) {
            throw new Error(`Period ${params.periodName} not found or undefined for ledger.`);
        }

        // 2. Build Query
        const conditions = [
            eq(slaJournalHeaders.ledgerId, params.ledgerId),
            sql`${slaJournalHeaders.glDate} >= ${period.startDate.toISOString()}`,
            sql`${slaJournalHeaders.glDate} <= ${period.endDate.toISOString()}`
        ];

        // 3. Fetch Data with Joins
        // Using db.select().from().leftJoin() for better control
        let query = db.select({
            glDate: slaJournalHeaders.glDate,
            source: slaJournalHeaders.transactionSource,
            description: slaJournalLines.description,
            accountCode: glCodeCombinations.code,
            enteredDr: slaJournalLines.enteredDr,
            enteredCr: slaJournalLines.enteredCr,
            accountedDr: slaJournalLines.accountedDr,
            accountedCr: slaJournalLines.accountedCr,
            currency: slaJournalHeaders.currencyCode,
            segment1: glCodeCombinations.segment1,
            segment3: glCodeCombinations.segment3
        })
            .from(slaJournalLines)
            .leftJoin(slaJournalHeaders, eq(slaJournalLines.headerId, slaJournalHeaders.id))
            .leftJoin(glCodeCombinations, eq(slaJournalLines.codeCombinationId, glCodeCombinations.id))
            .where(and(...conditions))
            .orderBy(desc(slaJournalHeaders.glDate));

        // 4. Client-side Filter (or enhance query if dynamic and() supported easily)
        // With Drizzle dynamic query construction is easy, let's refine:

        let finalQuery = query;

        // Execute
        const results = await finalQuery;

        // Filter by segments if provided
        const filtered = results.filter(row => {
            if (params.segment1 && row.segment1 !== params.segment1) return false;
            if (params.segment3 && row.segment3 !== params.segment3) return false;
            return true;
        });

        // 5. Calculate Totals
        const summary = filtered.reduce((acc, row) => ({
            totalDr: acc.totalDr + (Number(row.accountedDr) || 0),
            totalCr: acc.totalCr + (Number(row.accountedCr) || 0),
            rowCount: acc.rowCount + 1
        }), { totalDr: 0, totalCr: 0, rowCount: 0 });

        return {
            period: params.periodName,
            ledgerId: params.ledgerId,
            data: filtered,
            summary
        };
    }

    /**
     * Reconciliation Report
     * Compares SLA Balances vs GL Balances (Mocked for now as GL Balances table needed)
     */
    async getReconciliation(params: { ledgerId: string, periodName: string }) {
        // Find SLA Total
        const analysis = await this.getAccountAnalysis(params);
        const slaTotalDr = analysis.summary.totalDr;
        const slaTotalCr = analysis.summary.totalCr;

        // Mock GL Total (Assume minimal drift for now, or simulate drift)
        // In a real system, we'd query `gl_balances` table.
        const glTotalDr = slaTotalDr; // Perfect match
        const glTotalCr = slaTotalCr;

        return {
            period: params.periodName,
            sla: { dr: slaTotalDr, cr: slaTotalCr },
            gl: { dr: glTotalDr, cr: glTotalCr },
            variance: {
                dr: slaTotalDr - glTotalDr,
                cr: slaTotalCr - glTotalCr
            },
            status: (slaTotalDr === glTotalDr) ? "RECONCILED" : "DRIFT_DETECTED"
        };
    }
}

export const slaReportingService = new SlaReportingService();
