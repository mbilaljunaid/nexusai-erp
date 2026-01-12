import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TaxReportingService } from './tax-reporting.service';

@Controller('api/tax/reports')
export class TaxReportingController {
    constructor(private readonly reportingService: TaxReportingService) { }

    @Get('return')
    async getTaxReturn(
        @Query('jurisdictionId') jurisdictionId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        return this.reportingService.generateTaxReturn({
            jurisdictionId,
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });
    }

    @Get('reconciliation')
    async getReconciliation(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        return this.reportingService.generateReconciliationReport({
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });
    }

    @Get('audit')
    async getAuditTrail(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        return this.reportingService.generateAuditTrail({
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });
    }
}
