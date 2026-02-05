import { Injectable, Logger, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, isNull, or, sql } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';
import { FinanceGlIntegrationService } from '../finance/gl-integration.service';

@Injectable()
export class SlaService {
    private readonly logger = new Logger(SlaService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        @Inject(FinanceGlIntegrationService)
        private readonly glService: FinanceGlIntegrationService
    ) { }

    /**
     * Main SLA Engine Run
     * Transforms unaccounted Cost Distributions into GL Journals.
     */
    async createAccounting(orgId?: string): Promise<number> {
        // Query Transactions that have unaccounted distributions
        // Using Drizzle Query Builder

        // 1. Fetch Eligible Distributions
        // We do a simple fetch. For high volume, we'd use keyset pagination.
        const BATCH_SIZE = 2000;

        /* 
         Query: Select * from cst_cost_distributions 
         where accounted IS NULL or accounted = false
         limit BATCH_SIZE
        */

        let processedCount = 0;

        // Loop not really needed for this consolidation step if we assume one run,
        // but let's keep it simple: Just do one batch.

        const distributions = await this.db.select().from(schema.cstCostDistributions)
            .where(or(isNull(schema.cstCostDistributions.accounted), eq(schema.cstCostDistributions.accounted, false)))
            .limit(BATCH_SIZE);

        if (distributions.length === 0) return 0;

        // Group by Transaction ID
        const txGroups = new Map<string, typeof schema.cstCostDistributions.$inferSelect[]>();
        for (const d of distributions) {
            const txId = d.transactionId;
            if (!txId) continue;
            if (!txGroups.has(txId)) txGroups.set(txId, []);
            txGroups.get(txId)?.push(d);
        }

        // Process each Group Atomically
        for (const [txId, dists] of txGroups) {
            await this.db.transaction(async (tx) => {
                const debitDist = dists.find(d => Number(d.amount) > 0);
                const creditDist = dists.find(d => Number(d.amount) < 0) || dists[1];

                // Create Journal (Atomic with status update)
                // Note: We need transaction Type for description. 
                // We'd arguably need to join with InventoryTransactions or CostTransactions.
                // For now, using generic description.

                await this.glService.createJournal({
                    journalDate: new Date(),
                    description: `SLA: Transaction #${txId}`,
                    debitAccount: '120.01.000', // Mock Inventory Asset
                    debitAmount: debitDist ? Math.abs(Number(debitDist.amount)) : 0,
                    creditAccount: '210.01.000', // Mock Accrual
                    creditAmount: creditDist ? Math.abs(Number(creditDist.amount)) : 0,
                    sourceModule: 'COST'
                }, tx);

                // Mark Accounted
                for (const d of dists) {
                    await tx.update(schema.cstCostDistributions)
                        .set({ accounted: true })
                        .where(eq(schema.cstCostDistributions.id, d.id));
                }
            });
            processedCount++;
        }

        this.logger.log(`Created Accounting for ${processedCount} transactions...`);
        return processedCount;
    }
}
