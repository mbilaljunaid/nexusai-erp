import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ArService } from './ar.service';

@Controller('erp/ar')
export class ArController {
    constructor(private readonly arService: ArService) { }

    /** P0.4: Unapply a receipt — reverses SLA journals, restores invoice balance */
    @Post('receipts/:id/unapply')
    unapplyReceipt(
        @Param('id') id: string,
        @Body() body: { reason?: string }
    ) {
        return this.arService.unapplyReceipt(id, body.reason);
    }

    /** P0.5: Start an async dunning batch run */
    @Post('dunning/batch')
    runDunningBatch(@Body() body: { tenantId?: string }) {
        return this.arService.runDunningBatch(body.tenantId);
    }

    /** Get status of a dunning run */
    @Get('dunning/runs/:id')
    getDunningRun(@Param('id') id: string) {
        return this.arService.getDunningRun(id);
    }

    /** P0.6: Generate AI collection tasks from live AR aging */
    @Post('collections/generate')
    generateCollectionTasks(@Body() body: { tenantId?: string }) {
        return this.arService.generateCollectionTasks(body.tenantId);
    }

    /** Get all open collection tasks */
    @Get('collections/tasks')
    getCollectionTasks() {
        return this.arService.getCollectionTasks();
    }
}
