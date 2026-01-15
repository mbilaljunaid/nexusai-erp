
import { db } from "../../db";
import { omOrderLines } from "@shared/schema/order_management"; // Assuming relative path fix or alias works
import { inventory, inventoryTransactions } from "@shared/schema/scm";
import { eq, sql } from "drizzle-orm";

export class ReservationService {

    /**
     * Reserve Inventory for an Order Line
     * Validates availability and creates a reservation (soft allocation).
     */
    async reserveInventory(lineId: string, quantity: number, warehouseId: string) {
        // 1. Check On-Hand Quantity
        const [stock] = await db.select().from(inventory)
            .where(eq(inventory.id, lineId)); // Assuming lineId wraps ItemId or we fetch item from line.

        // Correction: lineId is Order Line ID. We need ItemId.
        const [line] = await db.select().from(omOrderLines).where(eq(omOrderLines.id, lineId));
        if (!line) throw new Error("Order Line not found");

        const [invItem] = await db.select().from(inventory).where(eq(inventory.id, line.itemId));

        // If item not found in inventory, assume 0 stock unless it's non-inventory
        const onHand = invItem ? invItem.quantity || 0 : 0;
        const requested = Number(quantity);

        if (onHand < requested) {
            throw new Error(`Insufficient Inventory. Requested: ${requested}, Available: ${onHand} for Item ${line.itemId}`);
        }

        // 2. Create Reservation (Updating Line Status for now)
        await db.update(omOrderLines)
            .set({
                status: "AWAITING_SHIPPING",
                warehouseId: warehouseId // Assign warehouse
            })
            .where(eq(omOrderLines.id, lineId));

        return { success: true, message: "Inventory Reserved" };
    }

    /**
     * Release Reservation (e.g. on Cancel)
     */
    async releaseReservation(lineId: string) {
        // Revert status
        await db.update(omOrderLines)
            .set({ status: "CANCELLED" })
            .where(eq(omOrderLines.id, lineId));
    }
}

export const reservationService = new ReservationService();
