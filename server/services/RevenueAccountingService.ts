import { db } from "@db";
import { revenueRecognitions, revenueGlAccounts, revenuePeriods } from "@db/schema";
import { eq, and, lte, gte } from "drizzle-orm";
import { slaService } from "./SlaService";

export class RevenueAccountingService {

    /**
     * Create Journal Entry for a Recognized Revenue Schedule via SLA
     */
    async createRevenueJournal(recognitionId: string, ledgerId: string) {
        // 0. Period Validation
        const recognition = await db.query.revenueRecognitions.findFirst({
            where: eq(revenueRecognitions.id, recognitionId)
        });

        if (!recognition) throw new Error("Recognition schedule not found");
        if (recognition.status === "Posted") return;

        const date = recognition.scheduleDate;
        const period = await db.query.revenuePeriods.findFirst({
            where: and(
                eq(revenuePeriods.ledgerId, ledgerId),
                lte(revenuePeriods.startDate, date),
                gte(revenuePeriods.endDate, date)
            )
        });

        if (!period || period.status !== "Open") {
            throw new Error(`Cannot post accounting. Revenue period is either not defined or closed for ${date.toLocaleDateString()}.`);
        }

        // 2. Fetch Accounting Configuration for this Ledger
        const [config] = await db.select().from(revenueGlAccounts)
            .where(eq(revenueGlAccounts.ledgerId, ledgerId))
            .limit(1);

        if (!config) {
            throw new Error(`Revenue Accounting Setup missing for Ledger ${ledgerId}. Please configure in Accounting Setup.`);
        }

        // 3. Prepare SLA Event
        // We DR Deferred Revenue and CR Revenue
        const event = {
            eventClass: "REVENUE_RECOGNITION",
            entityId: recognition.id,
            entityTable: "revenue_recognitions",
            description: `Revenue Recognition: POB ${recognition.pobId} / Period ${recognition.periodName}`,
            amount: parseFloat(recognition.amount),
            currency: "USD", // Should be from parent contract
            date: recognition.scheduleDate,
            ledgerId: ledgerId,
            sourceData: {
                ...recognition,
                revenueAccountCCID: config.revenueAccountCCID,
                deferredRevenueAccountCCID: config.deferredRevenueAccountCCID,
                contractAssetAccountCCID: config.contractAssetAccountCCID
            }
        };

        // 4. Trigger SLA Engine
        const slaHeader = await slaService.createAccounting(event as any);

        // 5. Post to GL (Finalize)
        // In a real system, this might be a separate background step
        const glJournal = await slaService.postToGL(slaHeader.id, "SYSTEM");

        // 6. Update Schedule Status
        await db.update(revenueRecognitions)
            .set({
                status: "Posted",
                glJournalId: glJournal.id
            })
            .where(eq(revenueRecognitions.id, recognitionId));

        return glJournal;
    }
}

export const revenueAccountingService = new RevenueAccountingService();
