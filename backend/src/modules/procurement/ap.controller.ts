import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApService } from './ap.service';

@Controller('procurement/ap')
export class ApController {
    constructor(private readonly apService: ApService) { }

    @Post('invoices')
    createInvoice(@Body() dto: any) {
        return this.apService.createInvoice(dto);
    }

    @Get('invoices')
    findAllInvoices() {
        return this.apService.findAllInvoices();
    }

    @Get('invoices/:id')
    findOneInvoice(@Param('id') id: string) {
        return this.apService.findOneInvoice(id);
    }

    @Post('invoices/:id/validate')
    validateInvoice(@Param('id') id: string) {
        return this.apService.validateInvoice(id);
    }

    @Post('invoices/:id/pay')
    payInvoice(@Param('id') id: string, @Body() dto: any) {
        return this.apService.payInvoice(id, dto);
    }

    /** P0: Async Payment Batch (PPR — Payment Process Request) */
    @Post('payment-batches')
    createPaymentBatch(@Body() dto: { batchName: string; invoiceIds: string[]; checkDate?: string; paymentMethod?: string; bankAccountId?: string }) {
        return this.apService.createPaymentBatch(dto);
    }

    @Get('payment-batches/:id')
    getPaymentBatch(@Param('id') id: string) {
        return this.apService.getPaymentBatch(id);
    }
}
