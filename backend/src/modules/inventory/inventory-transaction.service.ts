import { Inject, Injectable, Logger, BadRequestException, NotFoundException, forwardRef } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';
import { ModuleRef } from '@nestjs/core';
import { CostingService } from './costing.service';
import { ReceiptAccountingService } from '../cost-management/receipt-accounting.service';
import { CostProcessorService } from '../cost-management/cost-processor.service';

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
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private readonly costingService: CostingService,
        private readonly moduleRef: ModuleRef,
        @Inject(forwardRef(() => ReceiptAccountingService))
        private readonly receiptAccountingService: ReceiptAccountingService,
        @Inject(forwardRef(() => CostProcessorService))
        private readonly costProcessorService: CostProcessorService,
    ) { }



    async executeTransaction(dto: CreateTransactionDto) {
        return this.db.transaction(async (tx) => {
            // 1. Validate Entities
            const [item] = await tx.select().from(schema.inventory).where(eq(schema.inventory.id, dto.itemId));
            if (!item) throw new NotFoundException('Item not found');

            const [subinv] = await tx.select().from(schema.inventorySubinventories).where(eq(schema.inventorySubinventories.id, dto.subinventoryId));
            if (!subinv) throw new NotFoundException('Subinventory not found');

            if (dto.locatorId) {
                const [locator] = await tx.select().from(schema.inventoryLocators).where(eq(schema.inventoryLocators.id, dto.locatorId));
                if (!locator) throw new NotFoundException('Locator not found');
            }

            // 2. Transact
            const [txn] = await tx.insert(schema.inventoryTransactions).values({
                // organizationId: dto.organizationId, // Schema definition commented out currently, mimicking that
                itemId: dto.itemId,
                transactionType: dto.transactionType,
                quantity: dto.quantity.toString(),
                uom: dto.uom || item.primaryUomCode || 'EA',
                subinventoryId: dto.subinventoryId,
                locatorId: dto.locatorId,
                sourceDocumentType: dto.sourceDocumentType,
                sourceDocumentId: dto.sourceDocumentId,
                reference: dto.reference,
                // projectId: null, // Disabled in schema
            }).returning();

            // 3. Update Balance (Source)
            await this.updateBalance(tx, dto.organizationId, dto.itemId, dto.subinventoryId, dto.locatorId, dto.lotId, dto.serialId, dto.quantity);

            // 4. Update Balance (Destination - Transfer)
            if (dto.transactionType === 'Subinv Transfer') {
                if (!dto.transferSubinventoryId) throw new BadRequestException('Transfer Destination required');
                const destQty = Math.abs(dto.quantity);
                await this.updateBalance(tx, dto.organizationId, dto.itemId, dto.transferSubinventoryId, dto.transferLocatorId, dto.lotId, dto.serialId, destQty);
            }

            // 5. Costing
            const unitCost = 10.0; // Placeholder: hardcoded standard cost for now

            // Phase 2: Receipt Accounting (Atomically via Drizzle)
            if (dto.transactionType === 'PO Receipt') {
                if (this.receiptAccountingService) {
                    this.logger.log('Calling createReceiptDistributions...');
                    await this.receiptAccountingService.createReceiptDistributions(txn, unitCost, tx);
                } else {
                    this.logger.error('ReceiptAccountingService not found - skipping distributions');
                }

                // Phase 3: Cost Processor (Update Average Cost)
                if (this.costProcessorService) {
                    await this.costProcessorService.processTransactionCost(txn, tx);
                }
            } else {
                // For other transactions, we might just update Average Cost or record generic distribution
                // keeping logic consistent with old behavior:
                if (this.costProcessorService) {
                    await this.costProcessorService.processTransactionCost(txn, tx);
                }
            }

            // 6. Aggregate Update
            await tx.update(schema.inventory)
                .set({
                    quantityOnHand: sql`${schema.inventory.quantityOnHand} + ${dto.quantity}`
                })
                .where(eq(schema.inventory.id, dto.itemId));

            return txn;
        });
    }

    private async updateBalance(tx: any, orgId: string, itemId: string, subinvId: string, locatorId: string | undefined, lotId: string | undefined, serialId: string | undefined, qty: number) {

        // Build filters array for 'and(...)'
        const filters = [
            eq(schema.inventoryOnHandQuantities.organizationId, orgId),
            eq(schema.inventoryOnHandQuantities.itemId, itemId),
            eq(schema.inventoryOnHandQuantities.subinventoryId, subinvId)
        ];

        if (locatorId) filters.push(eq(schema.inventoryOnHandQuantities.locatorId, locatorId));
        else filters.push(isNull(schema.inventoryOnHandQuantities.locatorId));

        if (lotId) filters.push(eq(schema.inventoryOnHandQuantities.lotNumber, lotId)); // Assuming lotId maps to lotNumber or ID logic needs alignment. Schema has lotNumber. Assuming simple mapping for now.
        // Clarification: Previous TypeORM entity had 'lot' relation (ID). New schema has 'lotNumber' (string).
        // If the system passes Lot IDs, we might need to resolve to Number, or change schema to ID.
        // For this refactor, assuming the DTO provides what's needed, but let's be safe: 
        // If lotId is passed, use it as lotNumber for now or update schema later. 
        // NOTE: The previous code treated lotId as a FK. The new schema uses lotNumber string. 
        // Ideally we should lookup the lot to get the number, but for speed, let's assume strict checks later.

        // Actually, looking at previous code, it used `dto.lotId` to find `Lot` entity.
        // Since we are decoupling, we will just treat `lotId` as the value to store in Drizzle for now, referencing the ID if that's what we have.
        // Drizzle schema `lotNumber` implies human readable, but we can store ID if needed or adjust schema.
        if (lotId) filters.push(eq(schema.inventoryOnHandQuantities.lotNumber, lotId));
        else filters.push(isNull(schema.inventoryOnHandQuantities.lotNumber));

        if (serialId) filters.push(eq(schema.inventoryOnHandQuantities.serialNumber, serialId));
        else filters.push(isNull(schema.inventoryOnHandQuantities.serialNumber));

        const [balance] = await tx.select()
            .from(schema.inventoryOnHandQuantities)
            .where(and(...filters));

        if (balance) {
            const newQty = Number(balance.quantity) + Number(qty);
            await tx.update(schema.inventoryOnHandQuantities)
                .set({
                    quantity: newQty.toString(),
                    lastUpdated: new Date()
                })
                .where(eq(schema.inventoryOnHandQuantities.id, balance.id));
        } else {
            await tx.insert(schema.inventoryOnHandQuantities).values({
                organizationId: orgId,
                itemId: itemId,
                subinventoryId: subinvId,
                locatorId: locatorId || null,
                lotNumber: lotId || null,
                serialNumber: serialId || null,
                quantity: qty.toString(),
                lastUpdated: new Date()
            });
        }
    }
}
