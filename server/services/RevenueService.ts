import { db } from "@db";
import {
    revenueContracts, performanceObligations, revenueRecognitions,
    revenueSourceEvents, revenueSspBooks, revenueSspLines,
    revenueIdentificationRules, performanceObligationRules,
    revenuePeriods
} from "@db/schema";
import { eq, and, sum, desc, sql, lte, gte } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';
import { revenueAccountingService } from "./RevenueAccountingService";

export class RevenueService {

    /**
     * Check if the Revenue Period is Open for a given date
     */
    async validatePeriodOpen(ledgerId: string, date: Date) {
        const period = await db.query.revenuePeriods.findFirst({
            where: and(
                eq(revenuePeriods.ledgerId, ledgerId),
                lte(revenuePeriods.startDate, date),
                gte(revenuePeriods.endDate, date)
            )
        });

        if (!period) {
            throw new Error(`No revenue period defined for date ${date.toLocaleDateString()}. Please open periods first.`);
        }

        if (period.status !== "Open") {
            throw new Error(`Revenue period ${period.periodName} is ${period.status}. Transactions are blocked.`);
        }

        return period;
    }

    /**
     * Process an Inbound Commercial Event (Order, Subscription, Usage)
     * This is the entry point for the "O2R" flow.
     */
    async processSourceEvent(eventData: {
        sourceSystem: string,
        sourceId: string,
        eventType: string,
        customerId: string,
        ledgerId: string,
        amount: number,
        currency: string,
        eventDate: Date,
        relatedContractId?: string, // Optional override
        referenceNumber?: string,
        legalEntityId?: string,
        orgId?: string
    }) {
        // 0. Period Validation
        await this.validatePeriodOpen(eventData.ledgerId, eventData.eventDate);

        // 1. Log the Event
        const [event] = await db.insert(revenueSourceEvents).values({
            sourceSystem: eventData.sourceSystem,
            sourceId: eventData.sourceId,
            eventType: eventData.eventType,
            amount: eventData.amount.toString(),
            currency: eventData.currency,
            eventDate: eventData.eventDate,
            referenceNumber: eventData.referenceNumber,
            legalEntityId: eventData.legalEntityId,
            orgId: eventData.orgId,
            processingStatus: "Processing"
        }).returning();

        // 2. Identify Contract (Step 1 of ASC 606)
        let contractId = eventData.relatedContractId;
        if (!contractId) {
            contractId = await this.identifyContract(
                eventData.customerId,
                eventData.ledgerId,
                eventData.legalEntityId,
                eventData.orgId
            );
        }

        // 3. Identify POB (Step 2 of ASC 606)
        const pobId = await this.identifyPerformanceObligation(contractId, eventData);

        // 4. Update Transaction Price (Step 3 of ASC 606)
        await this.updateTransactionPrice(contractId, eventData.amount);

        // 5. Trigger Re-Allocation (Step 4 of ASC 606)
        await this.allocateRevenue(contractId);

        // 6. Generate/Update Schedules (Step 5 of ASC 606)
        // Only if eventType is capable of satisfying a POB or creating a schedule
        if (eventData.eventType === 'Booking' || eventData.eventType === 'SubscriptionStart') {
            await this.generateInitialSchedules(pobId, eventData);
        }

        // 7. Mark Event Processed
        await db.update(revenueSourceEvents)
            .set({ processingStatus: "Processed", contractId: contractId })
            .where(eq(revenueSourceEvents.id, event.id));

        return { contractId, pobId };
    }

    /**
     * Step 1: Identify the Contract
     * Expanded for Tier-1: Supports legal entity, org isolation and versioning.
     */
    private async identifyContract(customerId: string, ledgerId: string, legalEntityId?: string, orgId?: string): Promise<string> {
        // Audit: In a real system, we'd have grouping rules here (e.g. "Group by PO Number").
        // For now, we assume a new Deal always = New Contract unless explicitly linked.

        const [newContract] = await db.insert(revenueContracts).values({
            contractNumber: `REV-${new Date().getFullYear()}-${uuidv4().substring(0, 8).toUpperCase()}`,
            customerId,
            ledgerId,
            legalEntityId,
            orgId,
            status: "Active", // Open for business
            totalTransactionPrice: "0",
            totalAllocatedPrice: "0",
            versionNumber: 1
        }).returning();

        return newContract.id;
    }

    /**
     * Step 2: Identify Performance Obligation
     */
    private async identifyPerformanceObligation(contractId: string, eventData: any): Promise<string> {
        // Logic: Is this a distinct good or service?
        // For MVP, every Line Item is a distinct POB.

        // Check for SSP (Fair Value)
        const ssp = await this.getStandaloneSellingPrice(eventData.itemId);

        const [pob] = await db.insert(performanceObligations).values({
            contractId,
            name: `POB for ${eventData.sourceId}`, // Needs better naming from item master
            itemType: "Service", // Default
            transactionPrice: eventData.amount.toString(),
            sspPrice: ssp.toString(),
            allocatedPrice: "0", // Will be calculated in Step 4
            satisfactionMethod: "Ratable", // Default to OverTime for subscriptions
            startDate: eventData.eventDate,
            endDate: new Date(new Date(eventData.eventDate).setFullYear(new Date(eventData.eventDate).getFullYear() + 1)), // Default 1 year
            status: "Open"
        }).returning();

        return pob.id;
    }

