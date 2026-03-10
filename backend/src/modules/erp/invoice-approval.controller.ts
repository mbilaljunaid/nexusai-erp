import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { InvoiceApprovalService } from './invoice-approval.service';

@Controller('erp/invoices')
export class InvoiceApprovalController {
    constructor(private readonly approvalService: InvoiceApprovalService) { }

    /** P0.9: Submit invoice for approval (Draft → Submitted) */
    @Post(':id/submit')
    submit(
        @Param('id') id: string,
        @Body('submittedBy') submittedBy: string,
    ) {
        return this.approvalService.submitForApproval(id, submittedBy || 'system');
    }

    /** P0.9: Approve a submitted invoice (Submitted → Approved + GL post) */
    @Post(':id/approve')
    approve(
        @Param('id') id: string,
        @Body('approvedBy') approvedBy: string,
        @Body('comments') comments: string,
    ) {
        return this.approvalService.approveInvoice(id, approvedBy || 'system', comments);
    }

    /** P0.9: Reject a submitted invoice (Submitted → Rejected) */
    @Post(':id/reject')
    reject(
        @Param('id') id: string,
        @Body('rejectedBy') rejectedBy: string,
        @Body('reason') reason: string,
    ) {
        return this.approvalService.rejectInvoice(id, rejectedBy || 'system', reason);
    }

    /** P0.9: Mark an approved invoice as Sent */
    @Post(':id/send')
    markAsSent(
        @Param('id') id: string,
        @Body('sentBy') sentBy: string,
    ) {
        return this.approvalService.markAsSent(id, sentBy || 'system');
    }

    /** P0.9: Get the full approval audit trail for an invoice */
    @Get(':id/approval-history')
    getApprovalHistory(@Param('id') id: string) {
        return this.approvalService.getApprovalHistory(id);
    }
}
