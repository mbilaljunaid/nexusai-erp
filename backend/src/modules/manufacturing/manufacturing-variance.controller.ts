import { Controller, Get, Query } from '@nestjs/common';
import { ManufacturingVarianceService } from './manufacturing-variance.service';

@Controller('api/manufacturing/variance-journals')
export class ManufacturingVarianceController {
    constructor(private readonly varianceService: ManufacturingVarianceService) { }

    @Get()
    async getVarianceJournals(
        @Query('limit') limit = '50',
        @Query('offset') offset = '0',
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ): Promise<any> {
        return this.varianceService.getVarianceJournals(
            parseInt(limit, 10),
            parseInt(offset, 10),
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
    }

    @Get('summary')
    async getVarianceSummary(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ): Promise<any> {
        return this.varianceService.getVarianceSummary(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
    }
}
