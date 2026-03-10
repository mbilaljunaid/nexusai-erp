
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema/index';

@Injectable()
export class CapExService {
    private readonly logger = new Logger(CapExService.name);

    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async calculateDepreciation(versionId: string, scenarioId: string): Promise<number> {
        this.logger.log(`Calculating Depreciation for Version ${versionId}...`);

        const assets = await this.db.query.planAssets.findMany({
            where: eq(schema.planAssets.versionId, versionId)
        });

        let count = 0;
        for (const asset of assets) {
            // Straight Line: Cost / UsefulLife
            // Schema has cost, usefulLife (months - verifying schema, assumed integer)
            const cost = Number(asset.cost || 0);
            const usefulLife = asset.usefulLife || 60; // Default 5 years if null

            const monthlyDepr = cost / usefulLife;

            // Generate PlanUnit for one sample month
            await this.db.insert(schema.planUnits).values({
                versionId,
                period: '2024-01', // Should be strictly >= purchaseDate
                entityId: 'US-OPS',
                department: 'SHARED', // Hardcoded as in original
                account: '70000_DEPR_EXP',
                amount: String(monthlyDepr),
                status: 'CALCULATED'
            });
            count++;
        }
        return count;
    }
}
