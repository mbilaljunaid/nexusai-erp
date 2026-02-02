
import { db } from "../db";
import { eq, lt, and, isNotNull } from "drizzle-orm";
import { inventory, purchaseRequisitions, purchaseRequisitionLines } from "@shared/schema";

export class InventoryReorderService {

    /**
     * Check inventory levels and trigger requisitions if below min
     */
    async checkAndReorder(inventoryId: string) {
        // 1. Get Item Level
        const item = await db.query.inventory.findFirst({
            where: eq(inventory.id, inventoryId)
        });

        if (!item || !item.minQuantity) return;

        const onHand = Number(item.quantityOnHand || 0);
        const min = Number(item.minQuantity);
        const max = Number(item.maxQuantity || min * 2); // Default to double min if no max

        if (onHand < min) {
            console.log(`[Auto-Reorder] Item ${item.itemNumber} (Qty: ${onHand}) is below Min (${min}). Triggering Reorder.`);
            await this.createRequisition(item, max - onHand);
        }
    }

    private async createRequisition(item: any, quantityNeeded: number) {
        // Check if there is already a pending PR for this item? (Skipped for simplicity)

        // 1. Create Header
        const [header] = await db.insert(purchaseRequisitions).values({
            requisitionNumber: `REQ-AUTO-${Date.now()}`,
            description: `Auto-replenishment for ${item.itemNumber}`,
            status: "PENDING",
            sourceModule: "SCM",
            sourceId: "SYSTEM_AUTO"
        }).returning();

        // 2. Create Line
        await db.insert(purchaseRequisitionLines).values({
            requisitionId: header.id,
            lineNumber: 1,
            itemId: item.id,
            itemDescription: item.description || `Replenishment for ${item.itemNumber}`,
            quantity: quantityNeeded.toString(),
            unitOfMeasure: item.primaryUomCode || "EA",
            status: "PENDING"
        });

        console.log(`[Auto-Reorder] Created Requisition ${header.requisitionNumber} for ${quantityNeeded} units.`);
    }
}

export const inventoryReorderService = new InventoryReorderService();
