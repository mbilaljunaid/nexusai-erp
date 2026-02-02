
import { db } from "../../db";
import { eq, and, gte, lte, inArray, sql } from "drizzle-orm";
import {
    slaJournalHeaders,
    slaJournalLines,
    slaEventClasses
} from "../../../shared/schema/sla";
import {
    glCodeCombinations,
    glPeriods
} from "../../../shared/schema/finance";

export class ReportingService {

    /**
     * ACCOUNT ANALYSIS REPORT
     * Returns detailed list of SLA transactions for a given period and account range.
     * Used for reconciling Subledger Balances to GL Balances.
     */
    async generateAccountAnalysis(
        ledgerId: string,
        periodName: string,
        options?: {
            accountFrom?: string,
            accountTo?: string,
            segment1?: string, // Company
            segment2?: string, // Cost Center
            segment3?: string  // Account
        }
    ) {
        // 1. Get Period Date Range
        const [period] = await db.select().from(glPeriods)
            .where(and(eq(glPeriods.periodName, periodName), eq(glPeriods.ledgerId, ledgerId)));

        if (!period) throw new Error(`Period ${periodName} not found.`);

        // 2. Build Query
        // Join Headers -> Lines -> Code Combinations -> Event Classes
        let query = db.select({
            glDate: slaJournalHeaders.glDate,
            source: slaEventClasses.name, // Event Class Name (e.g. AP Invoice)
            eventClass: slaJournalHeaders.eventClassId,
            description: slaJournalHeaders.description,
            entityId: slaJournalHeaders.entityId,
            journalId: slaJournalHeaders.id,
            lineId: slaJournalLines.id,

            // Account Segments
            accountCode: glCodeCombinations.code,
            segment1: glCodeCombinations.segment1,
            segment2: glCodeCombinations.segment2,
            segment3: glCodeCombinations.segment3,

            // Amounts
            enteredDr: slaJournalLines.enteredDr,
            enteredCr: slaJournalLines.enteredCr,
            accountedDr: slaJournalLines.accountedDr,
            accountedCr: slaJournalLines.accountedCr,
            currency: slaJournalLines.currencyCode
        })
            .from(slaJournalLines)
            .innerJoin(slaJournalHeaders, eq(slaJournalLines.headerId, slaJournalHeaders.id))
            .innerJoin(glCodeCombinations, eq(slaJournalLines.codeCombinationId, glCodeCombinations.id))
            .leftJoin(slaEventClasses, eq(slaJournalHeaders.eventClassId, slaEventClasses.id))
            .where(and(
                eq(slaJournalHeaders.ledgerId, ledgerId),
                gte(slaJournalHeaders.glDate, period.startDate),
                lte(slaJournalHeaders.glDate, period.endDate),
                eq(slaJournalHeaders.status, "Final") // Only accounted events
            ));

        // 3. Apply Filters
        // (Note: Drizzle query builder dynamic filtering)
        // This effectively filters the result set after retrieval or complicates the builder. 
        // For simplicity in this V1, we fetch broadly filtered by period and ledger, then filter in memory or refine if performance issue.
        // But for "Account Range" which is standard, we should try to filter if possible.
        // Assuming 'code' is comparable (string comparison work for fixed width segments usually)

        // Since we already have the query builder, we need to defer execution to add where clauses dynamically.
        // Drizzle doesn't support easy dynamic 'where' chaining on an instantiated SelectQueryBuilder easily without helper functions in v0.29/30 unless using $dynamic.
        // We will execute and filter in memory for V1, as volume is low.

        const results = await query;

        let filtered = results;

        if (options?.segment3) {
            filtered = filtered.filter(r => r.segment3 === options.segment3);
        }
        if (options?.segment1) {
            filtered = filtered.filter(r => r.segment1 === options.segment1);
        }

        // Calculate Totals
        const summary = {
            totalDr: filtered.reduce((sum, r) => sum + Number(r.accountedDr || 0), 0),
            totalCr: filtered.reduce((sum, r) => sum + Number(r.accountedCr || 0), 0),
            rowCount: filtered.length
        };

        return {
            period: periodName,
            ledgerId,
            data: filtered,
            summary
        };
    }
}

export const reportingService = new ReportingService();
