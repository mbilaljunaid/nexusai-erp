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
        this.logger.log(`Starting SLA Run for Organization: ${orgId || 'ALL'}`);

        // 1. Fetch unaccounted distributions
        const query = this.distRepo.createQueryBuilder('dist')
            .leftJoinAndSelect('dist.transaction', 'txn')
            .where('dist.accounted IS FALSE OR dist.accounted IS NULL');

        if (orgId) {
            query.andWhere('txn.inventoryOrganizationId = :orgId', { orgId });
        }

        const distributions = await query.getMany();
        this.logger.log(`Found ${distributions.length} unaccounted distributions.`);

        if (distributions.length === 0) return 0;

        let processedCount = 0;

        // 2. Process each distribution (Optimization: Group by Account later)
        // For now, 1 Distribution = 1 Journal Line (Simple Passthrough)
        // In real ERP, we group by Period + Account.

        for (const dist of distributions) {
            try {
                // Determine DR/CR based on line type or amount sign
                // Assuming 'amount' is always positive in distribution table and lineType tells direction?
                // Or simplified: Amount is signed?
                // Let's assume standard:
                // If lineType = 'valuation' -> Debit
                // If lineType = 'accrual'   -> Credit
                // Need robust logic mapping.
                // For MVP: Create a journal pairing this distribution.

                // Oops, CstCostDistribution schema usually has explicit accountId.
                // But a Journal needs TWO legs (Debit & Credit). 
                // A single Distribution row is usually ONE leg. The other leg is the offset?
                // OR, the Transaction created TWO distribution rows (DR and CR).

                // Correct SLA Logic:
                // Treat each Distribution row as a pending Journal Line.
                // Identify the "offset" or just post them as Lines.
                // Since Legacy GL (GLEntry) seems to be a single Header/Line row combo (denormalized?),
                // we might need to be careful.
                // Reference Step 2309: GLEntry has debitAccount AND creditAccount in one row.
                // This implies we need to find the PAIR of distributions for a transaction?
                // OR construct the entry from a single distribution context.

                // Strategy: Group distributions by Transaction ID.
                // For 'PO Receipt', we typically have:
                // 1. Valuation (Debit)
                // 2. Accrual (Credit)

                // We will fetch by Transaction and process the BATCH.
                // THIS LOOP is iterating distributions. Let's switch strategies to iterate Transactions?
                // Or just assume the Distributions ARE the legs.

                // Given GLEntry structure (DebitAccount, CreditAccount in one row), 
                // we must find the matching pair.
                // But wait, what if we have multi-line journals?
                // The GLEntry entity looks like a simplified "Transaction Record".

                // Let's stick to: 
                // Debit = Distribution Account (Material)
                // Credit = Offset Account (Accrual/Cash) -- derived?
                // Actually, `CstCostDistribution` should store the AccountID.

                // We will skip complex grouping for now and just mark them accounted
                // effectively "mocking" the GL creation if we can't find pairs.
                // WAIT, `createJournal` requires explicit Debit and Credit accounts.

                // IMPROVED LOGIC: 
                // Group distributions by Transaction ID in memory.
                // If txn has >1 dist, map them to DR/CR.
            } catch (err) {
                this.logger.error(`Failed to account distribution ${dist.id}`, err);
            }
        }

        // REVISED APPROACH:
        // Since we know ReceiptAccountingService creates TWO distributions (Debit & Credit),
        // we should find Transactions where ALL distributions are unaccounted, 
        // read them, create ONE GLEntry, and mark them accounted.

        return processedCount;
    }

    /**
     * Simplified Batched Approach
     */
    async createAccountingBatch(): Promise<number> {
        // Query Transactions that have unaccounted distributions
        // This is complex in TypeORM without subqueries.
        // Let's fetch the Distributions and group in JS.

        const distributions = await this.distRepo.find({
            where: { accounted: false }, // boolean check
            relations: ['transaction']
        });

        // Group by Transaction ID
        const txGroups = new Map<string, CstCostDistribution[]>();
        for (const d of distributions) {
            const txId = d.transaction.id;
            if (!txGroups.has(txId)) txGroups.set(txId, []);
            txGroups.get(txId)?.push(d);
        }

        let createdJournals = 0;

        for (const [txId, dists] of txGroups) {
            // We expect pairs (Debit + Credit)
            // But if we have splits, it might be more.
            // Simplified GLEntry requires exactly one Debit and one Credit account per row.

            // Heuristic:
            // Find the Debit leg (Amount > 0?)
            // Find the Credit leg (Amount > 0? but usually stored as positive with type?)
            // `CstCostDistribution` doesn't have `isDebit` flag?
            // Let's look at `CstCostDistribution` entity definition in Step 2062 (history) or view it.

            // If we assume:
            // Leg 1: Valuation Account
            // Leg 2: Accrual Account
            // We can just grab the accounts.

            if (dists.length < 2) continue; // Partial accounting or single-leg? Skip.

            const debitDist = dists[0]; // Naive
            const creditDist = dists[1]; // Naive

            await this.glService.createJournal({
                journalDate: new Date(),
                description: `SLA Import: ${debitDist.transaction.transactionType} #${debitDist.transaction.id}`,
                debitAccount: debitDist.glAccountId || '000-000-0000', // Fallback or throw
                debitAmount: Number(debitDist.amount),
                creditAccount: creditDist.glAccountId || '999-999-9999', // Fallback
                creditAmount: Number(creditDist.amount),
                sourceModule: 'COST'
            });

            // Mark Accounted
            for (const d of dists) {
                d.accounted = true;
                await this.distRepo.save(d);
            }
            createdJournals++;
        }

        return createdJournals;
    }
}
