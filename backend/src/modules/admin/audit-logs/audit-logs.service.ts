import { Injectable, Inject } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

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

        // Build dynamic WHERE using string interpolation (values sanitized via pg driver parameterization)
        const conditions: string[] = ['1=1'];
        const params: any[] = [];
        let idx = 1;

        if (actor) { conditions.push(`actor_email ILIKE $${idx++}`); params.push(`%${actor}%`); }
        if (action) { conditions.push(`action ILIKE $${idx++}`); params.push(`%${action}%`); }
        if (type) { conditions.push(`resource_type = $${idx++}`); params.push(type); }
        if (from) { conditions.push(`created_at >= $${idx++}`); params.push(from.toISOString()); }
        if (to) { conditions.push(`created_at <= $${idx++}`); params.push(to.toISOString()); }

        const where = conditions.join(' AND ');

        // Use underlying pool to execute parameterized queries
        const pool = (this.db as any).session?.client ?? (this.db as any).__client;

        const logsRes = await pool.query(
            `SELECT * FROM admin_logs WHERE ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
            [...params, limit, offset],
        );
        const countRes = await pool.query(
            `SELECT COUNT(*)::int as count FROM admin_logs WHERE ${where}`,
            params,
        );

        return {
            data: logsRes.rows ?? [],
            meta: {
                total: countRes.rows?.[0]?.count ?? 0,
                page,
                limit,
                totalPages: Math.ceil((countRes.rows?.[0]?.count ?? 0) / limit),
            },
        };
    }
}
