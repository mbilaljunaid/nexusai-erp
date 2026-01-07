import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FleetService } from './fleet.service';

@Controller('logistics/fleet')
export class FleetController {
    constructor(private readonly service: FleetService) { }

    @Get(':tenantId')
    findAll(@Param('tenantId') tenantId: string) {
        return this.service.findAll(tenantId);
    }

    @Post(':tenantId')
    create(@Param('tenantId') tenantId: string, @Body() body: any) {
        return this.service.createVehicle(tenantId, body);
    }

    @Post(':tenantId/dispatch')
    dispatch(@Param('tenantId') tenantId: string, @Body() body: any) {
        return this.service.dispatchOptimized(tenantId, body.location);
    }
}
