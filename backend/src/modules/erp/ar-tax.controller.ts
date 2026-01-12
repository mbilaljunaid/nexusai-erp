import { Controller, Post, Body } from '@nestjs/common';
import { ARTaxService } from './ar-tax.service';
import { TaxableTransaction } from './tax-engine.service';

/**
 * Controller for handling Accounts Receivable (AR) tax related endpoints.
 */
@Controller('ar-tax')
export class ARTaxController {
    constructor(private readonly arTaxService: ARTaxService) { }

    /**
     * Endpoint to process an AR receipt and calculate tax.
     * @param receipt The AR transaction payload.
     */
    @Post('calculate')
    calculateTax(@Body() receipt: TaxableTransaction) {
        return this.arTaxService.processARReceipt(receipt);
    }
}
