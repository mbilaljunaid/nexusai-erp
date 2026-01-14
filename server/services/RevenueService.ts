import { db } from "@db";
import { revenueContracts, performanceObligations, revenueRecognitions, revenueSourceEvents, revenueSspBooks, revenueSspLines } from "@db/schema/revenue";
import { eq, and, sum, desc } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

export class RevenueService {

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
        relatedContractId?: string // Optional override
    }) {
        // 1. Log the Event
        const [event] = await db.insert(revenueSourceEvents).values({
            sourceSystem: eventData.sourceSystem,
            sourceId: eventData.sourceId,
            eventType: eventData.eventType,
            amount: eventData.amount.toString(),
            currency: eventData.currency,
            eventDate: eventData.eventDate,
            processingStatus: "Processing"
        }).returning();

        // 2. Identify Contract (Step 1 of ASC 606)
        let contractId = eventData.relatedContractId;
        if (!contractId) {
            contractId = await this.identifyContract(eventData.customerId, eventData.ledgerId);
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
     * Simplified Logic: Find an active "Open" contract for this customer within last 30 days, or create new.
     */
    private async identifyContract(customerId: string, ledgerId: string): Promise<string> {
        // Audit: In a real system, we'd have grouping rules here (e.g. "Group by PO Number").
        // For now, we assume a new Deal always = New Contract unless explicitly linked.

        const [newContract] = await db.insert(revenueContracts).values({
            contractNumber: `REV-${new Date().getFullYear()}-${uuidv4().substring(0, 8).toUpperCase()}`,
            customerId,
            ledgerId,
            status: "Active", // Open for business
            totalTransactionPrice: "0",
            totalAllocatedPrice: "0"
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

            await db.insert(revenueRecognitions).values({
                pobId,
                contractId: eventData.relatedContractId || "temp", // Fix this logic to pass contractId
                periodName: `${scheduleDate.toLocaleString('default', { month: 'short' })}-${scheduleDate.getFullYear().toString().substr(2)}`,
                scheduleDate,
                amount: monthlyAmount.toFixed(2),
                status: "Pending",
                eventType: "Schedule",
                accountType: "Revenue"
            });
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
}

export const revenueService = new RevenueService();
