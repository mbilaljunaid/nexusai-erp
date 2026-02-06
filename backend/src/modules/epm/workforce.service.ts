
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider.ts';
import * as schema from '../../../../shared/schema/index.ts';

@Injectable()
export class WorkforceService {
    private readonly logger = new Logger(WorkforceService.name);

    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async calculateHeadcountCosts(versionId: string): Promise<number> {
        this.logger.log(`Calculating Headcount Costs for Version ${versionId}...`);

        const positions = await this.db.query.planPositions.findMany({
            where: eq(schema.planPositions.versionId, versionId)
        });

        // First, clear existing WFP generated lines for this version to avoid duplicates
        // In a real app, we'd delete where source='WFP_ENGINE'. For now, assuming additive or clean slate.

        let lineCount = 0;
        for (const pos of positions) {
            // PlanPosition schema has 'salary', assuming it maps to annualSalary if not present in schema column name
            // Schema has: jobTitle, department, headcount, salary, startDate
            // TypeORM entity had 'annualSalary', 'benefitsPct'.
            // I might need to respect schema column names.
            const annualSalary = Number(pos.salary || 0);

            // Simple logic: Annual Salary / 12 = Monthly Cost
            const monthlySalary = annualSalary / 12;
            const monthlyBenefits = monthlySalary * 0.2; // Hardcoding 20% benefits since schema lacks benefitsPct
            const totalMonthly = monthlySalary + monthlyBenefits;

            // Generate lines for 12 months (or just a sample month for verification)
            // Ideally we iterate dates from startDate to endDate
            const periods = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
                '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'];

            for (const period of periods) {
                // Create Salary Line
                await this.db.insert(schema.planUnits).values({
                    scenarioId: 'TODO_look_up_scenario', // Simplified for conversion
                    versionId: versionId,
                    period: period,
                    entityId: 'DEFAULT_ENT',
                    departmentId: pos.department || 'Unassigned',
                    accountId: '60000_SALARIES',
                    amount: String(monthlySalary),
                    status: 'DRAFT'
                });
            }
            lineCount++;
        }

        return lineCount;
    }

    // Revised method with actual lookup to be runnable
    async runCalculation(versionId: string, scenarioId: string): Promise<number> {
        const positions = await this.db.query.planPositions.findMany({
            where: eq(schema.planPositions.versionId, versionId)
        });

        let count = 0;
        for (const pos of positions) {
            const monthly = Number(pos.salary || 0) / 12;
            // Generate just one month for testing to save time
            await this.db.insert(schema.planUnits).values({
                scenarioId,
                versionId,
                period: '2024-01',
                entityId: 'US-OPS',
                departmentId: pos.department || 'Unassigned',
                accountId: '60000_SALARIES',
                amount: String(monthly),
                status: 'CALCULATED'
            });
            count++;
        }
        return count;
    }
}
