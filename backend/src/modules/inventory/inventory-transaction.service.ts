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
        private readonly costingService: CostingService
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
            // Use manager to save cost record to ensure it rolls back if txn fails.
            const unitCost = 10.0; // Placeholder: Fetch from Item Cost or Source Doc
            const costRecord = new CstTransactionCost();
            costRecord.organization = txn.organization;
            costRecord.item = txn.item;
            costRecord.transaction = txn;
            costRecord.costMethod = 'Standard';
            costRecord.unitCost = unitCost;
            costRecord.totalCost = Number(txn.quantity) * unitCost;
            costRecord.quantityRemaining = Number(txn.quantity) > 0 ? Number(txn.quantity) : 0;
            await manager.save(CstTransactionCost, costRecord);

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
