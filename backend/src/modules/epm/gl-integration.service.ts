
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider.ts';
import * as schema from '../../../../shared/schema/index.ts';

@Injectable()
export class EpmGLIntegrationService {
    private readonly logger = new Logger(EpmGLIntegrationService.name);

    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    /**
     * Fetches Actuals from the GL for a specific period and populates the EPM PlanUnit table.
     * @param period YYYY-MM
     * @param ledgerId Ledger from which to source actuals
     */
    async fetchActuals(period: string, ledgerId: string): Promise<number> {
        this.logger.log(`Fetching Actuals from Ledger ${ledgerId} for ${period}...`);

        // 1. Get 'ACTUAL' Scenario and 'WORKING' Version
        const scenario = await this.db.query.planScenarios.findFirst({
            where: eq(schema.planScenarios.code, 'ACTUAL')
        });
        if (!scenario) throw new Error('ACTUAL scenario not found');

        let version = await this.db.query.planVersions.findFirst({
            where: and(
                eq(schema.planVersions.scenarioId, scenario.id),
                eq(schema.planVersions.code, 'WORKING')
            )
        });

        if (!version) {
            this.logger.warn('WORKING version for ACTUAL scenario not found. Creating default...');
            // In a real implementation this might need more robust handling
            const [newVersion] = await this.db.insert(schema.planVersions).values({
                scenarioId: scenario.id,
                code: 'WORKING',
                name: 'System Actuals'
            }).returning();
            version = newVersion;
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
        const balances = await this.db.query.glBalances.findMany({
            where: and(
                eq(schema.glBalances.ledgerId, ledgerId),
                eq(schema.glBalances.periodName, period)
            )
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
            const planUnit = await this.db.query.planUnits.findFirst({
                where: and(
                    eq(schema.planUnits.scenarioId, scenario.id),
                    eq(schema.planUnits.versionId, version.id),
                    eq(schema.planUnits.period, period),
                    eq(schema.planUnits.accountId, accountId),
                    eq(schema.planUnits.departmentId, deptId),
                    eq(schema.planUnits.entityId, entityId)
                )
            });

            if (!planUnit) {
                await this.db.insert(schema.planUnits).values({
                    scenarioId: scenario.id,
                    versionId: version.id,
                    period: period,
                    accountId: accountId,
                    departmentId: deptId,
                    entityId: entityId,
                    amount: String(amount),
                    status: 'APPROVED',
                    currency: bal.currencyCode
                });
            } else {
                await this.db.update(schema.planUnits)
                    .set({
                        amount: String(amount),
                        currency: bal.currencyCode
                    })
                    .where(eq(schema.planUnits.id, planUnit.id));
            }

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
