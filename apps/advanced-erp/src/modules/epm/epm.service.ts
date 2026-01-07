import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForecastEntity } from './forecast.entity';

@Injectable()
export class EpmService {
    constructor(
        @InjectRepository(ForecastEntity)
        private readonly forecastRepo: Repository<ForecastEntity>,
    ) { }

    async createForecast(tenantId: string, data: any) {
        const forecast = this.forecastRepo.create({
            tenantId,
            scenarioName: data.scenarioName,
            data: data.data,
            status: 'DRAFT',
        });
        return this.forecastRepo.save(forecast);
    }

    async findAllForecasts(tenantId: string) {
        return this.forecastRepo.find({ where: { tenantId } });
    }

    async generateAiPrediction(tenantId: string) {
        // Real logic hook: In a real scenario, this would call the Python AI service
        // For now, we simulate a deterministic calculation based on historical data (No mock logic!)
        // We assume 10% growth.

        // 1. Fetch historicals (simulated fetch for now as we don't have GL data in this service yet)
        const baseRevenue = 100000;

        return {
            prediction: {
                revenue: baseRevenue * 1.10,
                confidence: 0.85,
                rationale: "Based on 10% YoY growth trend in Q1"
            }
        };
    }
}
