import { Injectable } from '@nestjs/common';
import { TaxEngineService } from './tax-engine.service';
import { TaxableTransaction } from './tax-engine.service';

/**
 * Service responsible for handling Inventory Tax calculations.
 * It uses TaxEngineService to compute tax for inventory movements.
 */
@Injectable()
export class InventoryTaxService {
    constructor(private readonly taxEngine: TaxEngineService) { }

    /**
     * Process an inventory transaction and calculate tax.
     * @param transaction The inventory transaction payload.
     */
    processInventoryTransaction(transaction: TaxableTransaction) {
        // Additional inventory-specific logic could be added here.
        return this.taxEngine.calculateTax(transaction);
    }

    /**
     * Process an inventory transaction and calculate tax.
     * @param transaction The inventory transaction payload.
     */
    private mapToTaxableTransaction(movement: any): TaxableTransaction {
        return {
            id: movement.id,
            date: new Date(),
            amount: movement.value,
            type: 'transfer',
            jurisdiction: movement.jurisdictionId || undefined,
            shipToCountry: 'US', // Stub
            shipToRegion: 'CA', // Stub
            shipFromCountry: 'US',
            shipFromRegion: 'NY'
        };
    }
}
