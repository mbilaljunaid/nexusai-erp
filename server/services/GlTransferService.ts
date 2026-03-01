import { db } from "../db";
import { eq, and } from "drizzle-orm";
import {
    glJournals, glJournalLines, glJournalBatches, glLedgerRelationships, glDailyRates, glLedgers
} from "../../shared/schema/finance";
import {
    slaJournalHeaders, slaJournalLines
} from "../../shared/schema/sla";

export class GlTransferService {

    /**
     * Transfers final SLA Accounting to GL.
     * With Enterprise Parity: Routes to Primary AND Secondary ledgers.
     */
    async transferToGl(primaryLedgerId: string = "PRIMARY") {
        console.log(`[GL Transfer] Starting transfer for Primary Ledger: ${primaryLedgerId}`);

        // 1. Identify Eligible Headers
        const headersToProcess = await db.select().from(slaJournalHeaders).where(and(
            eq(slaJournalHeaders.ledgerId, primaryLedgerId),
            eq(slaJournalHeaders.status, "Final"),
            eq(slaJournalHeaders.transferStatus, "Not Transferred")
        ));

        if (headersToProcess.length === 0) {
            console.log("[GL Transfer] No eligible journals found.");
            return { count: 0, batchId: null };
        }

        console.log(`[GL Transfer] Found ${headersToProcess.length} journals to transfer.`);

        // 2. Fetch Ledger Relationships (to find Secondary Ledgers)
        const relationships = await db.select().from(glLedgerRelationships)
            .where(and(
                eq(glLedgerRelationships.primaryLedgerId, primaryLedgerId),
                eq(glLedgerRelationships.isActive, true),
                eq(glLedgerRelationships.conversionLevel, 'JOURNAL') // Only transfer at Journal level
            ));

        return await db.transaction(async (tx) => {
            const batchName = `SLA Import ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`;
            let totalPrimaryDr = 0;
            let totalPrimaryCr = 0;

            // 3. Process Journals
            for (const slaHeader of headersToProcess) {
                const slaLines = await tx.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, slaHeader.id));
                if (slaLines.length === 0) continue;

                // --- 3A. Post to Primary Ledger ---
                const primaryTotals = await this.createGlEntry(tx, primaryLedgerId, batchName, slaHeader, slaLines, 1);
                totalPrimaryDr += primaryTotals.dr;
                totalPrimaryCr += primaryTotals.cr;

                // --- 3B. Post to Secondary Ledgers (SLA Routing) ---
                for (const rel of relationships) {
                    let conversionRate = 1;

                    // Fetch Secondary Ledger currency to check if conversion is needed
                    const secondaryLedger = await tx.query.glLedgers.findFirst({
                        where: eq(glLedgers.id, rel.secondaryLedgerId)
                    });

                    if (secondaryLedger && secondaryLedger.currencyCode !== slaHeader.currencyCode) {
                        // Needs conversion. Fetch daily rate.
                        const rateRecord = await tx.query.glDailyRates.findFirst({
                            where: and(
                                eq(glDailyRates.fromCurrency, slaHeader.currencyCode),
                                eq(glDailyRates.toCurrency, secondaryLedger.currencyCode)
                                // In production, match exact conversion_date
                            )
                        });
                        if (rateRecord) {
                            conversionRate = Number(rateRecord.rate);
                        } else {
                            console.warn(`[GL SLA] Missing FX rate from ${slaHeader.currencyCode} to ${secondaryLedger.currencyCode}. Skipping secondary transfer.`);
                            continue;
                        }
                    }

                    await this.createGlEntry(tx, rel.secondaryLedgerId, `${batchName} (Secondary)`, slaHeader, slaLines, conversionRate, secondaryLedger?.currencyCode);
                }

                // 4. Mark SLA Header as Transferred
                await tx.update(slaJournalHeaders)
                    .set({ transferStatus: "Transferred" }) // glJournalId is tricky since there are now multiple, typically kept in a mapping table
                    .where(eq(slaJournalHeaders.id, slaHeader.id));
            }

            console.log(`[GL Transfer] Processed ${headersToProcess.length} SLA headers into multi-ledger GL.`);
            return { count: headersToProcess.length, totalPrimaryDr, totalPrimaryCr };
        });
    }

    private async createGlEntry(
        tx: any,
        ledgerId: string,
        batchName: string,
        slaHeader: any,
        slaLines: any[],
        conversionRate: number,
        targetCurrencyCode?: string
    ) {
        // Find or create batch for this ledger/run
        const [batch] = await tx.insert(glJournalBatches).values({
            batchName: batchName,
            description: `Import from SLA for Ledger ${ledgerId}`,
            status: "Unposted"
        }).returning();

        const journalNum = `JE-${slaHeader.eventClassId}-${slaHeader.entityId.slice(0, 8)}-${ledgerId.slice(0, 4)}-${Date.now()}`;
        const currency = targetCurrencyCode || slaHeader.currencyCode;

        const [glHeader] = await tx.insert(glJournals).values({
            journalNumber: journalNum,
            ledgerId: ledgerId,
            batchId: batch.id,
            description: slaHeader.description,
            currencyCode: currency,
            source: "SLA",
            category: slaHeader.eventClassId || "Manual",
            status: "Unposted",
            approvalStatus: "Not Required"
        }).returning();

        let dr = 0; let cr = 0;

        const glLinesToInsert = slaLines.map(l => {
            const accountedDr = Number(l.accountedDr || l.enteredDr || 0) * conversionRate;
            const accountedCr = Number(l.accountedCr || l.enteredCr || 0) * conversionRate;

            dr += accountedDr;
            cr += accountedCr;

            return {
                journalId: glHeader.id,
                accountId: l.codeCombinationId,
                description: l.description,
                currencyCode: currency,
                enteredDebit: (Number(l.enteredDr || 0) * conversionRate).toString(),
                enteredCredit: (Number(l.enteredCr || 0) * conversionRate).toString(),
                accountedDebit: accountedDr.toString(),
                accountedCredit: accountedCr.toString(),
                exchangeRate: conversionRate.toString()
            };
        });

        await tx.insert(glJournalLines).values(glLinesToInsert);

        await tx.update(glJournalBatches).set({
            totalDebit: dr.toFixed(2),
            totalCredit: cr.toFixed(2)
        }).where(eq(glJournalBatches.id, batch.id));

        return { dr, cr };
    }
}

export const glTransferService = new GlTransferService();
