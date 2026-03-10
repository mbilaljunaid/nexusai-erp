import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { CostAdjustmentService, CreateCostAdjustmentDto } from './cost-adjustment.service';

@Controller('api/cost-management/adjustments')
export class CostAdjustmentController {
    constructor(private readonly adjustmentService: CostAdjustmentService) { }

    /**
     * P1.6-A: Create a cost adjustment and submit for approval.
     * The submitter (dto.submittedBy) CANNOT also be the approver.
     */
    @Post()
    createAndSubmit(@Body() dto: CreateCostAdjustmentDto) {
        return this.adjustmentService.createAndSubmit(dto);
    }

    /**
     * P1.6-B: Approve a pending cost adjustment.
     * Maker-Checker enforced: approverId ≠ submitterId.
     */
    @Post(':requestId/approve')
    approve(
        @Param('requestId') requestId: string,
        @Body('approverId') approverId: string,
    ) {
        return this.adjustmentService.approveAdjustment(requestId, approverId);
    }

    /**
     * P1.6-C: Reject a pending cost adjustment with mandatory reason.
     */
    @Post(':requestId/reject')
    reject(
        @Param('requestId') requestId: string,
        @Body('rejectorId') rejectorId: string,
        @Body('reason') reason: string,
    ) {
        return this.adjustmentService.rejectAdjustment(requestId, rejectorId, reason);
    }

    /**
     * P1.6-D: Get all pending cost adjustment approval requests.
     */
    @Get('pending')
    getPendingQueue() {
        return this.adjustmentService.getPendingQueue();
    }

    /**
     * P1.6-E: Get the full cost adjustment approval history.
     */
    @Get('history')
    getHistory(@Query('limit') limit?: string) {
        return this.adjustmentService.getHistory(limit ? parseInt(limit, 10) : 50);
    }
}
