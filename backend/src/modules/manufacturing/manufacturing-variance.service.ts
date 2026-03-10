import { Injectable, Inject } from '@nestjs/common';
import { and, desc, gte, lte, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { varianceJournals } from '@shared/schema/manufacturing';

@Injectable()
export class ManufacturingVarianceService {
    constructor(
        @Inject('DATABASE') private db: NodePgDatabase<Record<string, unknown>>,
    ) { }

    async getVarianceJournals(
        limit: number,
        offset: number,
        startDate?: Date,
        endDate?: Date,
    ): Promise<{ items: any[]; total: number }> {
        const conditions = [];

        if (startDate) {
            conditions.push(gte(varianceJournals.transactionDate, startDate));
        }
        if (endDate) {
            // End of the end date (inclusive)
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            conditions.push(lte(varianceJournals.transactionDate, endOfDay));
        }

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        const [items, countResult] = await Promise.all([
            this.db
                .select()
                .from(varianceJournals)
                .where(where)
                .orderBy(desc(varianceJournals.transactionDate))
                .limit(limit)
                .offset(offset),
            this.db
                .select({ count: sql<number>`count(*)::int` })
                .from(varianceJournals)
                .where(where),
        ]);

        return {
            items,
            total: countResult[0]?.count ?? 0,
        };
    }

    async getVarianceSummary(startDate?: Date, endDate?: Date): Promise<any> {
        const conditions = [];

        if (startDate) conditions.push(gte(varianceJournals.transactionDate, startDate));
        if (endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            conditions.push(lte(varianceJournals.transactionDate, endOfDay));
        }

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        const summary = await this.db
            .select({
                varianceType: varianceJournals.varianceType,
                total: sql<number>`sum(${varianceJournals.amount})::numeric`,
                count: sql<number>`count(*)::int`,
            })
            .from(varianceJournals)
            .where(where)
            .groupBy(varianceJournals.varianceType);

        const netVariance = summary.reduce((acc, s) => acc + Number(s.total), 0);

        return {
            byType: summary,
            netVariance,
            totalPostings: summary.reduce((acc, s) => acc + s.count, 0),
        };
    }
}
