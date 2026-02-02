import { Injectable, Logger } from '@nestjs/common';
import { TaxEngineService, TaxableTransaction, TaxCalculation } from './tax-engine.service';

export interface IntercompanyTransaction extends TaxableTransaction {
    sourceEntityId: string;
    destinationEntityId: string;
    isIntercompany: boolean;
}

@Injectable()
export class IntercompanyTaxService {
    private readonly logger = new Logger(IntercompanyTaxService.name);

    constructor(private readonly taxEngine: TaxEngineService) { }

    async calculateelimination(transaction: IntercompanyTransaction): Promise<TaxCalculation> {
        this.logger.log(`Processing intercompany tax elimination for transaction ${transaction.id}`);

        // verify it is actually an intercompany transaction
        if (!transaction.isIntercompany || transaction.sourceEntityId === transaction.destinationEntityId) {
            this.logger.warn(`Transaction ${transaction.id} is not a valid intercompany transaction for elimination.`);
            // Return standard tax calculation if not purely intercompany, or handle as error depending on business rule
            return this.taxEngine.calculateTax(transaction);
        }

        // 1. Calculate standard tax (Shadow Calculation)
        const baseCalculation = await this.taxEngine.calculateTax(transaction);

        // 2. Apply Elimination Logic
        // In many jurisdictions, intercompany transactions might be zero-rated or exempt,
        // OR they might be taxable but eliminated at consolidation.
        // Here we simulate an "Elimination" generic rule where tax is calculated but flagged as eliminated.

        const eliminationCalculation: TaxCalculation = {
            ...baseCalculation,
            taxAmount: 0, // Eliminated (was totalTax in initial plan which was incorrect)
            taxableAmount: 0, // Effectively zero base for tax
            netAmount: baseCalculation.grossAmount, // No tax added
            recoverable: false // Generally not recoverable if it's eliminated/not paid
        };

        return eliminationCalculation;
    }
}
