
import { db } from "@db";
import {
    omOrderHeaders, omOrderLines,
    inventory, inventoryTransactions,
    asnHeaders, asnLines,
    wmsWaves, wmsTasks, wmsHandlingUnits
} from "@shared/schema/scm";
import { omOrderHeaders, omOrderLines } from "@shared/schema/order_management";
import { eq, and, sql } from "drizzle-orm";

export class WmsShippingService {

    // Ship Confirm (Wave or Order)
    async shipConfirm(payload: { waveId?: string, orderId?: string, carrier?: string, tracking?: string }) {
        return await db.transaction(async (tx) => {
            let linesToShip = [];
            let headerToUpdate = null;
            let supplierId = "INTERNAL"; // Or mapped from Org

            // 1. Identify Scope
            if (payload.orderId) {
                linesToShip = await tx.select().from(omOrderLines).where(eq(omOrderLines.headerId, payload.orderId));
                headerToUpdate = payload.orderId;
            } else if (payload.waveId) {
                // Find orders/lines linked to wave (Need to join wmsTasks -> omOrderLines)
                // Simplified: Logic to find lines from Wave tasks
            }

            if (!headerToUpdate) throw new Error("Order ID required for V1 Shipping");

            // 2. Validate Status
            // Check if all lines are PICKED (or PACKED if we enforced it).
            // For now, allow shipping if PICKED.
            const unpicked = linesToShip.filter(l => l.status !== 'PICKED' && l.status !== 'SHIPPED');
            if (unpicked.length > 0) {
                throw new Error(`Cannot Ship. Lines ${unpicked.map(u => u.lineNumber).join(',')} are not PICKED.`);
            }

            // 3. Update Order Status
            await tx.update(omOrderHeaders)
                .set({ status: 'SHIPPED', shippingMethod: payload.carrier })
                .where(eq(omOrderHeaders.id, payload.orderId!));

            // 4. Update Lines & Deplete Inventory
            const shippedLines = [];

            for (const line of linesToShip) {
                if (line.status === 'SHIPPED') continue;

                // Update Line
                await tx.update(omOrderLines)
                    .set({ status: 'SHIPPED', shippedQuantity: line.orderedQuantity }) // Assume full ship for V1
                    .where(eq(omOrderLines.id, line.id));

                // Deplete Inventory (ISSUE)
                await tx.insert(inventoryTransactions).values({
                    itemId: line.itemId,
                    transactionType: "SHIP",
                    quantity: line.orderedQuantity, // Negative? Usually transactions are positive magnitudes with Type defining direction.
                    // But if we want easy Sum, maybe negative.
                    // Standard: Type=SHIP implies Issue.
                    transactionDate: new Date(),
                    sourceDocumentType: "ORDER",
                    sourceDocumentId: line.headerId,
                    reference: "SHIP-" + line.id
                });

                // DIRECT UPDATE of OnHand (since no trigger exists yet)
                // We assume 'inventory' table has the master record for the Org+Item
                await tx.execute(sql`
                    UPDATE inv_items 
                    SET "quantityOnHand" = "quantityOnHand" - ${line.orderedQuantity}
                    WHERE id = ${line.itemId}
                `);

                shippedLines.push(line);
            }

            // 5. Generate ASN (Advance Shipment Notice)
            // Need a dummy supplierId or 'SELF'
            const asnNumber = "ASN-" + Date.now();
            const [asn] = await tx.insert(asnHeaders).values({
                asnNumber,
                supplierId: "SELF",
                poId: "OUTBOUND", // Not a PO
                status: "SHIPPED",
                shippedDate: new Date(),
                carrier: payload.carrier,
                trackingNumber: payload.tracking
            }).returning();

            for (const line of shippedLines) {
                await tx.insert(asnLines).values({
                    asnId: asn.id,
                    poLineId: line.id, // Using OrderLine ID as ref
                    itemId: line.itemId,
                    quantityShipped: line.orderedQuantity?.toString() || "0"
                });
            }

            return { success: true, asnNumber, shippedCount: shippedLines.length };
        });
    }
}

export const wmsShippingService = new WmsShippingService();
