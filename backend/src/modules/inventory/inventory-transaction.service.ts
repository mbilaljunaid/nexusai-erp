import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MaterialTransaction } from './entities/material-transaction.entity';
import { OnHandBalance } from './entities/on-hand-balance.entity';
import { Item } from './entities/item.entity';
import { Subinventory } from './entities/subinventory.entity';
import { Locator } from './entities/locator.entity';
import { InventoryOrganization } from './entities/inventory-organization.entity';
import { Lot } from './entities/lot.entity';
import { Serial } from './entities/serial.entity';
import { CstTransactionCost } from './entities/cst-transaction-cost.entity';
import { CostingService } from './costing.service';
import { CmrReceiptDistribution } from '../cost-management/entities/cmr-receipt-distribution.entity';

export interface CreateTransactionDto {
    organizationId: string;
    itemId: string;
    transactionType: 'PO Receipt' | 'Subinv Transfer' | 'Misc Issue' | 'Misc Receipt' | 'Sales Order Issue' | 'Return to Vendor';
    quantity: number;
    uom?: string;
    subinventoryId: string;
    locatorId?: string;
    lotId?: string;
    serialId?: string;
    transferSubinventoryId?: string;
    transferLocatorId?: string;
    sourceDocumentType?: string;
    sourceDocumentId?: string;
    reference?: string;
}

import { ReceiptAccountingService } from '../cost-management/receipt-accounting.service';
import { CostProcessorService } from '../cost-management/cost-processor.service';

@Injectable()
export class InventoryTransactionService {
    private readonly logger = new Logger(InventoryTransactionService.name);

    constructor(
        @InjectRepository(MaterialTransaction)
        private transactionRepo: Repository<MaterialTransaction>,
        @InjectRepository(OnHandBalance)
        private balanceRepo: Repository<OnHandBalance>,
        @InjectRepository(Item)
        private itemRepo: Repository<Item>,
        @InjectRepository(Subinventory)
        private subinvRepo: Repository<Subinventory>,
        private dataSource: DataSource,
        private readonly costingService: CostingService,
        private readonly receiptAccountingService: ReceiptAccountingService,
        private readonly costProcessorService: CostProcessorService
    ) { }

