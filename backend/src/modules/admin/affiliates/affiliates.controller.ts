import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query } from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';

@Controller('api/admin/affiliates')
export class AffiliatesController {
    constructor(private readonly affiliatesService: AffiliatesService) { }

    @Get()
    async getAll(@Query() query: any) {
        return this.affiliatesService.findAll(query);
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        return this.affiliatesService.findById(id);
    }

    @Get(':id/referrals')
    async getReferrals(@Param('id') id: string) {
        return this.affiliatesService.getReferrals(id);
    }

    @Post()
    async create(@Body() data: any) {
        return this.affiliatesService.create(data);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any) {
        return this.affiliatesService.update(id, data);
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body() data: { status: string }) {
        return this.affiliatesService.updateStatus(id, data.status);
    }

    @Post(':id/referrals')
    async createReferral(@Param('id') id: string, @Body() data: { tenantId: string }) {
        return this.affiliatesService.createReferral(id, data.tenantId);
    }

    @Post('referrals/:referralId/convert')
    async convertReferral(
        @Param('referralId') referralId: string,
        @Body() data: { commissionAmount: number }
    ) {
        return this.affiliatesService.convertReferral(referralId, data.commissionAmount);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.affiliatesService.delete(id);
    }
}
