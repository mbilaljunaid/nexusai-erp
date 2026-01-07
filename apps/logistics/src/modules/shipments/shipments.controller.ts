import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';

@Controller('shipments')
export class ShipmentsController {
    constructor(private readonly service: ShipmentsService) { }

    @Post()
    create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get()
    findAll() {
        // Mock Tenant ID for now
        return this.service.findAll('default-tenant');
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Put(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.service.updateStatus(id, status);
    }

    @Post(':id/predict-eta')
    predictEta(@Param('id') id: string) {
        return this.service.predictEta(id);
    }
}
