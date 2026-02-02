import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CycleCountHeader, CycleCountEntry } from './entities/cycle-count.entity';
import { InventoryOrganization } from './entities/inventory-organization.entity';
import { OnHandBalance } from './entities/on-hand-balance.entity';
import { InventoryTransactionService } from './inventory-transaction.service';
import { Subinventory } from './entities/subinventory.entity';

@Injectable()
export class CycleCountService {
    private readonly logger = new Logger(CycleCountService.name);

    constructor(
        @InjectRepository(CycleCountHeader)
        private headerRepo: Repository<CycleCountHeader>,
        @InjectRepository(CycleCountEntry)
        private entryRepo: Repository<CycleCountEntry>,
        @InjectRepository(OnHandBalance)
        private balanceRepo: Repository<OnHandBalance>,
        private dataSource: DataSource,
        private readonly invTxnService: InventoryTransactionService
    ) { }

    async createCycleCount(orgId: string, name: string, subinvId?: string): Promise<CycleCountHeader> {
        return this.dataSource.transaction(async (manager) => {
            // 1. Create Header
            const header = new CycleCountHeader();
            header.organization = { id: orgId } as InventoryOrganization;
            header.cycleCountName = name;
            if (subinvId) header.subinventory = { id: subinvId } as Subinventory;
            header.status = 'Draft';
            const savedHeader = await manager.save(header);

            // 2. Generate Snapshot (Entries)
            // Query OnHandBalance to find items in scope
            const query = this.balanceRepo.createQueryBuilder('b')
                .leftJoinAndSelect('b.item', 'item')
                .leftJoinAndSelect('b.subinventory', 'sub')
                .leftJoinAndSelect('b.locator', 'loc')
                .where('b.organizationId = :orgId', { orgId });

            if (subinvId) {
                query.andWhere('b.subinventoryId = :subinvId', { subinvId });
            }

            // Exclude zero balances? Usually yes for cycle count, but for physical inventory we might want all.
            // Let's exclude strictly 0 for now to keep it clean.
            query.andWhere('b.quantity > 0');

            const balances = await query.getMany();

            const entries: CycleCountEntry[] = [];
            for (const balance of balances) {
                const entry = new CycleCountEntry();
                entry.header = savedHeader;
                entry.item = balance.item;
                entry.subinventory = balance.subinventory;
                entry.locator = balance.locator;
                entry.systemQuantity = balance.quantity;
                entry.status = 'Pending';
                entries.push(entry);
            }

            await manager.save(CycleCountEntry, entries);

            header.status = 'InProgress';
            await manager.save(header);

            return header;
        });
    }

    async recordCount(entryId: string, countedQty: number): Promise<CycleCountEntry> {
        const entry = await this.entryRepo.findOne({ where: { id: entryId } });
        if (!entry) throw new NotFoundException('Entry not found');

        entry.countedQuantity = countedQty;
        entry.status = 'Counted';
        return this.entryRepo.save(entry);
    }

    async approveAdjustment(headerId: string): Promise<void> {
        // Find all counted entries with variance
        const entries = await this.entryRepo.find({
            where: { header: { id: headerId }, status: 'Counted' },
            relations: ['item', 'subinventory', 'locator', 'header', 'header.organization']
        });

        for (const entry of entries) {
            const variance = Number(entry.countedQuantity) - Number(entry.systemQuantity);

            if (variance !== 0) {
                // Post Adjustment Transaction
                const txnType = variance > 0 ? 'Misc Receipt' : 'Misc Issue';
                const absQty = Math.abs(variance);

                await this.invTxnService.executeTransaction({
                    organizationId: entry.header.organization.id,
                    itemId: entry.item.id,
                    transactionType: txnType,
                    quantity: variance, // Transaction Service handles sign logic, but usually expects specific sign.
                    // My Impl: "Receipts = Positive, Issues = Negative"
                    // If variance is +5 (Found more), we need +5 Receipt. Correct.
                    // If variance is -5 (Lost), we need -5 Issue. Correct.
                    // IMPORTANT: My service might expect ABSOLUTE for 'Misc Issue' and negate it?
                    // Let's check logic: 
                    // "Receipts = Positive, Issues = Negative"
                    // "quantity = dto.quantity"
                    // So passing -5 for 'Misc Issue' is correct if I didn't enforce absolute check.
                    // Re-reading service code: "let quantity = dto.quantity;" -> It trusts input.
                    // So passing raw variance is correct.

                    subinventoryId: entry.subinventory.id,
                    locatorId: entry.locator?.id,
                    reference: `Cycle Count Adj: ${entry.header.cycleCountName}`,
                    sourceDocumentType: 'CycleCount',
                    sourceDocumentId: entry.header.id
                });

                entry.status = 'Adjusted';
                await this.entryRepo.save(entry);
            }
        }

        await this.headerRepo.update(headerId, { status: 'Completed' });
    }
}
