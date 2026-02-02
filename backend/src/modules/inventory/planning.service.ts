import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { InventoryOrganization } from './entities/inventory-organization.entity';

@Injectable()
export class PlanningService {
    private readonly logger = new Logger(PlanningService.name);

    constructor(
        @InjectRepository(Item)
        private itemRepo: Repository<Item>,
    ) { }

    async runMinMaxPlanning(organizationId: string): Promise<any[]> {
        // 1. Fetch all items with Min-Max definition in the Org
        // Note: In real world, we check OnHandBalance aggregate, but for MVP we use Item.quantityOnHand 
        // which we are keeping synchronized in InventoryTransactionService.

        const items = await this.itemRepo.find({
            where: { organization: { id: organizationId } }
        });

        const replenishmentSuggestions: any[] = [];

        for (const item of items) {
            // Check if Item is plannable
            if (item.minQuantity !== undefined && item.minQuantity !== null) {
                const onHand = Number(item.quantityOnHand || 0);
                const minQty = Number(item.minQuantity);

                if (onHand < minQty) {
                    // Trigger Replenishment
                    // Calculate Order Qty
                    let orderQty = 0;
                    if (item.maxQuantity) {
                        orderQty = Number(item.maxQuantity) - onHand;
                    } else if (item.reorderQuantity) {
                        orderQty = Number(item.reorderQuantity);
                    } else {
                        // Default to Min Qty delta if no Max/Fixed specified (Simple Restock)
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
        }

        this.logger.log(`Min-Max Planning completed for Org ${organizationId}. Generated ${replenishmentSuggestions.length} suggestions.`);
        return replenishmentSuggestions;
    }
}
