
import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema/index';

@Injectable()
export class EpmPlanningService {
    private readonly logger = new Logger(EpmPlanningService.name);

    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    /**
     * Generates a Base Plan by copying from a source version (e.g., Actuals) to a target version (e.g., Budget).
     */
    async generateBasePlan(sourceVersionId: string, targetVersionId: string, method: 'COPY' | 'ZERO_BASED' = 'COPY'): Promise<number> {
        this.logger.log(`Generating Base Plan: Source=${sourceVersionId} Target=${targetVersionId} Method=${method}`);

        if (method === 'ZERO_BASED') {
            return 0;
        }

        // Method = COPY
        const sourceUnits = await this.db.query.planUnits.findMany({
            where: eq(schema.planUnits.versionId, sourceVersionId)
        });

        const targetVersion = await this.db.query.planVersions.findFirst({
            where: eq(schema.planVersions.id, targetVersionId)
        });

        if (!targetVersion) throw new BadRequestException('Target Version ID invalid');

        let count = 0;
        if (sourceUnits.length > 0) {
            // Bulk insert for performance? Or loop. Drizzle supports bulk.
            // Mapping source units to new structure
            const newUnits = sourceUnits.map(unit => ({
                versionId: targetVersionId,
                period: unit.period,
                entityId: unit.entityId,
                department: unit.department,
                account: unit.account,
                projectId: unit.project,
                channelId: unit.channel,
                productId: unit.product,
                amount: unit.amount, // Keep string/numeric type consistent
                currency: unit.currency,
                status: 'DRAFT'
            }));

            // Chunking if necessary, but for now direct insert
            await this.db.insert(schema.planUnits).values(newUnits);
            count = newUnits.length;
        }

        this.logger.log(`Copied ${count} units to Base Plan.`);
        return count;
    }

    /**
     * Applies a driver value (percentage increase) to all lines in a version matching criteria.
     */
    async applyDriver(versionId: string, driverName: string, value: number, filter?: Partial<typeof schema.planUnits.$inferSelect>): Promise<number> {
        this.logger.log(`Applying Driver ${driverName} (${value * 100}%) to Version ${versionId}`);

        // Construct dynamic filter
        const filters = [eq(schema.planUnits.versionId, versionId)];
        if (filter?.department) filters.push(eq(schema.planUnits.department, filter.department));
        if (filter?.account) filters.push(eq(schema.planUnits.account, filter.account));

        const units = await this.db.query.planUnits.findMany({
            where: and(...filters)
        });

        let updatedCount = 0;
        // Batch update is tricky with different values, but here it's a multiplier.
        // Drizzle doesn't support 'update ... set amount = amount * X' easily without sql operator.
        // Doing loop update for safety/logic clarity for now.

        for (const unit of units) {
            const oldVal = Number(unit.amount);
            const newVal = String(oldVal * (1 + value));

            await this.db.update(schema.planUnits)
                .set({ amount: newVal })
                .where(eq(schema.planUnits.id, unit.id));
            updatedCount++;
        }

        return updatedCount;
    }
}
