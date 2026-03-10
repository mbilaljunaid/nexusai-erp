import { Injectable, Inject } from '@nestjs/common';
import { sql, and, gte, lte, eq, ilike, desc } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { adminLogs } from '@shared/schema';

interface FindAllOptions {
    page: number;
    limit: number;
    actor?: string;
    action?: string;
    type?: string;
    from?: Date;
    to?: Date;
}

@Injectable()
export class AuditLogsService {
    constructor(
        @Inject('DATABASE') private db: NodePgDatabase<Record<string, unknown>>,
    ) { }

    async findAll(options: FindAllOptions) {
        const { page, limit, actor, action, type, from, to } = options;
        const offset = (page - 1) * limit;

        const conditions: any[] = [];
        if (actor) conditions.push(ilike(adminLogs.actorEmail, `%${actor}%`));
        if (action) conditions.push(ilike(adminLogs.action, `%${action}%`));
        if (type) conditions.push(eq(adminLogs.resourceType, type));
        if (from) conditions.push(gte(adminLogs.createdAt, from));
        if (to) conditions.push(lte(adminLogs.createdAt, to));

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        const [logs, countResult] = await Promise.all([
            this.db
                .select()
                .from(adminLogs)
                .where(where)
                .orderBy(desc(adminLogs.createdAt))
                .limit(limit)
                .offset(offset),
            this.db
                .select({ count: sql<number>`count(*)::int` })
                .from(adminLogs)
                .where(where),
        ]);

        const total = countResult[0]?.count ?? 0;

        return {
            data: logs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async create(data: Partial<typeof adminLogs.$inferInsert>) {
        const [log] = await this.db
            .insert(adminLogs)
            .values(data as any)
            .returning();
        return { data: log };
    }
}
