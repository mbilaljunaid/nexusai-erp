import { Controller, Get, Post, Put, Delete, Body, Param, Query, Patch } from '@nestjs/common';
import { SupportRequestsService } from './support-requests.service';

@Controller('api/admin/support-requests')
export class SupportRequestsController {
    constructor(private readonly requestsService: SupportRequestsService) { }

    @Get()
    async getAll(@Query() query: any) {
        return this.requestsService.findAll(query);
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        return this.requestsService.findById(id);
    }

    @Post()
    async create(@Body() data: any) {
        return this.requestsService.create(data);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any) {
        return this.requestsService.update(id, data);
    }

    @Post(':id/assign')
    async assign(@Param('id') id: string, @Body() data: { userId: string }) {
        return this.requestsService.assign(id, data.userId);
    }

    @Post(':id/close')
    async close(@Param('id') id: string) {
        return this.requestsService.close(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.requestsService.delete(id);
    }
}