    /**
     * Get SSP from Price Books
     */
    private async getStandaloneSellingPrice(itemId?: string): Promise<number> {
        // Stub logic: If no specific SSP, use list price or default
        return 1000;
    }

    /**
     * Step 3: Update Transaciton Price
     */
    private async updateTransactionPrice(contractId: string, amount: number) {
        // Accumulate total contract value
        // In a real system, this handles Variable Consideration
        const contract = await db.query.revenueContracts.findFirst({
            where: eq(revenueContracts.id, contractId)
        });

        const newTotal = parseFloat(contract?.totalTransactionPrice || "0") + amount;

        await db.update(revenueContracts)
            .set({ totalTransactionPrice: newTotal.toString() })
            .where(eq(revenueContracts.id, contractId));
    }

    /**
     * Step 4: Allocate Revenue (Relativity Method)
     */
    private async allocateRevenue(contractId: string) {
        // 1. Get all POBs
        const pobs = await db.select().from(performanceObligations).where(eq(performanceObligations.contractId, contractId));

        const totalSSP = pobs.reduce((sum, pob) => sum + parseFloat(pob.sspPrice || "0"), 0);
        const contract = await db.query.revenueContracts.findFirst({
            where: eq(revenueContracts.id, contractId)
        });
        const totalTransactionPrice = parseFloat(contract?.totalTransactionPrice || "0");

        if (totalSSP === 0) return; // Divide by zero guard

        // 2. Distribute Value
        for (const pob of pobs) {
            const ratio = parseFloat(pob.sspPrice || "0") / totalSSP;
            const allocatedAmount = totalTransactionPrice * ratio;

            await db.update(performanceObligations)
                .set({ allocatedPrice: allocatedAmount.toFixed(2) })
                .where(eq(performanceObligations.id, pob.id));
        }

        // Update Contract Total Allocated
        await db.update(revenueContracts)
            .set({ totalAllocatedPrice: totalTransactionPrice.toString() })
            .where(eq(revenueContracts.id, contractId));
    }

    /**
     * Step 5: Generate Schedules
     */
    private async generateInitialSchedules(pobId: string, eventData: any) {
        // Simple Ratable Logic (12 Months)
        const amount = parseFloat(eventData.amount.toString()); // Note: Should use Allocated Price in real world
        const monthlyAmount = amount / 12;

        for (let i = 0; i < 12; i++) {
            const scheduleDate = new Date(eventData.eventDate);
            scheduleDate.setMonth(scheduleDate.getMonth() + i);

            const [recognition] = await db.insert(revenueRecognitions).values({
                pobId,
                contractId: eventData.relatedContractId || "temp", // Fix this logic to pass contractId
                periodName: `${scheduleDate.toLocaleString('default', { month: 'short' })}-${scheduleDate.getFullYear().toString().substr(2)}`,
                scheduleDate,
                amount: monthlyAmount.toFixed(2),
                status: "Pending",
                eventType: "Schedule",
                accountType: "Revenue"
            }).returning();

            // Auto-Post to GL (Real-time integration)
            // In production, this might be a batch job
            await revenueAccountingService.createRevenueJournal(recognition.id, eventData.ledgerId);
        }
    }
    /**
     * SSP Management: Create Book
     */
    async createSspBook(data: { name: string, currency: string, effectiveFrom: Date }) {
        if (!data.name || data.name.trim() === "") throw new Error("Book name is required");
        const [book] = await db.insert(revenueSspBooks).values({
            name: data.name,
            currency: data.currency,
            effectiveFrom: data.effectiveFrom,
            status: "Draft"
        }).returning();
        return book;
    }

    /**
      * SSP Management: Add Line
      */
    async addSspLine(data: { bookId: string, itemId: string, sspValue: number, minQuantity?: number }) {
        if (data.sspValue < 0) throw new Error("SSP Value cannot be negative");
        const [line] = await db.insert(revenueSspLines).values({
            bookId: data.bookId,
            itemId: data.itemId,
            sspValue: data.sspValue.toString(),
            minQuantity: (data.minQuantity || 0).toString()
        }).returning();
        return line;
    }

