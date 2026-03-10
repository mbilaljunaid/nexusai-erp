
import { Injectable, Logger, Inject } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema/index';
import { eq, and, isNotNull, lt } from 'drizzle-orm';

@Injectable()
export class InventoryPlanningService {
    private readonly logger = new Logger(InventoryPlanningService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    async runMinMaxPlanning(organizationId: string): Promise<any[]> {
        // 1. Fetch all items with Min-Max definition in the Org
        // Note: Drizzle query. We assume minQuantity IS NOT NULL check
        const items = await this.db.query.inventory.findMany({
            where: and(
                eq(schema.inventory.organizationId, organizationId),
                isNotNull(schema.inventory.minQuantity)
            )
        });

        const replenishmentSuggestions: any[] = [];

        for (const item of items) {
            const onHand = Number(item.quantityOnHand || 0);
            const minQty = Number(item.minQuantity);

            if (onHand < minQty) {
                // Trigger Replenishment
                // Calculate Order Qty
                let orderQty = 0;
                if (item.maxQuantity && Number(item.maxQuantity) > 0) {
                    orderQty = Number(item.maxQuantity) - onHand;
                    // } else if (item.reorderQuantity) { // Missing in schema currently, fallback
                    //     orderQty = Number(item.reorderQuantity);
                } else {
                    // Default to Min Qty delta if no Max specified (Simple Restock to Min seems wrong, usually restock to Max or Min+Delta)
                    // Implementing simple "Bring back to Min" + Safety or just Min - OnHand?
                    // Legacy code: orderQty = minQty - onHand (if no max/reorder)
                    orderQty = minQty - onHand;
                }

                if (orderQty > 0) {
                    replenishmentSuggestions.push({
                        itemId: item.id,
                        itemNumber: item.itemNumber,
                        description: item.description,
                        currentOnHand: onHand,
                        minQuantity: minQty,
                        maxQuantity: item.maxQuantity,
                        suggestedOrderQuantity: orderQty
                    });
                }
            }
        }

        this.logger.log(`Min-Max Planning completed for Org ${organizationId}. Generated ${replenishmentSuggestions.length} suggestions.`);
        return replenishmentSuggestions;
    }
}
