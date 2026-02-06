
import { Inject, Injectable, Logger, ConflictException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider.ts';
import * as schema from '../../../../shared/schema/index.ts';

@Injectable()
export class BudgetControlService {
    private readonly logger = new Logger(BudgetControlService.name);

    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async publishToGL(versionId: string): Promise<void> {
        this.logger.log(`Publishing Budget Version ${versionId} to GL...`);

        const version = await this.db.query.planVersions.findFirst({
            where: eq(schema.planVersions.id, versionId)
        });

        if (!version) throw new ConflictException('Version not found');

        if (version.isLocked) {
            this.logger.warn('Version is already locked/published.');
            return;
        }

        // 1. Lock the Version
        await this.db.update(schema.planVersions)
            .set({ isLocked: true, isFinal: true })
            .where(eq(schema.planVersions.id, versionId));

        // 2. Push to GL Interface (Mocked)
        // await this.glInterface.insert( ... select * from plan_units where versionId ... )
        this.logger.log(`Budget Version ${versionId} LOCKED and Synced to ERP.`);
    }
}
