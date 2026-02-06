
import { Injectable, Logger, Inject } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class CostManagementService {
    private readonly logger = new Logger(CostManagementService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>
    ) { }

    async onModuleInit() {
        this.logger.log('Cost Management Module initialized');
    }

    async getWorkspaceValuation(orgId: string): Promise<number> {
        // SQL SUM query joining Balance and Cost.
        // inv_on_hand_quantities (b) JOIN cst_item_costs (c)

        const result = await this.db.select({
            totalValue: sql<string>`SUM(${schema.inventoryOnHandQuantities.quantity} * ${schema.cstItemCosts.unitCost})`
        })
            .from(schema.inventoryOnHandQuantities)
            .innerJoin(
                schema.cstItemCosts,
                and(
                    eq(schema.cstItemCosts.itemId, schema.inventoryOnHandQuantities.itemId),
                    eq(schema.cstItemCosts.inventoryOrganizationId, schema.inventoryOnHandQuantities.organizationId)
                )
            )
            .where(eq(schema.inventoryOnHandQuantities.organizationId, orgId));

        return parseFloat(result[0]?.totalValue || '0');
    }
}
