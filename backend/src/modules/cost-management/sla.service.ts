import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CstCostDistribution } from './entities/cst-cost-distribution.entity';
import { CstItemCost } from './entities/cst-item-cost.entity';
import { GlIntegrationService } from '../finance/gl-integration.service';

@Injectable()
export class SlaService {
    private readonly logger = new Logger(SlaService.name);

    constructor(
        @InjectRepository(CstCostDistribution)
        private readonly distRepo: Repository<CstCostDistribution>,
        @Inject(GlIntegrationService)
        private readonly glService: GlIntegrationService
    ) { }

    /**
     * Main SLA Engine Run
     * Transforms unaccounted Cost Distributions into GL Journals.
     */
    async createAccounting(orgId?: string): Promise<number> {
        // Query Transactions that have unaccounted distributions
        // We fetch Distributions and group in JS.

        const query = this.distRepo.createQueryBuilder('dist')
            .leftJoinAndSelect('dist.transaction', 'txn')
            .where('dist.accounted IS FALSE OR dist.accounted IS NULL');

        if (orgId) {
            query.andWhere('txn.inventoryOrganizationId = :orgId', { orgId });
        }

        // Batch Fetch? For 100k, we should paginate.
        const BATCH_SIZE = 2000;
        let processedCount = 0;
        let hasMore = true;

        while (hasMore) {
            const distributions = await query.take(BATCH_SIZE).getMany();

            if (distributions.length === 0) {
                hasMore = false;
                break;
            }

            // Group by Transaction ID
            const txGroups = new Map<string, CstCostDistribution[]>();
            for (const d of distributions) {
                const txId = d.transaction.id;
                if (!txGroups.has(txId)) txGroups.set(txId, []);
                txGroups.get(txId)?.push(d);
            }

            for (const [txId, dists] of txGroups) {
                // Determine if we have enough info to create journal
                // Ideally, we need 2 legs.
                // If only 1 leg exists (e.g. Valuation), we might be waiting for Accrual, or it's a single-sided manual adj?
                // For 'PO Receipt', we expect Valuation and Accrual.

                // Logic: 
                // 1. Create Journal Entry
                // 2. Mark Distributions as Accounted

                const debitDist = dists.find(d => Number(d.amount) > 0); // Simplified
                const creditDist = dists.find(d => Number(d.amount) < 0) || dists[1]; // Fallback

                // Ensure amounts are positive for GL Service if it expects ABS?
                // Usually GL Service expects logic.
                // Step 154 (history) suggests createJournal takes debitAmount/creditAmount.

                await this.glService.createJournal({
                    journalDate: new Date(),
                    description: `SLA: ${dists[0].transaction.transactionType} #${txId}`,
                    debitAccount: '120.01.000', // Mock Inventory Asset
                    debitAmount: debitDist ? Math.abs(Number(debitDist.amount)) : 0,
                    creditAccount: '210.01.000', // Mock Accrual
                    creditAmount: creditDist ? Math.abs(Number(creditDist.amount)) : 0,
                    sourceModule: 'COST'
                });

                // Mark Accounted
                for (const d of dists) {
                    d.accounted = true;
                    // Optimization: Bulk update via IDs later?
                    await this.distRepo.save(d);
                }

                processedCount++;
            }

            this.logger.log(`Created Accounting for ${processedCount} transactions...`);
        }

        return processedCount;
    }
}