    /**
     * REPORTING: Revenue Waterfall
     * Aggregates recognized revenue by period
     */
    async getRevenueWaterfall(fiscalYear: number) {
        // Query: Group by Period Name, Sum Amount
        // Filter: Schedule Date in Fiscal Year
        const startOfYear = new Date(`${fiscalYear}-01-01`);
        const endOfYear = new Date(`${fiscalYear}-12-31`);

        const waterfall = await db.select({
            period: revenueRecognitions.periodName,
            amount: sum(revenueRecognitions.amount).mapWith(Number)
        })
            .from(revenueRecognitions)
            .where(
                and(
                    eq(revenueRecognitions.accountType, "Revenue"),
                    // Simple date range check. In real world, use >= and <= with proper date casting if needed,
                    // but query builder usually handles date objects well.
                    // For safety in raw SQL/Drizzle with dates:
                    sql`${revenueRecognitions.scheduleDate} >= ${startOfYear.toISOString()} AND ${revenueRecognitions.scheduleDate} <= ${endOfYear.toISOString()}`
                )
            )
            .groupBy(revenueRecognitions.periodName)
            .orderBy(revenueRecognitions.periodName); // Note: String sort might be wrong (Jan, Feb...), need logic or period ID

        // Post-processing for logical period sorting if needed (frontend can handle or we use a mapping)
        return waterfall;
    }

    /**
     * REPORTING: Deferred Revenue Matrix (Rollforward)
     * Opening Balance + Billings - Revenue = Ending Balance
     */
    async getDeferredRevenue(asOfDate: Date) {
        // 1. Total Billings (Allocated Price of all Active Contracts/POBs)
        // Note: In strict accounting, "Billings" comes from Invoices (AR).
        // Here we track "Contract Liability" based on Booking (Allocated Price) vs Recognition.
        // This is "Unbilled Receivable" + "Deferred Revenue" combined view.

        // Get all POBs
        const pobs = await db.select().from(performanceObligations);

        let matrix = {
            totalBookings: 0,
            totalRecognized: 0,
            deferredBalance: 0
        };

        for (const pob of pobs) {
            const bookingAmount = parseFloat(pob.allocatedPrice || "0");
            matrix.totalBookings += bookingAmount;
        }

        // Get all recognized revenue up to asOfDate
        const recognized = await db.select({
            total: sum(revenueRecognitions.amount).mapWith(Number)
        })
            .from(revenueRecognitions)
            .where(
                and(
                    eq(revenueRecognitions.accountType, "Revenue"),
                    sql`${revenueRecognitions.scheduleDate} <= ${asOfDate.toISOString()}`
                )
            );

        matrix.totalRecognized = recognized[0]?.total || 0;
        matrix.deferredBalance = matrix.totalBookings - matrix.totalRecognized;

        return matrix;
    }

    /**
     * Process a Contract Modification (ASC 606)
     * Handles retrospective catch-up if price/delivery changes.
     */
    async processContractModification(contractId: string, modificationData: { newTotalValue: number, reason: string }) {
        // 1. Fetch current contract state
        const contract = await db.query.revenueContracts.findFirst({
            where: eq(revenueContracts.id, contractId)
        });

        if (!contract) throw new Error("Contract not found");

        // 0. Period Validation
        await this.validatePeriodOpen(contract.ledgerId || "PRIMARY", new Date());

        // Fetch POBs and Recognitions
        const pobs = await db.select().from(performanceObligations).where(eq(performanceObligations.contractId, contractId));
        const recognitions = await db.select().from(revenueRecognitions).where(eq(revenueRecognitions.contractId, contractId));

        // 2. Calculate Life-to-Date (LTD) Recognized
        const ltdRecognized = recognitions
            .filter(r => r.status === "Posted" && r.accountType === "Revenue")
            .reduce((sum, r) => sum + parseFloat(r.amount), 0);

        // 3. Re-allocate Transaction Price
        const oldTotal = parseFloat(contract.totalAllocatedPrice || "1");
        const ratio = modificationData.newTotalValue / oldTotal;

        // 4. Calculate what LTD SHOULD BE at new price
        const newLtdShouldBe = ltdRecognized * ratio;
        const catchupAmount = newLtdShouldBe - ltdRecognized;

        // 5. Update Contract & POBs (Increment Version for Audit)
        const nextVersion = (contract.versionNumber || 1) + 1;

        await db.update(revenueContracts)
            .set({
                totalAllocatedPrice: modificationData.newTotalValue.toString(),
                totalTransactionPrice: modificationData.newTotalValue.toString(),
                versionNumber: nextVersion
            })
            .where(eq(revenueContracts.id, contractId));

        for (const pob of pobs) {
            const newPobAllocated = parseFloat(pob.allocatedPrice || "0") * ratio;
            await db.update(performanceObligations)
                .set({ allocatedPrice: newPobAllocated.toString() })
                .where(eq(performanceObligations.id, pob.id));
        }

        // 6. Create "Catch-up" Recognition Entry
        if (Math.abs(catchupAmount) > 0.01) {
            await db.insert(revenueRecognitions).values({
                contractId,
                pobId: pobs[0].id, // Assign to first POB for simplicity in MVP
                periodName: "Mar-26", // Should use current open period
                scheduleDate: new Date(),
                amount: catchupAmount.toString(),
                accountType: "Revenue",
                eventType: "CatchUp",
                description: `Modification Catch-up: ${modificationData.reason}`,
                status: "Pending"
            });
        }

        console.log(`[Revenue] Contract ${contractId} modified. Catch-up of ${catchupAmount} generated.`);

        return { catchupAmount, newTotal: modificationData.newTotalValue };
    }
}

export const revenueService = new RevenueService();
