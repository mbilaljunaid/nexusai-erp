import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
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

    @Patch(':id/status')
    @HttpCode(HttpStatus.OK)
    async updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.tenantsService.update(id, { status: status as any });
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.tenantsService.delete(id);
    }
}
