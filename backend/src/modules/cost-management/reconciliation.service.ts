
import { Injectable, Logger, Inject } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class ReconciliationService {
    private readonly logger = new Logger(ReconciliationService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    async reconcileInventory(orgId: string): Promise<any> {
        this.logger.log(`Running Reconciliation for Org ${orgId}`);

        // 1. Get Subledger Balance (Sum of Item Costs * Qty)
        // Join OnHandBalance (b) -> ItemCost (c)
        // Condition: b.organization = orgId, c.inventoryOrganizationId = orgId, b.itemId = c.itemId

        // Note: Drizzle query builder for joins with aggregation
        const result = await this.db.select({
            value: sql<string>`SUM(${schema.inventoryOnHandQuantities.quantity} * ${schema.cstItemCosts.unitCost})`
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

        const subledgerValue = parseFloat(result[0]?.value || '0');

        // 2. Get GL Balance for Inventory Asset Account (1410-000-0000)
        const acct = '1410-000-0000';
        const glResult = await this.db.select({
            debitSum: sql<string>`SUM(CASE WHEN ${schema.glEntries.debitAccount} = ${acct} THEN ${schema.glEntries.debitAmount} ELSE 0 END)`,
            creditSum: sql<string>`SUM(CASE WHEN ${schema.glEntries.creditAccount} = ${acct} THEN ${schema.glEntries.creditAmount} ELSE 0 END)`
        })
            .from(schema.glEntries);
        // Note: Ideally filter by period or org if GL entries isolate them, but sticking to legacy logic for parity.

        const glDebit = parseFloat(glResult[0]?.debitSum || '0');
        const glCredit = parseFloat(glResult[0]?.creditSum || '0');
        const glNet = glDebit - glCredit;

        return {
            organizationId: orgId,
            timestamp: new Date(),
            subledgerValue: subledgerValue,
            glValue: glNet,
            variance: subledgerValue - glNet,
            status: Math.abs(subledgerValue - glNet) < 0.01 ? 'MATCH' : 'VARIANCE'
        };
    }
}
