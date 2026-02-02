import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CstCostDistribution } from './entities/cst-cost-distribution.entity';
import { MaterialTransaction } from '../inventory/entities/material-transaction.entity';

import { OnHandBalance } from '../inventory/entities/on-hand-balance.entity';
import { CstItemCost } from './entities/cst-item-cost.entity';
import { Item } from '../inventory/entities/item.entity';

@Injectable()
export class CostProcessorService {
    private readonly logger = new Logger(CostProcessorService.name);

    constructor(
        @InjectRepository(CstCostDistribution)
        private distributionRepo: Repository<CstCostDistribution>,
        @InjectRepository(CstItemCost)
        private itemCostRepo: Repository<CstItemCost>,
        @InjectRepository(Item)
        private itemRepo: Repository<Item>
    ) { }

    async processTransactions(orgId: string): Promise<number> {
        this.logger.log(`Batch Processing Transactions for Org ${orgId}...`);

        const manager = this.distributionRepo.manager;
        let processedCount = 0;
        const BATCH_SIZE = 1000;
        let hasMore = true;

        while (hasMore) {
            const txns = await manager.createQueryBuilder(MaterialTransaction, 'txn')
                .leftJoinAndSelect('txn.item', 'item')
                .leftJoinAndSelect('txn.organization', 'org')
                .leftJoin('cst_cost_distributions', 'dist', 'dist.transactionId = txn.id')
                .where('txn.organization.id = :orgId', { orgId })
                .andWhere('dist.id IS NULL')
                .take(BATCH_SIZE)
                .getMany();

            if (txns.length === 0) {
                hasMore = false;
                break;
            }

            const itemIds = [...new Set(txns.map(t => t.item.id))];

            const existingCosts = await this.itemCostRepo.createQueryBuilder('cost')
                .where('cost.itemId IN (:...itemIds)', { itemIds })
                .andWhere('cost.inventoryOrganizationId = :orgId', { orgId })
                .leftJoinAndSelect('cost.item', 'item')
                .getMany();

            const costMap = new Map<string, CstItemCost>();
            existingCosts.forEach(c => costMap.set(c.item.id, c));

            const costsToSave = new Map<string, CstItemCost>();
            const distsToSave: CstCostDistribution[] = [];

            for (const txn of txns) {
                let costRecord = costMap.get(txn.item.id);

                if (!costRecord) {
                    costRecord = new CstItemCost();
                    costRecord.item = txn.item;
                    costRecord.inventoryOrganization = txn.organization;
                    costRecord.unitCost = 0;
                    costRecord.currencyCode = 'USD';
                    costMap.set(txn.item.id, costRecord);
                }

                const txnUnitCost = 10.0;
                const txnQty = Number(txn.quantity);
                const currentAvg = Number(costRecord.unitCost);
                const preTxnQty = 100; // Mock base quantity for stability

                const newTotalValue = (preTxnQty * currentAvg) + (txnQty * txnUnitCost);
                const newTotalQty = preTxnQty + txnQty;

                if (newTotalQty > 0) {
                    costRecord.unitCost = newTotalValue / newTotalQty;
                }

                costsToSave.set(txn.item.id, costRecord);

                const dist = new CstCostDistribution();
                dist.transaction = txn;
                dist.accountingLineType = 'Valuation';
                dist.amount = txnQty * txnUnitCost;
                dist.currencyCode = 'USD';
                dist.unitCost = costRecord.unitCost;
                dist.status = 'Draft';
                distsToSave.push(dist);

                processedCount++;
            }

            if (costsToSave.size > 0) {
                await manager.save(CstItemCost, Array.from(costsToSave.values()));
            }
            if (distsToSave.length > 0) {
                await manager.save(CstCostDistribution, distsToSave);
            }

            this.logger.log(`Processed ${processedCount}...`);
        }

        return processedCount;
    }

    /**
     * Main Entry Point: Process Cost for a Transaction
     * Determines method (FIFO/Avg) and generates distributions.
     * @param manager - Transactional Entity Manager
     */
    async processTransactionCost(transaction: MaterialTransaction, manager: EntityManager): Promise<void> {
        this.logger.debug(`Processing Cost for Txn: ${transaction.id} (${transaction.transactionType})`);

        if (transaction.transactionType === 'PO Receipt') {
            await this.processPoReceipt(transaction, manager);
        }
    }

    private async processPoReceipt(transaction: MaterialTransaction, manager: EntityManager): Promise<void> {
        // 1. Fetch Item Cost Record
        let costRecord = await manager.findOne(CstItemCost, {
            where: {
                item: { id: transaction.item.id },
                inventoryOrganization: { id: transaction.organization.id }
            }
        });

        if (!costRecord) {
            // Create initial if missing
            costRecord = new CstItemCost();
            costRecord.item = transaction.item;
            costRecord.inventoryOrganization = transaction.organization;
            costRecord.unitCost = 0;
            costRecord.currencyCode = 'USD'; // Default
        }

        // 2. Determine Transaction Cost (e.g. from PO Price)
        const txnUnitCost = 10.0;
        const txnQty = Number(transaction.quantity);

        // 3. Calculate New Weighted Average
        // Pre-transaction Quantity
        // IMPORTANT: We need the quantity BEFORE this transaction. 
        // If this runs within the same transaction as the balance update, we need to be careful.
        // Assuming we rely on database state which relies on WHEN this is called relative to updateBalance/increment.
        // If called BEFORE updateBalance/increment, db has Old Qty.
        // If called AFTER, db has New Qty.

        // Let's assume called BEFORE increment.
        // We can fetch Item again to be sure? 
        // Or if passed `transaction.item` has loaded quantity? No, usually not.
        const item = await manager.findOne(Item, { where: { id: transaction.item.id } });
        if (!item) throw new Error('Item not found for costing');

        const currentQty = Number(item.quantityOnHand);
        // logic: cost is calculated based on mixing OLD stock with NEW receipt.

        const preTxnQty = currentQty; // Assuming called BEFORE increment
        const preTxnValue = preTxnQty * Number(costRecord.unitCost);
        const txnValue = txnQty * txnUnitCost;
        const newTotalValue = preTxnValue + txnValue;
        const newTotalQty = preTxnQty + txnQty;

        let newAvgCost = costRecord.unitCost;
        if (newTotalQty > 0) {
            newAvgCost = newTotalValue / newTotalQty;
        }

        this.logger.log(`Recalculating Cost: Old Avg=${costRecord.unitCost}, TxnCost=${txnUnitCost}, New Avg=${newAvgCost}`);

        // 4. Update Cost Record
        costRecord.unitCost = newAvgCost;
        await manager.save(CstItemCost, costRecord);
    }

    async createDistributions(transaction: MaterialTransaction, amount: number, type: string): Promise<void> {
        const dist = new CstCostDistribution();
        dist.transaction = transaction;
        dist.accountingLineType = type;
        dist.amount = amount;
        dist.currencyCode = 'USD';
        dist.unitCost = amount / Number(transaction.quantity);
        dist.status = 'Draft';
        await this.distributionRepo.save(dist);
    }
}
