import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { RequisitionService } from './requisition.service';
import { ApprovalService } from './approval.service';

@Controller('procurement/requisitions')
export class RequisitionController {
    constructor(
        private readonly reqService: RequisitionService,
        private readonly approvalService: ApprovalService
    ) { }

    @Post()
    create(@Body() dto: any) {
        return this.reqService.create(dto);
    }

    @Get()
    findAll() {
        return this.reqService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.reqService.findOne(id);
    }

    @Post(':id/submit')
    submit(@Param('id') id: string) {
        return this.reqService.submit(id);
    }

    @Post(':id/approve')
    approve(@Param('id') id: string) {
        return this.reqService.approve(id);
    }

    @Post(':id/reject')
    reject(@Param('id') id: string) {
        return this.reqService.reject(id);
    }

    @Post(':id/convert-to-po')
    convertToPO(@Param('id') id: string) {
        return this.reqService.convertToPO(id);
    }

    @Post('admin/seed-rules')
    seedRules() {
        return this.approvalService.seedDefaultRules();
    }
}
