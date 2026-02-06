
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider.ts';
import * as schema from '../../../../shared/schema/index.ts';

@Injectable()
export class EliminationService {
    private readonly logger = new Logger(EliminationService.name);

    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async runEliminations(versionId: string, scenarioId: string): Promise<number> {
        this.logger.log(`Running IC Eliminations for Version ${versionId}...`);

        // Simplified Logic: Find pair of IC Revenue and Expense
        // In a real system, we'd query rows where 'ICP' dimension is not null.
        // For this MVP, let's assume specific Accounts are flagged as IC.

        // Mock: Find 'IC_SALES' and create offset.
        // real implementation would group by Payee/Payer.

        const icSales = await this.db.query.planUnits.findMany({
            where: and(
                eq(schema.planUnits.versionId, versionId),
                eq(schema.planUnits.accountId, 'IC_SALES') // Placeholder
            )
        });

        let count = 0;
        for (const sale of icSales) {
            // Create Offset
            await this.db.insert(schema.planUnits).values({
                scenarioId,
                versionId,
                period: sale.period,
                entityId: 'ELIM_ENTITY', // Group Elimination Node
                departmentId: 'NO_DEPT',
                accountId: 'IC_OFFSET',
                amount: String(Number(sale.amount) * -1), // Reverse the amount
                status: 'ELIMINATED'
            });
            count++;
        }

        return count;
    }
}
