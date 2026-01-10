
import { db } from "../db";
import { eq, and, sql, inArray } from "drizzle-orm";
import { storage } from "../storage";
import {
    glReportDefinitions, glFsgRowSets, glFsgColumnSets,
    glReportRows, glReportColumns, glReportInstances,
    glBalances, glCodeCombinations
} from "@shared/schema";

export class ReportingService {

    // --- FSG Engine ---

    async generateFsgReport(reportId: string, ledgerId: string, periodName: string, format: 'JSON' | 'EXCEL' = 'JSON') {
        console.log(`[FSG] Generating Report ${reportId} for ${periodName} (Ledger: ${ledgerId})`);

        // 1. Fetch Definition
        const [def] = await db.select().from(glReportDefinitions).where(eq(glReportDefinitions.id, reportId));
        if (!def) throw new Error("Report definition not found");

        // 2. Fetch Row/Col Sets
        const rowSet = await storage.getFsgRowSet(def.rowSetId);
        const colSet = await storage.getFsgColumnSet(def.columnSetId);

        if (!rowSet || !colSet) throw new Error("Invalid Row or Column Set configuration");

        // 3. Fetch Rows and Cols
        const rows = await db.select().from(glReportRows).where(eq(glReportRows.rowSetId, rowSet.id)).orderBy(glReportRows.rowNumber);
        const cols = await db.select().from(glReportColumns).where(eq(glReportColumns.columnSetId, colSet.id)).orderBy(glReportColumns.columnNumber);

        // 4. Calculate Data Matrix
        const matrix: any[][] = []; // Rows x Cols

        for (const row of rows) {
            const rowData: any = {
                label: row.description,
                rowType: row.rowType,
                values: []
            };

            if (row.rowType === 'TITLE') {
                // Skip calculation
                rowData.values = cols.map(() => null);
            } else if (row.rowType === 'CALCULATION') {
                // TODO: Implement formula parsing (e.g. L10 + L20)
                // For MVP, we might skip or support simple totals later
                rowData.values = cols.map(() => 0);
            } else {
                // DETAIL Row - Fetch Balances
                // Build Account Filters
                // simple range check on 'account' segment (conceptually)
                // In generic CCID, we assume segment1..segmentX. 
                // We need to know WHICH segment is natural account. 
                // For MVP, assume segment3 is account (standard practice in our mock data?) OR check all?
                // Let's assume we filter by matching CCIDs that fall in range.

                for (const col of cols) {
                    // Determine Period
                    // Target Period = periodName + col.periodOffset
                    // For MVP, ignore offset logic or implement simple lookup if periods are sequential strings?
                    // Let's assume periodName is exact for now.
                    let targetPeriod = periodName;

                    const val = await this.fetchAggregatedBalance(
                        ledgerId,
                        targetPeriod,
                        row.accountFilterMin,
                        row.accountFilterMax,
                        row.segmentFilter,
                        col.amountType || 'PTD'
                    );

                    // Inverse sign if needed (Revenue/Liability/Equity usually credit)
                    rowData.values.push(row.inverseSign ? -val : val);
                }
            }
            matrix.push(rowData);
        }

        // 5. Create Instance Record
        const instance = await storage.createReportInstance({
            reportId: reportId,
            status: "COMPLETED",
            runDate: new Date(),
            outputPath: "IN_MEMORY", // or S3 link
            filtersApplied: { ledgerId, periodName },
            errorLog: null
        });

        return {
            instanceId: instance.id,
            reportName: def.name,
            period: periodName,
            headers: cols.map(c => c.columnHeader),
            rows: matrix
        };
    }

    private async fetchAggregatedBalance(
        ledgerId: string,
        periodName: string,
        minAccount: string | null,
        maxAccount: string | null,
        segmentFilers: any | null,
        amountType: string
    ): Promise<number> {
        // Complex query: Join balances with CCID
        // Filter by CCID segments

        // This requires dyanmic SQL construction or heavy filtering
        // Optimized approach: 
        // 1. Find relevant CCIDs
        // 2. Sum balances for those CCIDs

        // Placeholder for real logic:
        // Assume 'segment3' is the Natural Account
        // If minAccount/maxAccount set, filter segment3 >= min AND segment3 <= max

        // Construct Where Clause
        const conditions = [
            eq(glBalances.ledgerId, ledgerId),
            eq(glBalances.periodName, periodName)
        ];

        // This requires joining glCodeCombinations
        // Drizzle doesn't support easy joining for dynamic conditions in this snippet style easily
        // We'll use raw SQL or a simpler approximation for MVP

        // Let's use getBalances() behavior from standard storage but customized.

        // MVP: Return random number to prove flow, or 0.
        // REAL: 
        /*
        const result = await db.select({ total: sql`sum(${glBalances.periodNetDr} - ${glBalances.periodNetCr})` })
            .from(glBalances)
            .leftJoin(glCodeCombinations, eq(glBalances.codeCombinationId, glCodeCombinations.id))
            .where(and(...conditions, 
                // Range logic
            ));
        */

        return 1000.00; // Mock Value for Stabilization MVP
    }

    // --- Scheduling ---

    async scheduleReport(scheduleData: any) {
        return await storage.createReportSchedule(scheduleData);
    }
}

export const reportingService = new ReportingService();
