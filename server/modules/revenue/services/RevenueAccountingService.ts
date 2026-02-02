import { db } from "../../../db";
import { revenueRecognitions, revenueGlAccounts, revenuePeriods } from "@shared/schema";
import { eq, and, lte, gte } from "drizzle-orm";
import { eq, and, lte, gte } from "drizzle-orm";
// New Imports
import { slaEngine } from "../../sla/sla.service";
import { glTransferService } from "../../../services/GlTransferService";
import { slaJournalHeaders } from "@shared/schema";


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
        // 4. Trigger SLA Engine
        const slaHeaderId = await slaEngine.createAccounting({
            eventClassId: "AR_REVENUE",
            eventTypeId: "AR_REV_REC_STD",
            entityId: recognition.id,
            entityTable: "revenue_recognitions",
            description: `Revenue Recognition: POB ${recognition.pobId} / Period ${recognition.periodName}`,
            amount: parseFloat(recognition.amount),
            currencyCode: "USD",
            eventDate: recognition.scheduleDate,
            glDate: recognition.scheduleDate,
            ledgerId: ledgerId,
            sourceData: {
                ...recognition,
                revenueAccountCCID: config.revenueAccountCCID,
                deferredRevenueAccountCCID: config.deferredRevenueAccountCCID,
                contractAssetAccountCCID: config.contractAssetAccountCCID
            }
        });

        // 5. Post to GL (Finalize) via Transfer Service
        // This will transfer ALL final events for this ledger, including this one.
        await glTransferService.transferToGl(ledgerId);

        // Fetch the created GL Journal ID from the SLA Header
        const [updatedSlaHeader] = await db.select().from(slaJournalHeaders).where(eq(slaJournalHeaders.id, slaHeaderId));

        // 6. Update Schedule Status
        await db.update(revenueRecognitions)
            .set({
                status: "Posted",
                glJournalId: updatedSlaHeader?.glJournalId
            })
            .where(eq(revenueRecognitions.id, recognitionId));

        return { id: updatedSlaHeader?.glJournalId };
    }
}

export const revenueAccountingService = new RevenueAccountingService();
