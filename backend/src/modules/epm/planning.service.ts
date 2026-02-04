
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanUnit } from './entities/plan-unit.entity';
import { PlanVersion } from './entities/plan-version.entity';

@Injectable()
export class PlanningService {
    private readonly logger = new Logger(PlanningService.name);

    constructor(
        @InjectRepository(PlanUnit)
        private planUnitRepository: Repository<PlanUnit>,
        @InjectRepository(PlanVersion)
        private versionRepository: Repository<PlanVersion>,
    ) { }

    /**
     * Generates a Base Plan by copying from a source version (e.g., Actuals) to a target version (e.g., Budget).
     */
    async generateBasePlan(sourceVersionId: string, targetVersionId: string, method: 'COPY' | 'ZERO_BASED' = 'COPY'): Promise<number> {
        this.logger.log(`Generating Base Plan: Source=${sourceVersionId} Target=${targetVersionId} Method=${method}`);

        if (method === 'ZERO_BASED') {
            // Just clear the target - already empty usually?
            // Or create empty rows for all accounts?
            // For simplicity, do nothing or just log.
            return 0;
        }

        // Method = COPY
        const sourceUnits = await this.planUnitRepository.find({ where: { versionId: sourceVersionId } });
        const targetVersion = await this.versionRepository.findOneBy({ id: targetVersionId });
        if (!targetVersion) throw new BadRequestException('Target Version ID invalid');

        let count = 0;
        for (const unit of sourceUnits) {
            // Create copy
            const newUnit = this.planUnitRepository.create({
                ...unit,
                id: undefined, // Let DB generate new ID
                versionId: targetVersionId,
                scenarioId: targetVersion.scenarioId,
                status: 'DRAFT',
                createdAt: undefined,
                updatedAt: undefined
            });
            await this.planUnitRepository.save(newUnit);
            count++;
        }

        this.logger.log(`Copied ${count} units to Base Plan.`);
        return count;
    }

    /**
     * Applies a driver value (percentage increase) to all lines in a version matching criteria.
     * @param versionId The plan version to update
     * @param driverName Name for logging
     * @param value Percentage (e.g. 0.05 for 5%)
     * @param filter Criteria (e.g. { departmentId: 'IT' })
     */
    async applyDriver(versionId: string, driverName: string, value: number, filter?: Partial<PlanUnit>): Promise<number> {
        this.logger.log(`Applying Driver ${driverName} (${value * 100}%) to Version ${versionId}`);

        const units = await this.planUnitRepository.find({ where: { versionId, ...filter } });

        for (const unit of units) {
            // Simple logic: New Amount = Old Amount * (1 + value)
            const oldVal = Number(unit.amount);
            unit.amount = oldVal * (1 + value);
            await this.planUnitRepository.save(unit);
        }

        return units.length;
    }
}
