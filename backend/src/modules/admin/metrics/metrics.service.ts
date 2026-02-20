import { Injectable, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { tenants } from '@shared/schema';
import { adminLogs } from '@shared/schema/admin';
import { eq, gte } from 'drizzle-orm';

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
            recentLogsResult,
        ] = await Promise.all([
            this.db.select({ count: sql<number>`count(*)::int` }).from(tenants),
            this.db.select({ count: sql<number>`count(*)::int` }).from(tenants).where(eq(tenants.status, 'active')),
            this.db.select({ count: sql<number>`count(*)::int` }).from(adminLogs).where(gte(adminLogs.createdAt, sevenDaysAgo)),
        ]);

        return {
            data: {
                totalTenants: totalTenantsResult[0]?.count ?? 0,
                activeTenants: activeTenantsResult[0]?.count ?? 0,
                recentAdminActions: recentLogsResult[0]?.count ?? 0,
            }
        };
    }
}
