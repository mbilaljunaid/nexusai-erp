
import { db } from "../db";
import { sourcingRfqs, sourcingRfqLines, sourcingBids, sourcingBidLines, procurementContracts } from "../../shared/schema/scm";
import { eq, and, desc } from "drizzle-orm";

export class SourcingService {
    /**
     * Create a new sourcing event (RFQ)
     */
    async createRFQ(data: any) {
        return await db.transaction(async (tx) => {
            const [rfq] = await tx.insert(sourcingRfqs).values({
                rfqNumber: data.rfqNumber || `RFQ-${Date.now()}`,
                title: data.title,
                description: data.description,
                status: 'DRAFT',
                closeDate: data.closeDate ? new Date(data.closeDate) : null
            }).returning();

            if (data.lines && data.lines.length > 0) {
                const linesToInsert = data.lines.map((line: any, index: number) => ({
                    rfqId: rfq.id,
                    lineNumber: index + 1,
                    itemDescription: line.itemDescription,
                    targetQuantity: line.targetQuantity.toString(),
                    unitOfMeasure: line.unitOfMeasure
                }));
                await tx.insert(sourcingRfqLines).values(linesToInsert);
            }

            return rfq;
        });
    }

    /**
     * Publish RFQ to suppliers
     */
    async publishRFQ(rfqId: string) {
        const [updated] = await db.update(sourcingRfqs)
            .set({ status: 'PUBLISHED' })
            .where(eq(sourcingRfqs.id, rfqId))
            .returning();
        return updated;
    }

    /**
     * List RFQs for internal workbench
     */
    async listRfqs() {
        return await db.select().from(sourcingRfqs).orderBy(desc(sourcingRfqs.createdAt));
    }

    /**
     * Get RFQ details with lines and bids
     */
    async getRFQDetails(rfqId: string) {
        const [rfq] = await db.select().from(sourcingRfqs).where(eq(sourcingRfqs.id, rfqId));
        if (!rfq) return null;

        const lines = await db.select().from(sourcingRfqLines).where(eq(sourcingRfqLines.rfqId, rfqId));
        const bids = await db.select().from(sourcingBids).where(eq(sourcingBids.rfqId, rfqId));

        return { ...rfq, lines, bids };
    }

    /**
     * Submit a bid (from Supplier Portal)
     */
    async submitBid(data: any) {
        return await db.transaction(async (tx) => {
            const [bid] = await tx.insert(sourcingBids).values({
                rfqId: data.rfqId,
                supplierId: data.supplierId,
                bidStatus: 'SUBMITTED',
                submissionDate: new Date(),
                notes: data.notes
            }).returning();

            if (data.lines && data.lines.length > 0) {
                const linesToInsert = data.lines.map((line: any) => ({
                    bidId: bid.id,
                    rfqLineId: line.rfqLineId,
                    offeredPrice: line.offeredPrice.toString(),
                    offeredQuantity: line.offeredQuantity.toString(),
                    supplierLeadTime: line.supplierLeadTime
                }));
                await tx.insert(sourcingBidLines).values(linesToInsert);
            }

            return bid;
        });
    }

    /**
     * Compare bids for an RFQ
     */
    async compareBids(rfqId: string) {
        const bids = await db.select().from(sourcingBids).where(eq(sourcingBids.rfqId, rfqId));
        const bidDetails = [];

        for (const bid of bids) {
            const lines = await db.select().from(sourcingBidLines).where(eq(sourcingBidLines.bidId, bid.id));
            const totalBidAmount = lines.reduce((acc, l) => acc + (Number(l.offeredPrice) * Number(l.offeredQuantity)), 0);
            bidDetails.push({ ...bid, lines, totalBidAmount });
        }

        return bidDetails;
    }

    /**
     * Award RFQ to a specific bid
     */
    async awardRFQ(rfqId: string, bidId: string) {
        return await db.transaction(async (tx) => {
            // 1. Update RFQ status
            await tx.update(sourcingRfqs)
                .set({ status: 'AWARDED' })
                .where(eq(sourcingRfqs.id, rfqId));

            // 2. Update Bid status
            const [bid] = await tx.update(sourcingBids)
                .set({ bidStatus: 'AWARDED' as any })
                .where(eq(sourcingBids.id, bidId))
                .returning();

            // 3. Create a Draft Procurement Contract from award
            const [rfq] = await tx.select().from(sourcingRfqs).where(eq(sourcingRfqs.id, rfqId));

            const [contract] = await tx.insert(procurementContracts).values({
                supplierId: bid.supplierId,
                contractNumber: `CONT-FROM-RFQ-${rfq.rfqNumber}`,
                title: `Contract awarded from ${rfq.title}`,
                status: 'DRAFT',
                startDate: new Date()
            }).returning();

            return { bid, contract };
        });
    }
}

export const sourcingService = new SourcingService();
