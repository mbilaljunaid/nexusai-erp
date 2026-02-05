
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanUnit } from './entities/plan-unit.entity';
import { PlanProduct } from './entities/plan-product.entity';

@Injectable()
export class DemandPlanningService {
    private readonly logger = new Logger(DemandPlanningService.name);

    constructor(
        @InjectRepository(PlanUnit)
        private planUnitRepository: Repository<PlanUnit>,
        @InjectRepository(PlanProduct)
        private planProductRepository: Repository<PlanProduct>,
    ) { }

    /**
     * Calculates Gross Margin for a specific Product and Period.
     * 
     * Formula:
     * Revenue = Volume * List Price
     * COGS = Volume * Standard Cost
     * Margin = Revenue - COGS
     */
    async calculateGrossMargin(
        productCode: string,
        period: string,
        scenarioId: string,
        versionId: string,
        volumeAccountId: string,
        revenueTargetAccount: string,
        cogsTargetAccount: string
    ): Promise<void> {
        this.logger.log(`Calculating Gross Margin for ${productCode} in ${period}...`);

        const product = await this.planProductRepository.findOneBy({ code: productCode });
        if (!product) throw new Error(`Product ${productCode} not found`);

        const volUnit = await this.planUnitRepository.findOne({
            where: {
                scenarioId,
                versionId,
                period,
                productId: product.code,
                accountId: volumeAccountId
            }
        });

        if (!volUnit || Number(volUnit.amount) === 0) {
            this.logger.warn(`No volume found for ${productCode}`);
            return;
        }

        const volume = Number(volUnit.amount);
        const revenue = volume * Number(product.listPrice);
        const cogs = volume * Number(product.standardCost);

        const entityId = volUnit.entityId;

        this.logger.log(`Vol: ${volume}, Price: ${product.listPrice}, Cost: ${product.standardCost} -> Rev: ${revenue}, COGS: ${cogs}`);

        // Save Revenue
        await this.saveUnit(scenarioId, versionId, period, product.code, revenueTargetAccount, revenue, entityId);
        // Save COGS
        await this.saveUnit(scenarioId, versionId, period, product.code, cogsTargetAccount, cogs, entityId);

        // Optionally Save Margin if there is an account for it, or it handles via hierarchy
    }

    private async saveUnit(scenarioId: string, versionId: string, period: string,
        productId: string, accountId: string, amount: number, entityId: string) {
        let unit = await this.planUnitRepository.findOne({
            where: { scenarioId, versionId, period, productId, accountId }
        });

        if (!unit) {
            unit = this.planUnitRepository.create({
                scenarioId,
                versionId,
                period,
                productId,
                accountId,
                entityId, // inherited
                departmentId: 'SOP_DEPT',
                amount: amount,
                status: 'CALCULATED'
            });
        } else {
            unit.amount = amount;
        }
        await this.planUnitRepository.save(unit);
    }
}
