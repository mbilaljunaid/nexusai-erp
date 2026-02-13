import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('api/admin/tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    @Get()
    async getAll(@Query() query: any) {
        return this.tenantsService.findAll(query);
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        return this.tenantsService.findById(id);
    }

    @Post()
    async create(@Body() data: any) {
        return this.tenantsService.create(data);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any) {
        return this.tenantsService.update(id, data);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.tenantsService.delete(id);
    }
}
