import { db } from "../../db";
import {
    slaJournalHeaders, slaJournalLines
} from "../../../shared/schema/sla";
import {
    glJournals, glJournalLines, glJournalBatches
} from "../../../shared/schema/finance";
import { eq, and, sql } from "drizzle-orm";
import { financeService } from "../../services/finance";

export class SlaTransferService {

    /**
     * Transfers Final, Un-transferred SLA Journals to the General Ledger
     */
    async transferToGL(ledgerId: string, userId: string = "SYSTEM") {
        console.log(`[SLA Transfer] Locating un-transferred entries for Ledger ${ledgerId}...`);

        // 1. Find all eligible headers
        const headers = await db.select().from(slaJournalHeaders)
            .where(and(
                eq(slaJournalHeaders.ledgerId, ledgerId),
                eq(slaJournalHeaders.status, "Final"),
                eq(slaJournalHeaders.transferStatus, "Not Transferred")
            ));

        if (headers.length === 0) {
            console.log(`[SLA Transfer] No eligible entries found for Ledger ${ledgerId}.`);
            return { count: 0, batchId: null };
        }

        console.log(`[SLA Transfer] Found ${headers.length} SLA headers to transfer.`);

        // 2. We'll group them by Event Class & GL Date to form logical GL Journal Batches.
        // For simplicity in this iteration, we create one large GL Journal Batch for the transfer run.
        const batchName = `SLA Transfer ${new Date().toISOString().replace(/:/g, '')}`;

        // Use a generic description for the batch based on the first header's date
        const primaryPeriodId = await this.resolvePeriodId(ledgerId, headers[0].glDate);

        const [glBatch] = await db.insert(glJournalBatches).values({
            batchName: batchName,
            description: `Automated Subledger Transfer: ${headers.length} SLA events`,
            periodId: primaryPeriodId,
            status: "Unposted"
        }).returning();

        let totalJournalsCreated = 0;

        // Process Headers -> GL Journals
        for (const slaHeader of headers) {

            // 3. Fetch SLA Lines
            const lines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, slaHeader.id));
            if (lines.length === 0) continue; // Skip if no lines generated

            // 4. Map to GL Journal payload
            const glJournalData = {
                journalNumber: `SLA-${slaHeader.eventClassId}-${slaHeader.entityId}-${Date.now()}`,
                ledgerId: slaHeader.ledgerId,
                batchId: glBatch.id,
                batchName: glBatch.batchName,
                createdBy: userId,
                periodId: await this.resolvePeriodId(slaHeader.ledgerId, slaHeader.glDate),
                category: slaHeader.eventClassId || "Subledger",
                description: slaHeader.description || "Subledger Accounting Entry",
                currencyCode: slaHeader.currencyCode,
                source: "SLA",
                status: "Draft", // Leave in Draft, allow auto-posting rules or manual posting later
                approvalStatus: "Not Required",
            };

            // 5. Map to GL Lines payload
            const glLinesData = lines.map(l => ({
                accountId: l.codeCombinationId,
                description: l.description || glJournalData.description,
                currencyCode: l.currencyCode,
                enteredDebit: l.enteredDr,
                enteredCredit: l.enteredCr,
                accountedDebit: l.accountedDr,
                accountedCredit: l.accountedCr,
                debit: l.accountedDr || "0", // Map for legacy support
                credit: l.accountedCr || "0",
                exchangeRate: "1", // Simplified, SLA already calculates accounted amounts
                reference: slaHeader.entityId // Link back to Subledger transaction ID
            }));

            // 6. Create in GL via financeService
            try {
                // @ts-ignore - bypassing strict type checks on the Insert interface for speed
                const newJournal = await financeService.createJournal(glJournalData as any, glLinesData as any, userId);

                // 7. Update SLA Header Status
                await db.update(slaJournalHeaders)
                    .set({
                        transferStatus: "Transferred",
                        glJournalId: newJournal.id
                    })
                    .where(eq(slaJournalHeaders.id, slaHeader.id));

                totalJournalsCreated++;

            } catch (err: any) {
                console.error(`[SLA Transfer] Failed to transfer header ${slaHeader.id}:`, err.message);
                // We leave it as 'Not Transferred' so it can be retried later
            }
        }

        console.log(`[SLA Transfer] Completed. Created ${totalJournalsCreated} GL Journals in Batch ${glBatch.id}.`);

        return { count: totalJournalsCreated, batchId: glBatch.id };
    }

    private async resolvePeriodId(ledgerId: string, date: Date): Promise<string | undefined> {
        // Find the matching period in GL Periods
        // For simplicity, we just ask financeService to list periods and find the open match
        const periods = await financeService.listPeriods(ledgerId);
        const targetDate = new Date(date);

        const period = periods.find(p =>
            new Date(p.startDate) <= targetDate &&
            new Date(p.endDate) >= targetDate
        );

        return period?.id;
    }
}

export const slaTransferService = new SlaTransferService();
