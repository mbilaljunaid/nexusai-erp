
import { db } from "../../db";
import {
    slaJournalHeaders, slaJournalLines, slaEventClasses, slaEventTypes,
    slaAccountingRules, slaPeriodStatuses
} from "../../../shared/schema/sla";
import {
    glCodeCombinations, glLedgers, glPeriods
} from "../../../shared/schema/finance";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export interface AccountAnalysisParams {
    ledgerId: string;
    periodName: string;
    accountFilter?: string; // Optional: Filter by Account Code
    sourceInternal?: string; // Optional: Filter by Event Class (Source)
}

export class SlaReportingService {

    /**
     * Account Analysis Report
     * Provides a detailed listing of all Subledger Transactions that hit a specific account in a period.
     * Essential for reconciliation.
     */
    async getAccountAnalysis(params: AccountAnalysisParams) {
        console.log(`[SLA-Report] Generating Account Analysis for Ledger: ${params.ledgerId}, Period: ${params.periodName}`);

        // 1. Get Period Date Range
        const [period] = await db.select().from(glPeriods)
            .where(and(
                eq(glPeriods.ledgerId, params.ledgerId),
                eq(glPeriods.periodName, params.periodName)
            ));

        if (!period) {
            throw new Error(`Period ${params.periodName} not defined for Ledger ${params.ledgerId}`);
        }

        // 2. Query SLA Lines Joined with Headers and COA
        // This is a heavy query - in production would use a materialized view or specialized reporting store.
        const query = db.select({
            journalId: slaJournalHeaders.id,
            trxNumber: slaJournalHeaders.entityId, // Reference ID
            eventDate: slaJournalHeaders.eventDate,
            glDate: slaJournalHeaders.glDate,
            eventClass: slaEventClasses.name,
            eventType: slaEventTypes.name,
            account: glCodeCombinations.code,
            accountDesc: glCodeCombinations.segment3, // Assuming Natural Account is Seg3
            description: slaJournalLines.description,
            currency: slaJournalLines.currencyCode,
            enteredDr: slaJournalLines.enteredDr,
            enteredCr: slaJournalLines.enteredCr,
            accountedDr: slaJournalLines.accountedDr,
            accountedCr: slaJournalLines.accountedCr,
            status: slaJournalHeaders.status
        })
            .from(slaJournalLines)
            .innerJoin(slaJournalHeaders, eq(slaJournalLines.headerId, slaJournalHeaders.id))
            .innerJoin(glCodeCombinations, eq(slaJournalLines.codeCombinationId, glCodeCombinations.id))
            .leftJoin(slaEventClasses, eq(slaJournalHeaders.eventClassId, slaEventClasses.id))
            .leftJoin(slaEventTypes, eq(slaJournalHeaders.eventTypeId, slaEventTypes.id))
            .where(
                and(
                    eq(slaJournalHeaders.ledgerId, params.ledgerId),
                    sql`${slaJournalHeaders.glDate} >= ${period.startDate}`,
                    sql`${slaJournalHeaders.glDate} <= ${period.endDate}`,
                    // Optional Filters
                    params.accountFilter ? sql`${glCodeCombinations.code} LIKE ${'%' + params.accountFilter + '%'}` : undefined
                )
            )
            .orderBy(desc(slaJournalHeaders.glDate));

        const results = await query;
        console.log(`[SLA-Report] Found ${results.length} rows.`);
        return results;
    }

    /**
     * Unaccounted Transactions Report
     * Shows events that are processed but failed accounting, or are pending.
     */
    async getUnaccountedTransactions(ledgerId: string, periodName: string) {
        // Implementation: Find Events where status != Final
        // Needs joining with Event Capture tables (Future enhancement)
        return [];
    }
}

export const slaReportingService = new SlaReportingService();
