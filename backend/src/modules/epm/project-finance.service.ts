
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider.ts';
import * as schema from '../../../../shared/schema/index.ts';

@Injectable()
export class ProjectFinanceService {
    private readonly logger = new Logger(ProjectFinanceService.name);

    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async calculateRevenueRecognition(
        projectCode: string,
        period: string,
        scenarioId: string,
        versionId: string,
        totalContractValue: number,
        estimatedTotalCost: number,
        revenueAccount: string
    ): Promise<number> {
        this.logger.log(`Running Rev Rec for ${projectCode} in ${period}...`);

        const project = await this.db.query.planProjects.findFirst({
            where: eq(schema.planProjects.code, projectCode)
        });

        if (!project) throw new Error(`Project ${projectCode} not found`);
        const projectCodeVal = project.code || 'UNKNOWN';

        // 1. Aggregate Costs for this Project/Period 
        // Assuming "5xxxx" are expense accounts. In real app, use Account Type='EXPENSE'
        const units = await this.db.query.planUnits.findMany({
            where: and(
                eq(schema.planUnits.scenarioId, scenarioId),
                eq(schema.planUnits.versionId, versionId),
                eq(schema.planUnits.period, period),
                eq(schema.planUnits.projectId, projectCodeVal) // Assuming PlanUnit stores code (legacy) or ID? 
                // The TypeORM code used `project.code` for `projectId` filter.
                // Assuming PlanUnit.projectId stores the "Code" string in this messy legacy setup.
            )
        });

        // Filter for expenses manually or via query if needed. 
        // For simplicity, let's assume all units for this project *except* the revenue account are costs.
        const costUnits = units.filter(u => u.accountId !== revenueAccount);
        const periodCost = costUnits.reduce((sum, u) => sum + Number(u.amount), 0);

        if (periodCost === 0) {
            this.logger.warn(`No costs found for ${projectCode}. Rev Rec = 0.`);
            return 0;
        }

        // 2. Calculate POC
        if (estimatedTotalCost === 0) throw new Error('Estimated Total Cost cannot be zero');
        const pocPercent = periodCost / estimatedTotalCost;

        // 3. Calculate Revenue
        const revenueAmount = totalContractValue * pocPercent;

        this.logger.log(`Cost: ${periodCost}, Est.Total: ${estimatedTotalCost}, POC: ${(pocPercent * 100).toFixed(2)}%, Rev: ${revenueAmount}`);

        // 4. Upsert Revenue PlanUnit
        const revUnit = await this.db.query.planUnits.findFirst({
            where: and(
                eq(schema.planUnits.scenarioId, scenarioId),
                eq(schema.planUnits.versionId, versionId),
                eq(schema.planUnits.period, period),
                eq(schema.planUnits.projectId, projectCodeVal),
                eq(schema.planUnits.accountId, revenueAccount)
            )
        });

        if (!revUnit) {
            // Insert
            await this.db.insert(schema.planUnits).values({
                scenarioId,
                versionId,
                period,
                projectId: projectCodeVal,
                accountId: revenueAccount,
                departmentId: 'GL_REV_REC', // System Dept
                entityId: costUnits[0]?.entityId || 'DEFAULT',
                amount: String(revenueAmount),
                status: 'CALCULATED'
            });
        } else {
            // Update
            await this.db.update(schema.planUnits)
                .set({ amount: String(revenueAmount) })
                .where(eq(schema.planUnits.id, revUnit.id));
        }

        return revenueAmount;
    }
}
