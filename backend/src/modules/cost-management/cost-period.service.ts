import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, lte, gte } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

@Injectable()
export class CostPeriodService {
    private readonly logger = new Logger(CostPeriodService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>
    ) { }

    private async resolveCostOrg(inventoryOrgId: string): Promise<typeof schema.cstCostOrganizations.$inferSelect> {
        const [costOrg] = await this.db.select()
            .from(schema.cstCostOrganizations)
            .where(eq(schema.cstCostOrganizations.inventoryOrganizationId, inventoryOrgId));

        if (!costOrg) {
            throw new BadRequestException(`No Cost Organization defined for Inventory Org ${inventoryOrgId}`);
        }
        return costOrg;
    }

    async validateTransactionDate(inventoryOrgId: string, transactionDate: Date): Promise<void> {
        const costOrg = await this.resolveCostOrg(inventoryOrgId);

        const [period] = await this.db.select()
            .from(schema.cstCostPeriods)
            .where(and(
                eq(schema.cstCostPeriods.costOrganizationId, costOrg.id),
                lte(schema.cstCostPeriods.startDate, transactionDate),
                gte(schema.cstCostPeriods.endDate, transactionDate)
            ));

        if (!period) {
            throw new BadRequestException(`No Cost Period defined for date ${transactionDate.toISOString()} (Org: ${costOrg.code})`);
        }

        if (period.status !== 'Open') {
            throw new BadRequestException(`Cost Period '${period.periodName}' is ${period.status}. Transactions cannot be processed.`);
        }
    }

    async openPeriod(inventoryOrgId: string, periodName: string): Promise<typeof schema.cstCostPeriods.$inferSelect> {
        const costOrg = await this.resolveCostOrg(inventoryOrgId);

        const [period] = await this.db.select()
            .from(schema.cstCostPeriods)
            .where(and(
                eq(schema.cstCostPeriods.costOrganizationId, costOrg.id),
                eq(schema.cstCostPeriods.periodName, periodName)
            ));

        if (!period) throw new BadRequestException('Period not found');

        const [updated] = await this.db.update(schema.cstCostPeriods)
            .set({ status: 'Open', updatedAt: new Date() })
            .where(eq(schema.cstCostPeriods.id, period.id))
            .returning();

        return updated;
    }

    async closePeriod(inventoryOrgId: string, periodName: string): Promise<typeof schema.cstCostPeriods.$inferSelect> {
        const costOrg = await this.resolveCostOrg(inventoryOrgId);

        const [period] = await this.db.select()
            .from(schema.cstCostPeriods)
            .where(and(
                eq(schema.cstCostPeriods.costOrganizationId, costOrg.id),
                eq(schema.cstCostPeriods.periodName, periodName)
            ));

        if (!period) throw new BadRequestException('Period not found');

        const [updated] = await this.db.update(schema.cstCostPeriods)
            .set({ status: 'Closed', updatedAt: new Date() })
            .where(eq(schema.cstCostPeriods.id, period.id))
            .returning();

        return updated;
    }

    async createPeriod(costOrgId: string, name: string, start: Date, end: Date): Promise<typeof schema.cstCostPeriods.$inferSelect> {
        const [period] = await this.db.insert(schema.cstCostPeriods).values({
            costOrganizationId: costOrgId,
            periodName: name,
            startDate: start,
            endDate: end,
            status: 'Future Entry'
        }).returning();

        return period;
    }
}
