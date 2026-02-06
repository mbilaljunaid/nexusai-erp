import { Injectable, Logger, Inject } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema/index';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class TreasuryPlanningService {
    private readonly logger = new Logger(TreasuryPlanningService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    async calculateCashPosition(
        scenarioId: string,
        versionId: string,
        period: string,
        entityId: string,
        cashAccount: string,
        inflowAccount: string,
        outflowAccount: string,
        openingBalance: number
    ): Promise<void> {
        this.logger.log(`Calculating Cash Position for ${entityId}/${period}...`);

        // 1. Get Inflows
        const inflow = await this.getAmount(versionId, period, entityId, inflowAccount);

        // 2. Get Outflows
        const outflow = await this.getAmount(versionId, period, entityId, outflowAccount);

        // 3. Calculate Closing
        const closing = openingBalance + inflow - outflow;

        this.logger.log(`Opening: ${openingBalance} + In: ${inflow} - Out: ${outflow} = Closing: ${closing}`);

        // 4. Save Closing Balance
        await this.savePlanUnit(versionId, period, entityId, cashAccount, closing);
    }

    private async getAmount(versionId: string, period: string, entityId: string, accountId: string): Promise<number> {
        const unit = await this.db.query.planUnits.findFirst({
            where: and(
                eq(schema.planUnits.versionId, versionId),
                eq(schema.planUnits.period, period),
                eq(schema.planUnits.entityId, entityId),
                eq(schema.planUnits.account, accountId)
            )
        });
        return unit ? Number(unit.amount) : 0;
    }

    private async savePlanUnit(versionId: string, period: string, entityId: string, accountId: string, amount: number) {
        const existing = await this.db.query.planUnits.findFirst({
            where: and(
                eq(schema.planUnits.versionId, versionId),
                eq(schema.planUnits.period, period),
                eq(schema.planUnits.entityId, entityId),
                eq(schema.planUnits.account, accountId)
            )
        });

        if (!existing) {
            await this.db.insert(schema.planUnits).values({
                versionId, period, entityId, account: accountId,
                amount: amount.toString(),
                status: 'CALCULATED',
                department: 'TREASURY' // Default for this service
            } as any);
        } else {
            await this.db.update(schema.planUnits)
                .set({ amount: amount.toString() })
                .where(eq(schema.planUnits.id, existing.id));
        }
    }
}
