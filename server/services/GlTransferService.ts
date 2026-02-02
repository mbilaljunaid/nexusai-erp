
import { db } from "../db";
import { eq, and, inArray } from "drizzle-orm";
import {
    glJournals, glJournalLines, glJournalBatches, glLedgers,
    glPeriods
} from "@shared/schema/finance";
import {
    slaJournalHeaders, slaJournalLines
} from "@shared/schema/sla";

export class GlTransferService {

    /**
     * Transfers final SLA Accounting to GL.
     * Groups by Ledger.
     */
    async transferToGl(ledgerId: string = "PRIMARY") {
        console.log(`[GL Transfer] Starting transfer for Ledger: ${ledgerId}`);

        // 1. Identify Eligible Headers
        const eligibleHeaders = await db.select().from(slaJournalHeaders).where(and(
            eq(slaJournalHeaders.ledgerId, ledgerId),
            // eq(slaJournalHeaders.status, "Final"), // Ensure completed accounting
            eq(slaJournalHeaders.transferStatus, "Not Transferred")
        ));

        // Note: we check 'status' in code or query. SlaEngine sets it to 'Final'.
        const headersToProcess = eligibleHeaders.filter(h => h.status === 'Final');

        if (headersToProcess.length === 0) {
            console.log("[GL Transfer] No eligible journals found.");
            return { count: 0, batchId: null };
        }

        console.log(`[GL Transfer] Found ${headersToProcess.length} journals to transfer.`);

        return await db.transaction(async (tx) => {
            // 2. Create GL Batch
            const batchName = `SLA Import ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`;
            const [batch] = await tx.insert(glJournalBatches).values({
                batchName: batchName,
                description: `Import from SLA for Ledger ${ledgerId}`,
                status: "Unposted",
                periodId: null // Pending Period Determination which usually happens during posting or here
            }).returning();

            let totalDr = 0;
            let totalCr = 0;

            // 3. Process Journals
            for (const slaHeader of headersToProcess) {
                // Generate Journal Number
                const journalNum = `JE-${slaHeader.eventClassId}-${slaHeader.entityId.slice(0, 8)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                // Create GL Journal Header
                const [glHeader] = await tx.insert(glJournals).values({
                    journalNumber: journalNum,
                    ledgerId: ledgerId,
                    batchId: batch.id,
                    description: slaHeader.description,
                    currencyCode: slaHeader.currencyCode,
                    source: "SLA",
                    category: slaHeader.eventClassId || "Manual",
                    status: "Unposted",
                    approvalStatus: "Not Required",
                    postedDate: null
                }).returning();

                // Fetch SLA Lines
                const slaLines = await tx.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, slaHeader.id));

                // Create GL Lines
                if (slaLines.length > 0) {
                    const glLinesToInsert = slaLines.map(l => {
                        totalDr += Number(l.accountedDr || 0);
                        totalCr += Number(l.accountedCr || 0);

                        return {
                            journalId: glHeader.id,
                            accountId: l.codeCombinationId, // Mapping CCID
                            description: l.description,
                            currencyCode: l.currencyCode,
                            enteredDebit: l.enteredDr,
                            enteredCredit: l.enteredCr,
                            accountedDebit: l.accountedDr || l.enteredDr,
                            accountedCredit: l.accountedCr || l.enteredCr,
                            exchangeRate: "1" // Simplified
                        };
                    });

                    await tx.insert(glJournalLines).values(glLinesToInsert as any);
                }

                // Update SLA Header
                await tx.update(slaJournalHeaders)
                    .set({
                        transferStatus: "Transferred",
                        glJournalId: glHeader.id
                    })
                    .where(eq(slaJournalHeaders.id, slaHeader.id));
            }

            // Update Batch Totals
            await tx.update(glJournalBatches).set({
                totalDebit: totalDr.toFixed(2),
                totalCredit: totalCr.toFixed(2)
            }).where(eq(glJournalBatches.id, batch.id));

            console.log(`[GL Transfer] Batch ${batch.id} created with ${headersToProcess.length} journals.`);
            return { count: headersToProcess.length, batchId: batch.id, totalDr, totalCr };
        });
    }
}

export const glTransferService = new GlTransferService();
