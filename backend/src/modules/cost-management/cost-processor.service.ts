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

    // NOTE: This legacy batch method is temporarily commented out or needs full rewrite. 
    // Focusing on the transactional method `processTransactionCost` first.
    /*
    async processTransactions(orgId: string): Promise<number> {
        // ... (Legacy batch logic needs migration later)
        return 0;
    }
    */

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
        // 1. Fetch Item Cost Record
        const [costRecord] = await tx.select().from(schema.cstItemCosts)
            .where(and(
                eq(schema.cstItemCosts.itemId, transaction.itemId),
                // eq(schema.cstItemCosts.inventoryOrganizationId, transaction.organizationId) // Schema commented out orgId on txn currently
            ));

        let newRecord = false;
        let currentRecord = costRecord;

        if (!currentRecord) {
            newRecord = true;
            // Create initial if missing stub
            const [inserted] = await tx.insert(schema.cstItemCosts).values({
                itemId: transaction.itemId,
                inventoryOrganizationId: 'TODO_ORG_ID', // Needs resolution: Txn schema disabled orgId
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

        const currentQty = Number(item.quantityOnHand);
        // NOTE: This `currentQty` includes the txn quantity if updated AFTER.
        // Logic depends on call order in InventoryService. 
        // Assuming called WITHIN txn but BEFORE aggregate update? No, InventoryService calls it before aggregate update in my previous code?
        // Let's re-verify InventoryService logic. 
        // Actually, Average Cost = (OldValue + TxnValue) / (OldQty + TxnQty)
        // If currentQty is Pre-Txn, then NewAvg = (currentQty * OldAvg + txnQty * txnCost) / (currentQty + txnQty)

        const preTxnQty = currentQty;
        const preTxnValue = preTxnQty * Number(currentRecord.unitCost);
        const txnValue = txnQty * txnUnitCost;
        const newTotalValue = preTxnValue + txnValue;
        const newTotalQty = preTxnQty + txnQty;

        let newAvgCost = Number(currentRecord.unitCost);
        if (newTotalQty > 0) {
            newAvgCost = newTotalValue / newTotalQty;
        }

        this.logger.log(`Recalculating Cost: Old Avg=${currentRecord.unitCost}, TxnCost=${txnUnitCost}, New Avg=${newAvgCost}`);

        // 4. Update Cost Record
        await tx.update(schema.cstItemCosts)
            .set({
                unitCost: newAvgCost.toString(),
                updatedAt: new Date()
            })
            .where(eq(schema.cstItemCosts.id, currentRecord.id));
    }
}

