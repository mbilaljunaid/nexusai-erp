import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CstTransactionCost } from './entities/cst-transaction-cost.entity';
import { MaterialTransaction } from './entities/material-transaction.entity';
import { InventoryOrganization } from './entities/inventory-organization.entity';
import { Item } from './entities/item.entity';

@Injectable()
export class CostingService {
    private readonly logger = new Logger(CostingService.name);

    constructor(
        @InjectRepository(CstTransactionCost)
        private costRepo: Repository<CstTransactionCost>,
    ) { }

    async processTransaction(txn: MaterialTransaction): Promise<void> {
        // Simplified Logic: 
        // 1. If Receipt (Positive Qty): Create Cost Layer.
        //    For MVP, assuming 'Standard Cost' or 'PO Price' passed in reference or lookup.
        //    In a real system, we'd lookup PO Line Price.
        // 2. If Issue (Negative Qty): Consume Layers (FIFO) or use Weighted Average.

        // MVP: Weighted Average Cost (WAC) Logic
        // But for this step, let's just record the transaction cost.
        // We need a way to know the INCOMING cost.
        // Let's assume a default cost of 10.00 if unknown, or extract from source doc later.

        const unitCost = 10.0; // Placeholder: Fetch from Item Cost or PO

        const costRecord = new CstTransactionCost();
        costRecord.organization = txn.organization;
        costRecord.item = txn.item;
        costRecord.transaction = txn;
        costRecord.costMethod = 'Standard'; // Default
        costRecord.unitCost = unitCost;
        costRecord.totalCost = Number(txn.quantity) * unitCost;
        costRecord.quantityRemaining = Number(txn.quantity) > 0 ? Number(txn.quantity) : 0;

        await this.costRepo.save(costRecord);
        this.logger.log(`Costed Transaction ${txn.id} at ${unitCost}/unit`);
    }
}
