import { Injectable, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { tenants, demoEnvironments, supportRequests } from '@shared/schema';
import { eq, gt } from 'drizzle-orm';

@Injectable()
export class MetricsService {
    constructor(
        @Inject('DATABASE') private db: NodePgDatabase<Record<string, unknown>>,
    ) { }

    async getAggregateMetrics() {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalTenantsResult,
            activeTenantsResult,
            activeDemosResult,
            openSupportResult,
        ] = await Promise.all([
            this.db.select({ count: sql<number>`count(*)::int` }).from(tenants),
            this.db.select({ count: sql<number>`count(*)::int` }).from(tenants).where(eq(tenants.status, 'active')),
            this.db.select({ count: sql<number>`count(*)::int` }).from(demoEnvironments).where(eq(demoEnvironments.status, 'active')),
            this.db.select({ count: sql<number>`count(*)::int` }).from(supportRequests).where(eq(supportRequests.status, 'open')),
        ]);

        return {
            data: {
                totalTenants: totalTenantsResult[0]?.count ?? 0,
                activeTenants: activeTenantsResult[0]?.count ?? 0,
                activeDemos: activeDemosResult[0]?.count ?? 0,
                openSupportRequests: openSupportResult[0]?.count ?? 0,
            }
        };
    }
}
