import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { EpmService } from './epm.service';

@Controller('epm')
export class EpmController {
    constructor(private readonly epmService: EpmService) { }

    @Post(':tenantId/forecasts')
    createForecast(@Param('tenantId') tenantId: string, @Body() body: any) {
        return this.epmService.createForecast(tenantId, body);
    }

    @Get(':tenantId/forecasts')
    getForecasts(@Param('tenantId') tenantId: string) {
        return this.epmService.findAllForecasts(tenantId);
    }

    @Post(':tenantId/run-prediction')
    async runPrediction(@Param('tenantId') tenantId: string) {
        return this.epmService.generateAiPrediction(tenantId);
    }
}
