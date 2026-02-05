
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanEsgMetric } from './entities/plan-esg-metric.entity';
import { PlanUnit } from './entities/plan-unit.entity';

@Injectable()
export class EsgPlanningService {
    private readonly logger = new Logger(EsgPlanningService.name);

    constructor(
        @InjectRepository(PlanEsgMetric)
        private esgRepo: Repository<PlanEsgMetric>,
        @InjectRepository(PlanUnit)
        private planUnitRepo: Repository<PlanUnit>,
    ) { }

    /**
     * Calculates Scope 1 Carbon Emissions based on Activity Data.
     * Logic: Activity (e.g., Fuel Consumption) * Emission Factor
     * 
     * @param activityMetricCode Code for activity (e.g. 'FUEL_LITERS')
     * @param emissionMetricCode Target code (e.g. 'CO2_SCOPE1')
     * @param emissionFactor Factor per unit (e.g. 2.68 kg CO2 per Liter Diesel)
     */
    async calculateCarbonFootprint(
        scenarioId: string,
        versionId: string,
        period: string,
        entityId: string,
        activityMetricCode: string,
        emissionMetricCode: string,
        emissionFactor: number
    ): Promise<void> {
        this.logger.log(`Calculating Carbon Footprint for ${entityId}/${period}...`);

        // 1. Get Activity Data
        const activity = await this.esgRepo.findOne({
            where: { scenarioId, versionId, period, entityId, metricCode: activityMetricCode }
        });

        if (!activity) {
            this.logger.warn(`No activity data found for ${activityMetricCode}`);
            return;
        }

        const emissions = Number(activity.value) * emissionFactor;

        // 2. Save Emissions
        await this.saveEsgMetric(
            scenarioId, versionId, period, entityId,
            emissionMetricCode, emissions, 'KG', 'Computed from Activity'
        );
        this.logger.log(`Calculated Emissions: ${emissions} KG`);
    }

    private async saveEsgMetric(
        scenarioId: string, versionId: string, period: string,
        entityId: string, metricCode: string, value: number, unit: string, comment: string
    ) {
        let metric = await this.esgRepo.findOne({
            where: { scenarioId, versionId, period, entityId, metricCode }
        });

        if (!metric) {
            metric = this.esgRepo.create({
                scenarioId, versionId, period, entityId, metricCode, value, unit, comment
            });
        } else {
            metric.value = value;
            metric.comment = comment;
        }
        await this.esgRepo.save(metric);
    }
}
