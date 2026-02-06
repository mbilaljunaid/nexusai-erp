import { Inject, Injectable, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

@Injectable()
export class CostProcessorService {
    private readonly logger = new Logger(CostProcessorService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>
    ) { }

    /**
     * Main Entry Point: Process Cost for a Transaction
     * Determines method (FIFO/Avg) and generates distributions.
     * @param transaction - The transaction record (Drizzle result)
     * @param tx - The active Drizzle transaction scope
     */
    async processTransactionCost(transaction: typeof schema.inventoryTransactions.$inferSelect, tx: any): Promise<void> {
        this.logger.debug(`Processing Cost for Txn: ${transaction.id} (${transaction.transactionType})`);

        if (transaction.transactionType === 'PO Receipt') {
            await this.processPoReceipt(transaction, tx);
        }
    }

    private async processPoReceipt(transaction: typeof schema.inventoryTransactions.$inferSelect, tx: any): Promise<void> {
        // 1. Fetch Subinventory to get OrgId (since transaction record might lack it in runtime object depending on fetch strategy)
        // Optimally, we should have orgId on transaction.
        // Let's try to lookup subinventory if needed.
        let orgId = 'TODO_ORG_ID';

        if (transaction.subinventoryId) {
            const [subinv] = await tx.select().from(schema.inventorySubinventories).where(eq(schema.inventorySubinventories.id, transaction.subinventoryId));
            if (subinv) orgId = subinv.organizationId;
        }

        // 1. Fetch Item Cost Record
        const [costRecord] = await tx.select().from(schema.cstItemCosts)
            .where(and(
                eq(schema.cstItemCosts.itemId, transaction.itemId),
                eq(schema.cstItemCosts.inventoryOrganizationId, orgId)
            ));

        let currentRecord = costRecord;

        if (!currentRecord) {
            // Create initial if missing stub
            const [inserted] = await tx.insert(schema.cstItemCosts).values({
                itemId: transaction.itemId,
                inventoryOrganizationId: orgId,
                costBookId: 'PRIMARY', // Placeholder
                unitCost: '0',
                currencyCode: 'USD'
            }).returning();
            currentRecord = inserted;
        }

        // 2. Determine Transaction Cost (e.g. from PO Price)
        // Hardcoded for now as Source Doc lookup (PO) is separate migration
        const txnUnitCost = 10.0;
        const txnQty = Number(transaction.quantity);

        // 3. Calculate New Weighted Average
        // Fetch current Qty (Inventory Table)
        const [item] = await tx.select().from(schema.inventory).where(eq(schema.inventory.id, transaction.itemId));
        if (!item) throw new Error('Item not found for costing');

        const currentQty = Number(item.quantityOnHand || 0);

        // Average Cost Calculation
        // NewAvg = (OldValue + TxnValue) / (OldQty + TxnQty)
        // Note: currentQty might include this txn if update happened before. Assuming it does NOT for strict sequence, or we adjust.
        // Standard Oracle flow: Costing happens AFTER on-hand update.
        // So currentQty INCLUDES txnQty.
        // Thus PreTxnQty = currentQty - txnQty.

        const preTxnQty = currentQty - txnQty;
        // Guard against negative if out of order
        const safePreTxnQty = Math.max(0, preTxnQty);

        const preTxnValue = safePreTxnQty * Number(currentRecord.unitCost);
        const txnValue = txnQty * txnUnitCost;
        const newTotalValue = preTxnValue + txnValue;
        const newTotalQty = safePreTxnQty + txnQty;

        let newAvgCost = Number(currentRecord.unitCost);
        if (newTotalQty > 0) {
            newAvgCost = newTotalValue / newTotalQty;
        }

        this.logger.log(`Recalculating Cost: Old Avg=${currentRecord.unitCost}, TxnCost=${txnUnitCost}, New Avg=${newAvgCost.toFixed(4)}`);

        // 4. Update Cost Record
        await tx.update(schema.cstItemCosts)
            .set({
                unitCost: newAvgCost.toString(),
                updatedAt: new Date()
            })
            .where(eq(schema.cstItemCosts.id, currentRecord.id));
    }
}
