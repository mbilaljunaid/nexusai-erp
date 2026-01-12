import { Injectable, Logger } from '@nestjs/common';
import { TaxPeriodCloseService } from './tax-period-close.service';

@Injectable()
export class TaxFilingScheduler {
    private readonly logger = new Logger(TaxFilingScheduler.name);

    constructor(private readonly periodCloseService: TaxPeriodCloseService) { }

    /**
     * Manually triggers the filing process for a given jurisdiction and period.
     * In a production environment, this could be triggered by a Cron job.
     */
    async runScheduledFiling(jurisdictionId: string) {
        this.logger.log(`Running scheduled filing for ${jurisdictionId}`);

        // Determine last completed period (stubbed: always assume last month)
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);

        const result = await this.periodCloseService.closePeriod(jurisdictionId, { start, end });

        // Logic to generate returns (XML/JSON) and interface with authority would go here
        this.logger.log(`Filing generated successfully for ${jurisdictionId}`);

        return result;
    }
}
