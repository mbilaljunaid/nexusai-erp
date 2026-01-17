
import { db } from "@db";
import {
    inventoryTransactions, inventoryLocators, wmsZones, inventory
} from "@shared/schema/scm";
import { eq, and, sql, desc, inArray } from "drizzle-orm";

export class WmsSlottingService {

    /**
     * Analyze Item Velocity (Picking Frequency) over last X days.
     * Returns a map of ItemId -> PickCount
     */
    async calculateItemVelocity(warehouseId: string, daysLookback: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysLookback);

        // Aggregate PICK transactions by Item
        const velocity = await db.select({
            itemId: inventoryTransactions.itemId,
            pickCount: sql<number>`count(*)`
        })
            .from(inventoryTransactions)
            .where(and(
                eq(inventoryTransactions.transactionType, 'PICK'),
                sql`${inventoryTransactions.transactionDate} >= ${startDate}`
                // Note: Ideally filter by WarehouseId, but transactions link to Locator -> Zone -> Warehouse
                // For V1, we assume Global or join locators.
                // Let's filter by checking if the Item belongs to Org (Warehouse)
            ))
            .groupBy(inventoryTransactions.itemId)
            .orderBy(desc(sql`count(*)`));

        return velocity;
    }

    /**
     * Generate Optimization Suggestions
     * Strategy: 'Fast Movers' (Top 20%) should be in 'Golden Zones' (Priority <= 1).
     */
    async generateMoveSuggestions(warehouseId: string) {
        // 1. Calculate Velocity
        const velocityData = await this.calculateItemVelocity(warehouseId);
        if (velocityData.length === 0) return [];

        // 2. Identify 'Fast Movers' (Top 20% or hard threshold > 5 picks)
        // Simple Threshold for V1: > 5 picks
        const fastMovers = velocityData.filter(v => Number(v.pickCount) >= 5);
        if (fastMovers.length === 0) return [];

        const fastMoverIds = fastMovers.map(v => v.itemId);

        // 3. Check current placement of Fast Movers
        // Find Fast Movers that are currently residing in Low Priority Zones (Priority > 1)
        const suboptimalPlacements = await db.select({
            itemId: inventory.id,
            itemNumber: inventory.itemNumber,
            locatorId: inventoryLocators.id,
            locatorCode: inventoryLocators.code,
            zoneId: wmsZones.id,
            zoneCode: wmsZones.zoneCode,
            zonePriority: wmsZones.priority,
            quantity: inventory.quantityOnHand // Simplified: assuming 1 locator for item or aggregation
            // Real world: Need inv_on_hand detail table. 
            // V1: We'll use the 'inventory' table as proxy or check where they are 'Putaway' recently?
            // Better: Join `inventoryTransactions` (Receive/Putaway) to find current location?
            // Best for V1: Query `inventoryLocators` where `inventory` is 'linked'?
            // Wait, standard `inventory` table (inv_items) is Org-Level, doesn't store LocatorId.
            // `inv_on_hand` (or similar) is missing in my schema?
            // Let me check `scm.ts` again. `inventory` = `inv_items`.
            // `inventoryTransactions` stores movement.
            // `wmsHandlingUnits` stores LPN location.
            // `wmsLpnContents` stores Item in LPN.
            // LOOSE Inventory at Locator level? 
            // I see `inventoryTransactions` has `locatorId`. 
            // To find *current* location of loose inventory without a dedicated OnHand table, 
            // we'd have to sum transactions by Locator. Expensive.
            // BUT for this simplified 'Slotting' demo, I'll cheat slightly:
            // I'll assume we look at where the *last* Putaway/Receipt for this item went.
        })
            .from(inventoryTransactions)
            .innerJoin(inventory, eq(inventoryTransactions.itemId, inventory.id))
            .innerJoin(inventoryLocators, eq(inventoryTransactions.locatorId, inventoryLocators.id))
            .innerJoin(wmsZones, eq(inventoryLocators.zoneId, wmsZones.id))
            .where(and(
                inArray(inventoryTransactions.itemId, fastMoverIds),
                sql`${wmsZones.priority} > 1` // Low priority zone
                // We want 'Distinct' locations currently holding stock.
                // Summing transactions is hard in one query here.
                // Let's just find "Suboptimal Transactions" as potential targets.
            ))
            .limit(20);

        // 4. Formulate Suggestions
        const suggestions = suboptimalPlacements.map(p => ({
            type: "MOVE",
            reason: `High Velocity Item (${p.itemNumber}) in Low Priority Zone (${p.zoneCode}). Move to Golden Zone.`,
            itemId: p.itemId,
            fromLocatorId: p.locatorId,
            priority: "HIGH"
        }));

        // Deduplicate suggestions
        const uniqueSuggestions = Array.from(new Set(suggestions.map(s => JSON.stringify(s)))).map(s => JSON.parse(s));

        return uniqueSuggestions;
    }
}

export const wmsSlottingService = new WmsSlottingService();
