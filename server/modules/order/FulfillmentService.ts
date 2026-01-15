
import { db } from "../../db";
import { omOrderLines } from "../../../shared/schema/order_management";
import { costingService } from "../finance/CostingService";
import { eq, sql } from "drizzle-orm";

export class FulfillmentService {

    /**
     * Pick Items for Order Lines
     * Updates status to PICKED.
     */
    async pickLines(lineIds: string[]) {
        // Validations: Check if lines are RESERVED or AWAITING_SHIPPING

        // Update lines
        const updated = await db.update(omOrderLines)
            .set({ status: "PICKED" })
            .where(sql`${omOrderLines.id} IN ${lineIds}`)
            .returning();

        return { count: updated.length, message: "Lines Picked" };
    }

    /**
     * Ship Lines
     * Updates status to SHIPPED.
     * Triggers Invoice Creation (via OrderManagementService -> AR Integration).
     */
    async shipLines(lineIds: string[], trackingNumber?: string) {
        // Validation must be PICKED

        // Fetch lines first to get details for COGS
        const shippableLines = await db.select().from(omOrderLines)
            .where(sql`${omOrderLines.id} IN ${lineIds}`)
            .execute();

        if (shippableLines.length === 0) throw new Error("No eligible lines to ship.");

        await db.transaction(async (tx) => {
            // 1. Update Status
            await tx.update(omOrderLines)
                .set({ status: "SHIPPED", shippedQuantity: sql`${omOrderLines.orderedQuantity}` }) // Assume full ship for V1
                .where(sql`${omOrderLines.id} IN ${lineIds}`);

            // 2. Record COGS
            for (const line of shippableLines) {
                await costingService.recordCOGS({
                    itemId: line.itemId,
                    quantity: Number(line.orderedQuantity),
                    orgId: line.orgId,
                    orderId: line.headerId,
                    lineId: line.id
                });
            }

            // 3. Trigger Invoice (Stub or Event)
            // await invoiceService.createInvoiceFromOrderLines(lineIds);
        });

        return { success: true, message: "Lines Shipped" };
    }
}

export const fulfillmentService = new FulfillmentService();
