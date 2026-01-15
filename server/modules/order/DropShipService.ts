
import { db } from "../../db";
import { omOrderHeaders, omOrderLines } from "../../../shared/schema/order_management";
import { procurementService } from "../scm/ProcurementService";
import { eq } from "drizzle-orm";

export class DropShipService {

    /**
     * Generate Purchase Order for Drop-Ship Lines
     * 1. Find BOOKED lines marked as "Drop Ship" (or by sourcing rule)
     * 2. Group by Supplier
     * 3. Create POs linked to Sales Order
     */
    async generateDropShipPO(orderId: string) {
        return await db.transaction(async (tx) => {
            // 1. Fetch Order
            const order = await tx.query.omOrderHeaders.findFirst({
                where: eq(omOrderHeaders.id, orderId),
                with: { lines: true }
            } as any);

            if (!order || order.orderType !== 'DROP_SHIP') {
                return { message: "Not a Drop Ship order." };
            }

            // Stub: Assume all lines are for same supplier "SUP-DS-001"
            const supplierId = "SUP-DS-001";

            // 2. Map SO Lines to PO Lines
            const poLines = order.lines.map((line: any) => ({
                itemId: line.itemId,
                description: line.description,
                quantity: parseFloat(line.orderedQuantity),
                unitPrice: parseFloat(line.unitSellingPrice || "0"), // Buy Price (stubbed as Sell Price, need Cost)
                amount: parseFloat(line.extendedAmount || "0"),
                lineNumber: line.lineNumber // Will be re-indexed by service
            }));

            // 3. Call Procurement Service
            const po = await procurementService.createPurchaseOrder({
                header: {
                    orderNumber: `PO-DS-${order.orderNumber}`,
                    supplierId: supplierId,
                    status: "OPEN",
                    totalAmount: order.totalAmount, // Rough estimate
                },
                lines: poLines
            });

            console.log(`✅ Generated Drop Ship PO: ${po.orderNumber} for Order ${order.orderNumber}`);

            return { success: true, poNumber: po.orderNumber, poId: po.id };
        });
    }
}

export const dropShipService = new DropShipService();
