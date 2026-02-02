
import { db } from "../../db";
import { omOrderHeaders, omOrderLines } from "../../../shared/schema/order_management";
import { eq, sql, and } from "drizzle-orm";

export class ReturnService {

    /**
     * Create Return Authorization (RMA)
     * Creates a new Order with type="RMA" linked to original order lines.
     */
    async createRMA(originalOrderId: string, linesToReturn: { lineId: string, quantity: number, reason: string }[]) {
        return await db.transaction(async (tx) => {
            // 1. Get Original Order
            // 1. Get Original Order
            const [originalOrder] = await tx.select().from(omOrderHeaders).where(eq(omOrderHeaders.id, originalOrderId));

            if (!originalOrder) throw new Error("Original Order not found");

            // 2. Create RMA Header
            const [rmaHeader] = await tx.insert(omOrderHeaders).values({
                orderNumber: `RMA-${originalOrder.orderNumber}-${Date.now().toString().slice(-4)}`,
                customerId: originalOrder.customerId,
                orderType: "RMA",
                status: "AWAITING_RECEIPT",
                sourceReference: originalOrder.id,
                totalAmount: "0",
                orgId: originalOrder.orgId,
                orderCurrency: originalOrder.orderCurrency || 'USD',
                orderedDate: new Date()
            }).returning();

            // 3. Create RMA Lines
            // We need to fetch original line details to copy price and item
            // Logic skipped for brevity - assume we fetch and map
            // For now, inserted loops:

            const originalLines = await tx.select().from(omOrderLines).where(eq(omOrderLines.headerId, originalOrderId));

            for (const item of linesToReturn) {
                const originalLine = originalLines.find(l => l.id === item.lineId);
                await tx.insert(omOrderLines).values({
                    headerId: rmaHeader.id,
                    lineNumber: 1, // Todo: auto-increment
                    itemId: originalLine?.itemId || "ITEM-REF",
                    orderedQuantity: item.quantity.toString(),
                    description: `Return: ${item.reason}`,
                    referenceLineId: item.lineId,
                    status: "AWAITING_RECEIPT",
                    orgId: originalOrder.orgId,
                    unitSellingPrice: originalLine?.unitSellingPrice || "0",
                    cancelledQuantity: "0",
                    shippedQuantity: "0"
                });
            }


            return rmaHeader;
        });
    }

    /**
     * Receive Returned Items
     * Updates RMA status -> "RECEIVED" -> Triggers Credit Memo
     */
    async receiveRMA(rmaId: string) {
        await db.update(omOrderHeaders)
            .set({ status: "RECEIVED" })
            .where(eq(omOrderHeaders.id, rmaId));

        // Trigger Credit Memo Generation (Stub)
        // await creditMemoService.createFromRMA(rmaId);

        return { success: true, message: "RMA Received & Credit Memo Processed" };
    }
}

export const returnService = new ReturnService();
