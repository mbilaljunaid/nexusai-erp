
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanUnit } from './entities/plan-unit.entity';
import { PlanVersion } from './entities/plan-version.entity';
import { PlanScenario } from './entities/plan-scenario.entity';
import { GLBalance } from '../finance/entities/gl-balance.entity';

@Injectable()
export class GLIntegrationService {
    private readonly logger = new Logger(GLIntegrationService.name);

    constructor(
        @InjectRepository(PlanUnit)
        private planUnitRepository: Repository<PlanUnit>,
        @InjectRepository(PlanVersion)
        private versionRepository: Repository<PlanVersion>,
        @InjectRepository(PlanScenario)
        private scenarioRepository: Repository<PlanScenario>,
        @InjectRepository(GLBalance)
        private glBalanceRepository: Repository<GLBalance>,
    ) { }

    /**
     * Fetches Actuals from the GL for a specific period and populates the EPM PlanUnit table.
     * @param period YYYY-MM
     * @param ledgerId Ledger from which to source actuals
     */
    async fetchActuals(period: string, ledgerId: string): Promise<number> {
        this.logger.log(`Fetching Actuals from Ledger ${ledgerId} for ${period}...`);

        // 1. Get 'ACTUAL' Scenario and 'WORKING' Version
        const scenario = await this.scenarioRepository.findOneBy({ code: 'ACTUAL' });
        if (!scenario) throw new Error('ACTUAL scenario not found');

        let version = await this.versionRepository.findOne({ where: { scenarioId: scenario.id, code: 'WORKING' } });
        if (!version) {
            this.logger.warn('WORKING version for ACTUAL scenario not found. Creating default...');
            // In a real implementation this might need more robust handling
            version = this.versionRepository.create({
                scenarioId: scenario.id,
                code: 'WORKING',
                name: 'System Actuals'
            });
            await this.versionRepository.save(version);
        }

        // 2. Query GL Balances (Aggregation)
        // Group by Account, Cost Center (Segment2), Entity (Segment1 for now, or Ledger context)
        // Assuming CodeCombination Breakdown: Seg1=Entity, Seg2=Dept, Seg3=Account
        // Ideally we join gl_code_combinations, but for MVP we assume balances has what we need or simplistic mapping.
        // Since GLBalance has `codeCombinationId`, we strictly need the CC breakdown.
        // For MVP Phase 2, let's assume `codeCombinationId` string implies the breakdown or we Mock the join if CC entity is missing in this context.
        // Wait, I didn't create `GLCodeCombination` entity in Finance module yet.
        // Let's modify the query to simply loop for now, or rely on a "Source View".

        // Better Approach: Fetch all balances for the period and ledger.
        const balances = await this.glBalanceRepository.find({
            where: { ledgerId, periodName: period }
        });

        if (balances.length === 0) {
            this.logger.warn(`No GL Balances found for ${period}`);
            return 0;
        }

        let seededCount = 0;

        // 3. Transform and Load
        for (const bal of balances) {
            // Mock Parsing of CCID (e.g. "US-IT-60000")
            // In real app, we look up `gl_code_combinations`
            const parts = bal.codeCombinationId.split('-');
            const entityId = parts[0] || 'DEFAULT_ENT';
            const deptId = parts[1] || 'DEFAULT_DEPT';
            const accountId = parts[2] || 'DEFAULT_ACCT';

            const amount = Number(bal.periodNetDr) - Number(bal.periodNetCr);

            // Idempotency: Find existing
            let planUnit = await this.planUnitRepository.findOne({
                where: {
                    scenarioId: scenario.id,
                    versionId: version.id,
                    period: period,
                    accountId: accountId,
                    departmentId: deptId,
                    entityId: entityId
                }
            });

            if (!planUnit) {
                planUnit = this.planUnitRepository.create({
                    scenarioId: scenario.id,
                    versionId: version.id,
                    period: period,
                    accountId: accountId,
                    departmentId: deptId,
                    entityId: entityId,
                    amount: amount,
                    status: 'APPROVED',
                    currency: bal.currencyCode
                });
            } else {
                planUnit.amount = amount;
                planUnit.currency = bal.currencyCode;
            }

            await this.planUnitRepository.save(planUnit);
            seededCount++;
        }

        this.logger.log(`Seeded ${seededCount} PlanUnits from GL for ${period}`);
        return seededCount;
    }

    /**
     * Pushes Approved Budget to ERP logic
     */
    async pushBudgetToGL(versionId: string): Promise<void> {
        this.logger.log(`Pushing Budget Version ${versionId} to GL Interface...`);
        // Logic to write to gl_budget_interface table would go here
    }
}
