import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query } from '@nestjs/common';
import { ModulesService } from './modules.service';

@Controller('api/admin/modules')
export class ModulesController {
    constructor(private readonly modulesService: ModulesService) { }

    @Get()
    async getAll(@Query() query: any): Promise<any> {
        return this.modulesService.findAll(query);
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<any> {
        return this.modulesService.findById(id);
    }

    @Post()
    async create(@Body() data: any): Promise<any> {
        return this.modulesService.create(data);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any): Promise<any> {
        return this.modulesService.update(id, data);
    }

    @Patch(':id/toggle')
    async toggle(@Param('id') id: string): Promise<any> {
        return this.modulesService.toggle(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<any> {
        return this.modulesService.delete(id);
    }
}
