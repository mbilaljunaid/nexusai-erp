import { Injectable, Logger, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

@Injectable()
export class CostAnomalyService {
    private readonly logger = new Logger(CostAnomalyService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>
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
        const [stdCost] = await this.db.select({
            unitCost: schema.cstStandardCosts.unitCost
        })
            .from(schema.cstStandardCosts)
            .leftJoin(schema.cstCostScenarios, eq(schema.cstStandardCosts.scenarioId, schema.cstCostScenarios.id))
            .where(and(
                eq(schema.cstStandardCosts.itemId, itemId),
                eq(schema.cstCostScenarios.scenarioType, 'Current')
                // TODO: Filter by Org via Scenario -> Org
            ));

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
            let severity = 'Low';
            if (variancePercent > 20) severity = 'Medium';
            if (variancePercent > 50) severity = 'High';

            this.logger.warn(`IPV Anomaly Detected: Item ${itemId}, PP ${unitPrice}, Std ${standardPrice} (${variancePercent.toFixed(1)}%)`);

            await this.db.insert(schema.cstAnomalies).values({
                organizationId: orgId,
                itemId: itemId,
                anomalyType: 'IPV_SPIKE',
                detectedValue: unitPrice.toString(),
                expectedValue: standardPrice.toString(),
                variancePercent: variancePercent.toString(),
                severity: severity,
                details: JSON.stringify({
                    receiptNumber: receiptLine.receipt.receiptNumber,
                    vendor: receiptLine.receipt.purchaseOrder?.supplier?.name || 'Unknown'
                }),
                status: 'Open',
                detectedAt: new Date()
            });
        }
    }
}
