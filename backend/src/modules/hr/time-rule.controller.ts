import {
    Controller, Get, Post, Put, Delete, Patch,
    Body, Param, Query
} from '@nestjs/common';
import { TimeRuleService, TimeRuleSimulationInput } from './time-rule.service';

@Controller('api/hr/time-rules')
export class TimeRuleController {
    constructor(private readonly timeRuleService: TimeRuleService) { }

    @Get()
    async findAll(@Query('tenantId') tenantId: string): Promise<any> {
        return this.timeRuleService.findAll(tenantId);
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<any> {
        return this.timeRuleService.findById(id);
    }

    @Post()
    async create(@Body() data: any): Promise<any> {
        return this.timeRuleService.create(data);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any): Promise<any> {
        return this.timeRuleService.update(id, data);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<any> {
        return this.timeRuleService.delete(id);
    }

    @Patch(':id/toggle')
    async toggleStatus(@Param('id') id: string): Promise<any> {
        return this.timeRuleService.toggleStatus(id);
    }

    @Post('simulate')
    async simulate(
        @Query('tenantId') tenantId: string,
        @Body() input: TimeRuleSimulationInput,
    ): Promise<any> {
        return this.timeRuleService.simulateRules(tenantId, input);
    }
}
