
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanAsset } from './entities/plan-asset.entity';
import { PlanUnit } from './entities/plan-unit.entity';

@Injectable()
export class CapExService {
    private readonly logger = new Logger(CapExService.name);

    constructor(
        @InjectRepository(PlanAsset)
        private assetRepository: Repository<PlanAsset>,
        @InjectRepository(PlanUnit)
        private planUnitRepository: Repository<PlanUnit>,
    ) { }

    async calculateDepreciation(versionId: string, scenarioId: string): Promise<number> {
        this.logger.log(`Calculating Depreciation for Version ${versionId}...`);

        const assets = await this.assetRepository.find({ where: { versionId } });

        let count = 0;
        for (const asset of assets) {
            // Straight Line: Cost / UsefulLife
            const monthlyDepr = Number(asset.cost) / asset.usefulLifeMonths;

            // Generate PlanUnit for one sample month
            const unit = this.planUnitRepository.create({
                scenarioId,
                versionId,
                period: '2024-01', // Should be strictly >= purchaseDate
                entityId: 'US-OPS',
                departmentId: 'SHARED',
                accountId: '70000_DEPR_EXP',
                amount: monthlyDepr,
                status: 'CALCULATED'
            });
            await this.planUnitRepository.save(unit);
            count++;
        }
        return count;
    }
}
