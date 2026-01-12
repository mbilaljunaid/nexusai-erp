import { Injectable } from '@nestjs/common';
import { TaxEngineService } from './tax-engine.service';
import { TaxableTransaction } from './tax-engine.service';

/**
 * Service responsible for handling Accounts Receivable (AR) tax calculations.
 * It delegates the core tax computation to TaxEngineService.
 */
@Injectable()
export class ARTaxService {
    constructor(private readonly taxEngine: TaxEngineService) { }

    /**
     * Process an AR receipt and calculate tax details.
     * @param receipt An object representing the AR transaction.
     * @returns The TaxCalculation result from TaxEngineService.
     */
    processARReceipt(receipt: TaxableTransaction) {
        // In a real implementation, additional AR-specific validation could occur here.
        return this.taxEngine.calculateTax(receipt);
    }
}
