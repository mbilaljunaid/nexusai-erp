
import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class WipCostingService {
    private readonly logger = new Logger(WipCostingService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    async processMaterialIssue(woId: string, itemId: string, quantity: number): Promise<typeof schema.productionTransactions.$inferSelect> {
        return this.db.transaction(async (tx) => {
            const wo = await tx.query.productionOrders.findFirst({
                where: eq(schema.productionOrders.id, woId)
            });
            if (!wo) throw new NotFoundException('Work Order not found');

            // 1. Get Standard Cost for Component Item
            // Simplified: Fetching latest active standard cost for this item.
            // Assumption: we are using the item ID as target_id and type is ITEM
            const stdCost = await tx.query.standardCosts.findFirst({
                where: and(
                    eq(schema.standardCosts.targetId, itemId),
                    eq(schema.standardCosts.targetType, 'ITEM'),
                    eq(schema.standardCosts.isActive, true)
                )
            });

            const unitCost = stdCost ? Number(stdCost.unitCost) : 0;
            const totalCost = unitCost * quantity;

            // 2. Create WIP Transaction (Production Transaction)
            const [txn] = await tx.insert(schema.productionTransactions).values({
                productionOrderId: wo.id,
                transactionType: 'ISSUE', // Material Issue
                productId: itemId,
                quantity: quantity.toString(),
                actualCost: totalCost.toString(),
                // resourceId: null,
                createdBy: 'SYSTEM'
            }).returning();

            this.logger.log(`WIP Material Issue: WO ${wo.orderNumber}, Item ${itemId}, Qty ${quantity} @ ${unitCost} = ${totalCost}`);
            return txn;
        });
    }

    async processResourceCharge(woId: string, resourceId: string, hours: number, rate: number): Promise<typeof schema.productionTransactions.$inferSelect> {
        return this.db.transaction(async (tx) => {
            const wo = await tx.query.productionOrders.findFirst({
                where: eq(schema.productionOrders.id, woId)
            });
            if (!wo) throw new NotFoundException('Work Order not found');

            const totalCost = hours * rate;

            const [txn] = await tx.insert(schema.productionTransactions).values({
                productionOrderId: wo.id,
                transactionType: 'RESOURCE_CHARGE',
                quantity: hours.toString(),
                actualCost: totalCost.toString(),
                resourceId: resourceId,
                createdBy: 'SYSTEM'
            }).returning();

            this.logger.log(`WIP Resource Charge: WO ${wo.orderNumber}, ${hours} hrs @ ${rate} = ${totalCost}`);
            return txn;
        });
    }
}
