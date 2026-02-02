import { Injectable, Logger } from '@nestjs/common';
import { TaxEngineService, TaxJurisdiction } from './tax-engine.service';

@Injectable()
export class TaxPeriodCloseService {
    private readonly logger = new Logger(TaxPeriodCloseService.name);

    constructor(private readonly taxEngine: TaxEngineService) { }

    /**
     * Closes the tax period for a specific jurisdiction.
     * This involves calculating obligations and potentially locking the period (stubbed).
     */
    async closePeriod(jurisdictionId: string, period: { start: Date; end: Date }) {
        this.logger.log(`Closing tax period for jurisdiction: ${jurisdictionId} from ${period.start} to ${period.end}`);

        const obligations = this.taxEngine.calculateTaxObligations(jurisdictionId, period);

        // In a real system, we would:
        // 1. Verify all transactions are posted
        // 2. Lock the period to prevent new transactions
        // 3. Generate a period close record/snapshot

        this.logger.log(`Period closed. Total Taxable: ${obligations.totalTaxable}, Total Tax: ${obligations.totalTax}`);

        return {
            status: 'CLOSED',
            jurisdictionId,
            period,
            summary: obligations,
            closedAt: new Date(),
        };
    }
}
