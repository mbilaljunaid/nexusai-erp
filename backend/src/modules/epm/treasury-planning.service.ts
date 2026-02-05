
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanUnit } from './entities/plan-unit.entity';

@Injectable()
export class TreasuryPlanningService {
    private readonly logger = new Logger(TreasuryPlanningService.name);

    constructor(
        @InjectRepository(PlanUnit)
        private planUnitRepo: Repository<PlanUnit>,
    ) { }

    /**
     * Calculates Projected Cash Closing Balance.
     * Logic: Opening (from prev period Closing) + Inflows - Outflows.
     * 
     * @param period Target Period
     * @param cashAccount Account for Cash
     * @param inflowAccount Aggregated Inflows
     * @param outflowAccount Aggregated Outflows
     */
    async calculateCashPosition(
        scenarioId: string,
        versionId: string,
        period: string,
        entityId: string,
        cashAccount: string,
        inflowAccount: string,
        outflowAccount: string,
        openingBalance: number
    ): Promise<void> {
        this.logger.log(`Calculating Cash Position for ${entityId}/${period}...`);

        // 1. Get Inflows
        const inflow = await this.getAmount(scenarioId, versionId, period, entityId, inflowAccount);

        // 2. Get Outflows
        const outflow = await this.getAmount(scenarioId, versionId, period, entityId, outflowAccount);

        // 3. Calculate Closing
        const closing = openingBalance + inflow - outflow;

        this.logger.log(`Opening: ${openingBalance} + In: ${inflow} - Out: ${outflow} = Closing: ${closing}`);

        // 4. Save Closing Balance
        await this.savePlanUnit(scenarioId, versionId, period, entityId, cashAccount, closing);
    }

    private async getAmount(scenarioId: string, versionId: string, period: string, entityId: string, accountId: string): Promise<number> {
        const unit = await this.planUnitRepo.findOne({
            where: { scenarioId, versionId, period, entityId, accountId }
        });
        return unit ? Number(unit.amount) : 0;
    }

    private async savePlanUnit(scenarioId: string, versionId: string, period: string, entityId: string, accountId: string, amount: number) {
        let unit = await this.planUnitRepo.findOne({
            where: { scenarioId, versionId, period, entityId, accountId }
        });

        if (!unit) {
            unit = this.planUnitRepo.create({
                scenarioId, versionId, period, entityId, accountId,
                amount, status: 'CALCULATED', departmentId: 'TREASURY'
            });
        } else {
            unit.amount = amount;
        }
        await this.planUnitRepo.save(unit);
    }
}
