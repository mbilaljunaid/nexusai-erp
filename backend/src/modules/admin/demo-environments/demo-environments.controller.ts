import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query } from '@nestjs/common';
import { DemoEnvironmentsService } from './demo-environments.service';

@Controller('api/admin/demo-environments')
export class DemoEnvironmentsController {
    constructor(private readonly demoService: DemoEnvironmentsService) { }

    @Get()
    async getAll(@Query() query: any): Promise<any> {
        return this.demoService.findAll(query);
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<any> {
        return this.demoService.findById(id);
    }

    @Post()
    async create(@Body() data: any): Promise<any> {
        return this.demoService.create(data);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any): Promise<any> {
        return this.demoService.update(id, data);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() data: { status: string; accessUrl?: string }
    ): Promise<any> {
        return this.demoService.updateStatus(id, data.status, data.accessUrl);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<any> {
        return this.demoService.delete(id);
    }
}
