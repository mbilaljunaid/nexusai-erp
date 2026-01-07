import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProductionService } from './production.service';

@Controller('manufacturing/production')
export class ProductionController {
    constructor(private readonly service: ProductionService) { }

    @Post(':tenantId/orders')
    create(@Param('tenantId') tenantId: string, @Body() body: any) {
        return this.service.createOrder(tenantId, body);
    }

    @Get(':tenantId/orders')
    findAll(@Param('tenantId') tenantId: string) {
        return this.service.findAll(tenantId);
    }

    @Get(':tenantId/dashboard')
    getDashboard(@Param('tenantId') tenantId: string) {
        return this.service.getDashboardMetrics(tenantId);
    }
}
