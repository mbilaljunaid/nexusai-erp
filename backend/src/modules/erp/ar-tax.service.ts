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
    private mapToTaxableTransaction(receipt: any): TaxableTransaction {
        // Stub mapping - in real app would map from Receipt address
        return {
            id: receipt.id,
            date: new Date(receipt.date),
            amount: receipt.amount,
            type: 'sale',
            jurisdiction: receipt.jurisdictionId || undefined,
            shipToCountry: 'US', // Stub
            shipToRegion: 'NY', // Stub
            shipFromCountry: 'US',
            shipFromRegion: 'CA'
        };
    }

    processARReceipt(receipt: any) { // Changed type to 'any' to match mapToTaxableTransaction input
        // In a real implementation, additional AR-specific validation could occur here.
        const taxableTransaction = this.mapToTaxableTransaction(receipt);
        return this.taxEngine.calculateTax(taxableTransaction);
    }
}
