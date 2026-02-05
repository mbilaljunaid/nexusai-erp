
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanUnit } from './entities/plan-unit.entity';
import { PlanProject } from './entities/plan-project.entity';

@Injectable()
export class ProjectFinanceService {
    private readonly logger = new Logger(ProjectFinanceService.name);

    constructor(
        @InjectRepository(PlanUnit)
        private planUnitRepository: Repository<PlanUnit>,
        @InjectRepository(PlanProject)
        private planProjectRepository: Repository<PlanProject>,
    ) { }

    /**
     * Calculates Forecasted Revenue based on Percentage of Completion (POC) method.
     * Logic: 
     * 1. Get Project Plan Expenses for the period (Cost).
     * 2. Calculate POC % = (Period Cost / Estimated Total Cost).
     * 3. Revenue = Total Contract Value * POC %.
     * 4. Save Revenue PlanUnit.
     * 
     * @param projectCode EPM Project Code
     * @param period Period (2025-01)
     * @param costAccountPattern Pattern to identify cost accounts (e.g. '5%')
     * @param revenueAccount Target Revenue Account Code
     */
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

        const project = await this.planProjectRepository.findOneBy({ code: projectCode });
        if (!project) throw new Error(`Project ${projectCode} not found`);

        // 1. Aggregate Costs for this Project/Period 
        // Assuming "5xxxx" are expense accounts. In real app, use Account Type='EXPENSE'
        const units = await this.planUnitRepository.createQueryBuilder('unit')
            .where('unit.scenarioId = :scenarioId', { scenarioId })
            .andWhere('unit.versionId = :versionId', { versionId })
            .andWhere('unit.period = :period', { period })
            .andWhere('unit.projectId = :projId', { projId: project.code }) // Assuming projectId stores code or ID? PlanUnit.projectId usually stores the Code or UUID. Let's assume Code based on previous mock data.
            // .andWhere('unit.accountId LIKE :pattern', { pattern: '5%' }) // Simple filter for costs
            .getMany();

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
        let revUnit = await this.planUnitRepository.findOne({
            where: {
                scenarioId,
                versionId,
                period,
                projectId: project.code,
                accountId: revenueAccount
            }
        });

        if (!revUnit) {
            revUnit = this.planUnitRepository.create({
                scenarioId,
                versionId,
                period,
                projectId: project.code,
                accountId: revenueAccount,
                departmentId: 'GL_REV_REC', // System Dept
                entityId: costUnits[0]?.entityId || 'DEFAULT',
                amount: revenueAmount,
                status: 'CALCULATED'
            });
        } else {
            revUnit.amount = revenueAmount;
        }

        await this.planUnitRepository.save(revUnit);
        return revenueAmount;
    }
}
