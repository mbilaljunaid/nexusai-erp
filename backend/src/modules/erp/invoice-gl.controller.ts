import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { InvoiceGlService } from './invoice-gl.service';

@Controller('erp/invoices')
export class InvoiceGlController {
    constructor(private readonly invoiceGlService: InvoiceGlService) { }

    /** P0.8-A: Post invoice to GL (Dr AR / Cr Revenue + Tax Liability) */
    @Post(':id/post-gl')
    postInvoiceToGL(@Param('id') id: string) {
        return this.invoiceGlService.postInvoiceToGL(id);
    }

    /** P0.8-B: Post payment receipt to GL (Dr Cash / Cr AR) */
    @Post(':id/post-payment')
    postPaymentToGL(
        @Param('id') id: string,
        @Body('amountPaid') amountPaid: number,
    ) {
        return this.invoiceGlService.postPaymentToGL(id, amountPaid);
    }

    /** P0.8-C: Post credit memo reversal to GL (Dr Revenue / Cr AR) */
    @Post(':id/credit-memo')
    postCreditMemoToGL(
        @Param('id') id: string,
        @Body('amount') amount: number,
        @Body('reason') reason: string,
    ) {
        return this.invoiceGlService.postCreditMemoToGL(id, amount, reason);
    }
}
