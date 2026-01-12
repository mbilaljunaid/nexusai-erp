import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { InventoryOrganizationService } from './inventory-organization.service';

@Controller('inventory/warehouses') // Mapping to existing frontend route preference
export class InventoryOrganizationController {
    constructor(private readonly orgService: InventoryOrganizationService) { }

    @Post()
    create(@Body() dto: any) {
        // Map frontend 'warehouseName' to 'name' if needed, or handle in DTO
        const cleanDto = {
            name: dto.warehouseName || dto.name,
            code: dto.code || (dto.warehouseName ? dto.warehouseName.substring(0, 3).toUpperCase() : 'DEF'),
            locationCode: dto.location,
            ...dto
        };
        return this.orgService.create(cleanDto);
    }

    @Get()
    findAll() {
        return this.orgService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.orgService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.orgService.remove(id);
    }
}
