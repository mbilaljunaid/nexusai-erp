
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider.ts';
import * as schema from '../../../../shared/schema/index.ts';

@Injectable()
export class DemandPlanningService {
    private readonly logger = new Logger(DemandPlanningService.name);

    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    /**
     * Calculates Gross Margin for a specific Product and Period.
     * 
     * Formula:
     * Revenue = Volume * List Price
     * COGS = Volume * Standard Cost
     * Margin = Revenue - COGS
     */
    async calculateGrossMargin(
        productCode: string,
        period: string,
        scenarioId: string,
        versionId: string,
        volumeAccountId: string,
        revenueTargetAccount: string,
        cogsTargetAccount: string
    ): Promise<void> {
        this.logger.log(`Calculating Gross Margin for ${productCode} in ${period}...`);

        const product = await this.db.query.planProducts.findFirst({
            where: eq(schema.planProducts.code, productCode)
        });
        if (!product) throw new Error(`Product ${productCode} not found`);

        const volUnit = await this.db.query.planUnits.findFirst({
            where: and(
                eq(schema.planUnits.scenarioId, scenarioId),
                eq(schema.planUnits.versionId, versionId),
                eq(schema.planUnits.period, period),
                eq(schema.planUnits.productId, product.code),
                eq(schema.planUnits.accountId, volumeAccountId)
            )
        });

        if (!volUnit || Number(volUnit.amount) === 0) {
            this.logger.warn(`No volume found for ${productCode}`);
            return;
        }

        const volume = Number(volUnit.amount);
        const revenue = volume * Number(product.listPrice || 0);
        const cogs = volume * Number(product.standardCost || 0);

        const entityId = volUnit.entityId || 'DEFAULT'; // schema entityId matches

        this.logger.log(`Vol: ${volume}, Price: ${product.listPrice}, Cost: ${product.standardCost} -> Rev: ${revenue}, COGS: ${cogs}`);

        // Save Revenue
        await this.saveUnit(scenarioId, versionId, period, product.code || productCode, revenueTargetAccount, revenue, entityId);
        // Save COGS
        await this.saveUnit(scenarioId, versionId, period, product.code || productCode, cogsTargetAccount, cogs, entityId);

        // Optionally Save Margin if there is an account for it, or it handles via hierarchy
    }

    private async saveUnit(scenarioId: string, versionId: string, period: string,
        productId: string, accountId: string, amount: number, entityId: string) {

        const unit = await this.db.query.planUnits.findFirst({
            where: and(
                eq(schema.planUnits.scenarioId, scenarioId),
                eq(schema.planUnits.versionId, versionId),
                eq(schema.planUnits.period, period),
                eq(schema.planUnits.productId, productId),
                eq(schema.planUnits.accountId, accountId)
            )
        });

        if (!unit) {
            await this.db.insert(schema.planUnits).values({
                scenarioId,
                versionId,
                period,
                productId,
                accountId,
                entityId, // inherited
                departmentId: 'SOP_DEPT',
                amount: String(amount),
                status: 'CALCULATED'
            });
        } else {
            await this.db.update(schema.planUnits)
                .set({ amount: String(amount) })
                .where(eq(schema.planUnits.id, unit.id));
        }
    }
}
