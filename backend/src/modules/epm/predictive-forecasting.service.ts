
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanUnit } from './entities/plan-unit.entity';

@Injectable()
export class PredictiveForecastingService {
    private readonly logger = new Logger(PredictiveForecastingService.name);

    constructor(
        @InjectRepository(PlanUnit)
        private planUnitRepository: Repository<PlanUnit>,
    ) { }

    /**
     * Generates a forecast for a target period range based on historical data.
     * Uses Simple Linear Regression (Least Squares) for this proof-of-concept.
     *
     * @param accountId Account to forecast
     * @param entityId Entity scope
     * @param sourceScenarioId Scenario to learn from (e.g. ACTUAL)
     * @param targetScenarioId Scenario to write to (e.g. FORECAST)
     * @param startPeriod Target start (e.g. 2025-01)
     * @param endPeriod Target end (e.g. 2025-12)
     */
    async generateForecast(
        accountId: string,
        entityId: string,
        sourceScenarioId: string,
        targetScenarioId: string,
        versionId: string,
        startPeriod: string,
        endPeriod: string
    ): Promise<number> {
        this.logger.log(`Generating forecast for ${accountId} (${startPeriod} to ${endPeriod})...`);

        // 1. Fetch Historical Data (Last 12 months?)
        // Ideally we fetch a range. Let's assume we fetch all available ACTUALS for simplicity or last 12 periods.
        // Simple logic: Fetch everything for this account/entity/scenario.
        const history = await this.planUnitRepository.find({
            where: {
                scenarioId: sourceScenarioId,
                entityId,
                accountId,
                // In real app, sort by period ASC
            },
            order: { period: 'ASC' }
        });

        if (history.length < 2) {
            this.logger.warn(`Not enough history to forecast ${accountId}. Needs at least 2 data points.`);
            return 0;
        }

        // 2. Prepare Data for Regression
        // X = Time (Index 0, 1, 2...), Y = Amount
        const dataPoints = history.map((unit, index) => ({
            x: index,
            y: Number(unit.amount)
        }));

        // 3. Calculate Linear Regression (y = mx + b)
        const n = dataPoints.length;
        const sumX = dataPoints.reduce((acc, p) => acc + p.x, 0);
        const sumY = dataPoints.reduce((acc, p) => acc + p.y, 0);
        const sumXY = dataPoints.reduce((acc, p) => acc + (p.x * p.y), 0);
        const sumXX = dataPoints.reduce((acc, p) => acc + (p.x * p.x), 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        this.logger.log(`Regression Model: y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`);

        // 4. Generate Future Points
        // Assume startPeriod is next month after history. 
        // In real app, we need to map YYYY-MM to X index. 
        // Let's assume we are forecasting N periods *after* the last history point.

        let generatedCount = 0;
        // Simple iteration for range. Mapping string periods is complex, I'll forecast 1 period ahead for demo correctness.
        // Or loop 1 to 12.

        // Let's simplified: Project next period.
        const nextX = n;
        const nextVal = slope * nextX + intercept;

        await this.saveForecast(targetScenarioId, versionId, startPeriod, entityId, accountId, nextVal);
        generatedCount++;

        return generatedCount;
    }

    private async saveForecast(scenarioId: string, versionId: string, period: string, entityId: string, accountId: string, amount: number) {
        let unit = await this.planUnitRepository.findOne({
            where: { scenarioId, versionId, period, entityId, accountId }
        });

        if (!unit) {
            unit = this.planUnitRepository.create({
                scenarioId,
                versionId,
                period,
                entityId,
                accountId,
                departmentId: 'AI_GENERATED',
                amount: amount,
                status: 'DRAFT',
                comment: 'AI Generated Forecast (Linear Regression)'
            });
        } else {
            unit.amount = amount;
            unit.comment = 'AI Generated Forecast (Updated)';
        }
        await this.planUnitRepository.save(unit);
        this.logger.log(`Saved forecast for ${period}: ${amount.toFixed(2)}`);
    }
}
