import { Controller, Post, Body } from '@nestjs/common';
import { InventoryTaxService } from './inventory-tax.service';
import { TaxableTransaction } from './tax-engine.service';

/**
 * Controller for handling inventory tax related endpoints.
 */
@Controller('inventory-tax')
export class InventoryTaxController {
    constructor(private readonly inventoryTaxService: InventoryTaxService) { }

    /**
     * Endpoint to process an inventory transaction and calculate tax.
     * @param transaction The inventory transaction payload.
     */
    @Post('calculate')
    calculateTax(@Body() transaction: TaxableTransaction) {
        return this.inventoryTaxService.processInventoryTransaction(transaction);
    }
}
