import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CostAnomaly, AnomalySeverity } from './entities/cost-anomaly.entity';
import { CstStandardCost } from './entities/cst-standard-cost.entity';
import { ReceiptLine } from '../procurement/entities/receipt-line.entity';

@Injectable()
export class CostAnomalyService {
    private readonly logger = new Logger(CostAnomalyService.name);

    constructor(
        @InjectRepository(CostAnomaly)
        private anomalyRepo: Repository<CostAnomaly>,
        @InjectRepository(CstStandardCost)
        private stdCostRepo: Repository<CstStandardCost>
    ) { }

    /**
     * Detects Purchase Price Variance (IPV) anomalies.
     * Triggered after Receipt Accounting.
     */
    async checkIpvAnomaly(receiptLine: any): Promise<void> {
        // receiptLine type should be ReceiptLine entity, using any to avoid partial import issues in this snippet
        if (!receiptLine.item) return;

        const itemId = receiptLine.item.id;
        const orgId = receiptLine.receipt.organization.id;
        const unitPrice = Number(receiptLine.unitPrice);

        // 1. Fetch Standard Cost (Simplified: Current Scenario)
        // In real app, we need to know WHICH scenario is active for this org
        const stdCost = await this.stdCostRepo.findOne({
            where: {
                item: { id: itemId },
                scenario: { scenarioType: 'Current' } // Assumption: Filter by Org too
            },
            relations: ['scenario', 'scenario.costOrganization']
        });

        if (!stdCost) {
            this.logger.warn(`No Standard Cost found for Item ${itemId}. Skipping Anomaly Check.`);
            return;
        }

        const standardPrice = Number(stdCost.unitCost);
        if (standardPrice === 0) return;

        // 2. Calculate Variance
        const variance = Math.abs(unitPrice - standardPrice);
        const variancePercent = (variance / standardPrice) * 100;

        // 3. Rule: If Variance > 10%, flag it.
        if (variancePercent > 10) {
            let severity = AnomalySeverity.LOW;
            if (variancePercent > 20) severity = AnomalySeverity.MEDIUM;
            if (variancePercent > 50) severity = AnomalySeverity.HIGH;

            this.logger.warn(`IPV Anomaly Detected: Item ${itemId}, PP ${unitPrice}, Std ${standardPrice} (${variancePercent.toFixed(1)}%)`);

            const anomaly = this.anomalyRepo.create({
                organization: receiptLine.receipt.organization,
                item: receiptLine.item,
                anomalyType: 'IPV_SPIKE',
                detectedValue: unitPrice,
                expectedValue: standardPrice,
                variancePercent: variancePercent,
                severity: severity,
                details: JSON.stringify({
                    receiptNumber: receiptLine.receipt.receiptNumber,
                    vendor: receiptLine.receipt.purchaseOrder?.supplier?.name || 'Unknown'
                })
            });

            await this.anomalyRepo.save(anomaly);
        }
    }
}
