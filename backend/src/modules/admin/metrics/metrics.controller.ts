import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('api/admin/metrics')
export class MetricsController {
    constructor(private readonly metricsService: MetricsService) { }

    @Get()
    async getMetrics() {
        return this.metricsService.getAggregateMetrics();
    }
}
