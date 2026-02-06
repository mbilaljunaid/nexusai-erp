import { Injectable, Logger, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, gt, sql } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema/index.ts';
import { InventoryTransactionService } from './inventory-transaction.service';

@Injectable()
export class CycleCountService {
    private readonly logger = new Logger(CycleCountService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private readonly invTxnService: InventoryTransactionService
    ) { }

    async createCycleCount(orgId: string, name: string, subinvId?: string) {
        return this.db.transaction(async (tx) => {
            // 1. Create Header
            const [header] = await tx.insert(schema.cycleCountHeaders).values({
                organizationId: orgId,
                cycleCountName: name,
                subinventoryId: subinvId,
                status: 'Draft',
            }).returning();

            // 2. Generate Snapshot (Entries)
            // Query OnHandBalance to find items in scope
            const filters = [
                eq(schema.inventoryOnHandQuantities.organizationId, orgId),
                gt(schema.inventoryOnHandQuantities.quantity, '0') // Exclude zero balances
            ];

            if (subinvId) {
                filters.push(eq(schema.inventoryOnHandQuantities.subinventoryId, subinvId));
            }

            const balances = await tx.select().from(schema.inventoryOnHandQuantities).where(and(...filters));

            if (balances.length > 0) {
                const entriesToInsert = balances.map(balance => ({
                    headerId: header.id,
                    itemId: balance.itemId,
                    subinventoryId: balance.subinventoryId,
                    locatorId: balance.locatorId,
                    systemQuantity: balance.quantity,
                    status: 'Pending',
                }));

                await tx.insert(schema.cycleCountEntries).values(entriesToInsert);
            }

            // Update status
            const [updatedHeader] = await tx.update(schema.cycleCountHeaders)
                .set({ status: 'InProgress' })
                .where(eq(schema.cycleCountHeaders.id, header.id))
                .returning();

            return updatedHeader;
        });
    }

    async recordCount(entryId: string, countedQty: number) {
        const [entry] = await this.db.select().from(schema.cycleCountEntries).where(eq(schema.cycleCountEntries.id, entryId));
        if (!entry) throw new NotFoundException('Entry not found');

        const [updatedEntry] = await this.db.update(schema.cycleCountEntries)
            .set({
                countedQuantity: countedQty.toString(),
                status: 'Counted'
            })
            .where(eq(schema.cycleCountEntries.id, entryId))
            .returning();

        return updatedEntry;
    }

    async approveAdjustment(headerId: string): Promise<void> {
        // Find all counted entries with variance
        const entries = await this.db.select()
            .from(schema.cycleCountEntries)
            .where(and(
                eq(schema.cycleCountEntries.headerId, headerId),
                eq(schema.cycleCountEntries.status, 'Counted')
            ));

        // Get header for name
        const [header] = await this.db.select().from(schema.cycleCountHeaders).where(eq(schema.cycleCountHeaders.id, headerId));

        for (const entry of entries) {
            const variance = Number(entry.countedQuantity) - Number(entry.systemQuantity);

            if (variance !== 0) {
                // Post Adjustment Transaction
                const txnType = variance > 0 ? 'Misc Receipt' : 'Misc Issue';

                await this.invTxnService.executeTransaction({
                    organizationId: header.organizationId,
                    itemId: entry.itemId,
                    transactionType: txnType,
                    quantity: variance,
                    subinventoryId: entry.subinventoryId,
                    locatorId: entry.locatorId || undefined,
                    reference: `Cycle Count Adj: ${header.cycleCountName}`,
                    sourceDocumentType: 'CycleCount',
                    sourceDocumentId: header.id
                });

                await this.db.update(schema.cycleCountEntries)
                    .set({ status: 'Adjusted' })
                    .where(eq(schema.cycleCountEntries.id, entry.id));
            }
        }

        await this.db.update(schema.cycleCountHeaders)
            .set({ status: 'Completed' })
            .where(eq(schema.cycleCountHeaders.id, headerId));
    }
}
