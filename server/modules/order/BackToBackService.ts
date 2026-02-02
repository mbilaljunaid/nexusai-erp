
import { db } from "../../db";
import { omOrderHeaders, omOrderLines } from "../../../shared/schema/order_management";
import { manufacturingService } from "../../services/ManufacturingService";
import { eq } from "drizzle-orm";

export class BackToBackService {

    /**
     * Generate Work Order for Make-to-Order Only
     */
    async generateWorkOrders(orderId: string) {
        return await db.transaction(async (tx) => {
            // 1. Fetch Order
            const order = await tx.query.omOrderHeaders.findFirst({
                where: eq(omOrderHeaders.id, orderId),
                with: { lines: true }
            } as any);

            if (!order) return { success: false, message: "Order not found" };

            // 2. Identify Make-to-Order items
            // Ideally, check Item Master "IsMake" flag. 
            // V1: Check Order Type 'MAKE_TO_ORDER' or specific Line flow.
            // Using Order Type for Simplicity.

            if (order.orderType !== 'MAKE_TO_ORDER') {
                return { success: false, message: "Not a Make-to-Order type." };
            }

            const workOrders = [];

            // 3. Create WO per Line Item
            for (const line of order.lines) {
                // Skip non-make items? (Assuming all are make for this order type)

                const wo = await manufacturingService.createWorkOrder({
                    orderNumber: `WO-${order.orderNumber}-${line.lineNumber}`,
                    productId: line.itemId, // Assuming ItemID maps to ProductID
                    quantity: Number(line.orderedQuantity),
                    status: "scheduled",
                    scheduledDate: new Date(),
                    priority: "high",
                    sourceType: "SALES_ORDER", // Need to ensure schema supports this or use Description
                    workCenterId: "WC-MAIN" // Default
                } as any);
                // Cast to any because `sourceType` might not be in schema check yet 
                // but assuming it accepts extra fields or we rely on partial match.
                // Actually, let's check schema if strict.

                workOrders.push(wo);
            }

            console.log(`✅ Generated ${workOrders.length} Work Orders for Order ${order.orderNumber}`);

            return { success: true, workOrders };
        });
    }
}

export const backToBackService = new BackToBackService();