    async executeTransaction(dto: CreateTransactionDto): Promise<MaterialTransaction> {
        return this.dataSource.transaction(async (manager) => {
            // 1. Validate Entities
            const item = await manager.findOne(Item, { where: { id: dto.itemId } });
            if (!item) throw new NotFoundException('Item not found');

            const subinv = await manager.findOne(Subinventory, { where: { id: dto.subinventoryId } });
            if (!subinv) throw new NotFoundException('Subinventory not found');

            let locator: Locator | null = null;
            if (dto.locatorId) {
                locator = await manager.findOne(Locator, { where: { id: dto.locatorId } });
                if (!locator) throw new NotFoundException('Locator not found');
            }

            let lot: Lot | null = null;
            if (dto.lotId) {
                lot = await manager.findOne(Lot, { where: { id: dto.lotId } });
                if (!lot) throw new NotFoundException('Lot not found');
            }

            let serial: Serial | null = null;
            if (dto.serialId) {
                serial = await manager.findOne(Serial, { where: { id: dto.serialId } });
                if (!serial) throw new NotFoundException('Serial not found');
            }

            // 2. Transact
            const txn = new MaterialTransaction();
            txn.organization = { id: dto.organizationId } as InventoryOrganization;
            txn.item = item;
            txn.transactionType = dto.transactionType;
            txn.transactionDate = new Date();
            txn.quantity = dto.quantity;
            txn.uom = dto.uom || item.primaryUomCode || 'EA';
            txn.subinventory = subinv;
            txn.locator = locator || undefined;
            txn.lot = lot || undefined;
            txn.serial = serial || undefined;
            txn.sourceDocumentType = dto.sourceDocumentType;
            txn.sourceDocumentId = dto.sourceDocumentId;
            txn.reference = dto.reference;

            if (dto.transactionType === 'Subinv Transfer') {
                if (!dto.transferSubinventoryId) throw new BadRequestException('Transfer Destination required');
                txn.transferSubinventory = { id: dto.transferSubinventoryId } as Subinventory;
                if (dto.transferLocatorId) txn.transferLocator = { id: dto.transferLocatorId } as Locator;
            }

            await manager.save(txn);

            // 3. Update Balance (Source)
            await this.updateBalance(manager, dto.organizationId, dto.itemId, dto.subinventoryId, dto.locatorId, dto.lotId, dto.serialId, dto.quantity);

            // 4. Update Balance (Destination - Transfer)
            if (dto.transactionType === 'Subinv Transfer') {
                const destQty = Math.abs(dto.quantity);
                await this.updateBalance(manager, dto.organizationId, dto.itemId, dto.transferSubinventoryId!, dto.transferLocatorId, dto.lotId, dto.serialId, destQty);
            }

            // 5. Costing (Inline for Atomicity)
            const unitCost = 10.0; // Placeholder: Fetch from Item Cost or Source Doc

            // Legacy Costing (Keep for now or deprecate?)
            const costRecord = new CstTransactionCost();
            costRecord.organization = txn.organization;
            costRecord.item = txn.item;
            costRecord.transaction = txn;
            costRecord.costMethod = 'Standard';
            costRecord.unitCost = unitCost;
            costRecord.totalCost = Number(txn.quantity) * unitCost;
            costRecord.quantityRemaining = Number(txn.quantity) > 0 ? Number(txn.quantity) : 0;
            await manager.save(CstTransactionCost, costRecord);

            // Phase 2: Receipt Accounting (New)
            if (dto.transactionType === 'PO Receipt') {
                // Must use the services that are aware of the transaction scope? 
                // Wait, injecting the service into this Transactional scope means the service's own repo calls might not be in the same transaction 
                // unless I pass the manager to it. 
                // The current ReceiptAccountingService uses injected Repository, which is outside this transaction manager.
                // For valid atomicity, I should modify ReceiptAccountingService to accept a manager OR manage the distribution creation here.
                // However, TypeORM's declarative transaction (@Transaction) is not used here.
                // Standard NestJS pattern: Reuse the manager.

                // For now, I will call the service assuming it can handle it or I'll just do it after. 
                // But it should be atomic.

                // Let's stick to calling the service, but since I can't easily pass the manager to a standard service method without refactoring it to accept it...
                // I will add a TODO or just call it. If it fails, the main txn rolls back but the service's standalone txn (if any) might persist or fail independently.
                // Actually, if the service just does `repo.save()`, it uses the default connection. It won't wait for this `manager` to commit.
                // It might fail FK check if `txn` is not committed yet!

                // CRITICAL FIX: The `txn` is saved via `manager.save(txn)` at line 98. It is NOT committed yet.
                // If `ReceiptAccountingService` tries to save distributions pointing to `txn.id` using the default connection, 
                // it will fail with FK Violation because `txn` is not visible outside this transaction.

                // SOLUTION: I should instantiate the distribution entity here and save it using `manager`.
                // OR refactor `ReceiptAccountingService` to accept an `EntityManager`.

                // I'll instantiate here for now to ensure atomicity without complex refactoring.
                // Actually I need to import CmrReceiptDistribution here then.
                // To avoid circular dependency or messy imports, I will defer to the service IF I can pass the manager.
                // Let's try to update ReceiptAccountingService to take a manager optionally?
                // Or just write the logic here since it's "embedded" for now?

                // Better approach: Since I already injected the service, I'll use it BUT I need to pass the manager.
                // I'll update the Instruction to include `manager` in the call if I can, or just implement the logic inline as I did with CstTransactionCost for now, 
                // OR calling the service AFTER the transaction logic? No, must be atomic.

                // I'll choose to implement the logic inline here using `manager.save(CmrReceiptDistribution, ...)` 
                // assuming I can import the entity.

                // Wait, I didn't import the entity in the previous step.
                // I'll stick to the existing pattern: Import the entity and use manager.
            }

            // Phase 2: Receipt Accounting (Atomically)
            if (dto.transactionType === 'PO Receipt') {
                const totalAmount = Number(txn.quantity) * unitCost;

                // Debit Inventory
                const dr = new CmrReceiptDistribution();
                dr.transaction = txn;
                dr.accountingLineType = 'Inventory Valuation';
                dr.amount = totalAmount;
                dr.currencyCode = 'USD';
                dr.status = 'Draft';
                await manager.save(CmrReceiptDistribution, dr);

                // Credit Accrual
                const cr = new CmrReceiptDistribution();
                cr.transaction = txn;
                cr.accountingLineType = 'Accrual';
                cr.amount = -totalAmount; // Credit
                cr.currencyCode = 'USD';
                cr.status = 'Draft';
                await manager.save(CmrReceiptDistribution, cr);

                // Phase 3: Cost Processor (Update Average Cost)
                // Called within the transaction manager for atomicity.
                await this.costProcessorService.processTransactionCost(txn, manager);
            }

            // 6. Aggregate Update
            await manager.increment(Item, { id: dto.itemId }, 'quantityOnHand', dto.quantity);

            return txn;
        });
    }

    private async updateBalance(manager: any, orgId: string, itemId: string, subinvId: string, locatorId: string | undefined, lotId: string | undefined, serialId: string | undefined, qty: number) {

        // Build Query with all dimensions
        const query = manager.createQueryBuilder(OnHandBalance, 'b')
            .where('b.organizationId = :orgId', { orgId })
            .andWhere('b.itemId = :itemId', { itemId })
            .andWhere('b.subinventoryId = :subinvId', { subinvId });

        if (locatorId) query.andWhere('b.locatorId = :locatorId', { locatorId });
        else query.andWhere('b.locatorId IS NULL');

        if (lotId) query.andWhere('b.lotId = :lotId', { lotId });
        else query.andWhere('b.lotId IS NULL');

        if (serialId) {
            query.andWhere('b.serialId = :serialId', { serialId });
        } else {
            query.andWhere('b.serialId IS NULL');
        }

        let balance = await query.getOne();

        if (balance) {
            balance.quantity = Number(balance.quantity) + Number(qty);
            await manager.save(balance);
        } else {
            balance = new OnHandBalance();
            balance.organization = { id: orgId } as InventoryOrganization;
            balance.item = { id: itemId } as Item;
            balance.subinventory = { id: subinvId } as Subinventory;
            if (locatorId) balance.locator = { id: locatorId } as Locator;
            if (lotId) balance.lot = { id: lotId } as Lot;
            if (serialId) balance.serial = { id: serialId } as Serial;
            balance.quantity = qty;
            await manager.save(balance);
        }
    }
}
