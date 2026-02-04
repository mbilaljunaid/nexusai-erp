
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanUnit } from './entities/plan-unit.entity';
import { PlanVersion } from './entities/plan-version.entity';
import { PlanScenario } from './entities/plan-scenario.entity';
// Assuming we have access to GL Balances entity or Service. 
// For this phase, we will simulate the GL fetch if direct entity access is not yet set up, 
// or define a placeholder interface if the GL module is strictly decoupled.
// In a monolithic NestJS app, we can likely inject the GL service or repository.

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
    ) { }

    /**
     * Fetches Actuals from the GL for a specific period and populates the EPM PlanUnit table.
     * @param period YYYY-MM
     * @param entityId Optional filter by entity
     */
    async fetchActuals(period: string, entityId?: string): Promise<number> {
        this.logger.log(`Fetching Actuals for ${period}...`);

        // 1. Get or Ensure 'ACTUAL' Scenario and 'WORKING' Version for Actuals
        const scenario = await this.scenarioRepository.findOneBy({ code: 'ACTUAL' });
        if (!scenario) throw new Error('ACTUAL scenario not found');

        // For Actuals, we might use a specific system version or just 'Working'
        let version = await this.versionRepository.findOne({ where: { scenarioId: scenario.id, code: 'WORKING' } });
        if (!version) {
            // Fallback or create? For now throw.
            throw new Error('WORKING version for ACTUAL scenario not found');
        }

        // 2. Simulate GL Query (Replace with real Repository.find or QueryBuilder in integration phase)
        // const glBalances = await this.glBalanceRepo.find({ where: { period_name: period } });
        const mockGLData = [
            { accountId: 'REV-001', deptId: 'SALES', amount: 50000, entityId: 'ENT-US' },
            { accountId: 'EXP-001', deptId: 'IT', amount: 12000, entityId: 'ENT-US' },
            { accountId: 'EXP-002', deptId: 'HR', amount: 8000, entityId: 'ENT-US' },
        ];

        // 3. Transform and Load into PlanUnit
        let seededCount = 0;
        for (const record of mockGLData) {
            // Idempotency: Check if exists to update or insert
            let planUnit = await this.planUnitRepository.findOne({
                where: {
                    scenarioId: scenario.id,
                    versionId: version.id,
                    period: period,
                    accountId: record.accountId,
                    departmentId: record.deptId,
                    entityId: record.entityId
                }
            });

            if (!planUnit) {
                planUnit = this.planUnitRepository.create({
                    scenarioId: scenario.id,
                    versionId: version.id,
                    period: period,
                    accountId: record.accountId,
                    departmentId: record.deptId,
                    entityId: record.entityId,
                    amount: record.amount,
                    status: 'APPROVED' // Actuals are always final/approved
                });
            } else {
                planUnit.amount = record.amount;
            }

            await this.planUnitRepository.save(planUnit);
            seededCount++;
        }

        this.logger.log(`Seeded ${seededCount} PlanUnits from GL for ${period}`);
        return seededCount;
    }

    /**
     * Pushes Approved Budget to ERP logic (Placeholder for now)
     */
    async pushBudgetToGL(versionId: string): Promise<void> {
        this.logger.log(`Pushing Budget Version ${versionId} to GL Interface...`);
        // Logic to write to gl_budget_interface table would go here
    }
}
