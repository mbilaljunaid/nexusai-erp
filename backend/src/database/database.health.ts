import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from './drizzle.provider';

export interface DatabaseHealthStatus {
    healthy: boolean;
    pool: {
        total: number;
        idle: number;
        waiting: number;
    };
    latency?: number;
    error?: string;
}

@Injectable()
export class DatabaseHealthService {
    constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) { }

    async checkHealth(): Promise<DatabaseHealthStatus> {
        try {
            const start = Date.now();
            const client = await this.pool.connect();

            try {
                await client.query('SELECT 1');
                const latency = Date.now() - start;

                return {
                    healthy: true,
                    pool: {
                        total: this.pool.totalCount,
                        idle: this.pool.idleCount,
                        waiting: this.pool.waitingCount,
                    },
                    latency,
                };
            } finally {
                client.release();
            }
        } catch (error) {
            return {
                healthy: false,
                pool: {
                    total: this.pool.totalCount,
                    idle: this.pool.idleCount,
                    waiting: this.pool.waitingCount,
                },
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    getPoolStats() {
        return {
            total: this.pool.totalCount,
            idle: this.pool.idleCount,
            waiting: this.pool.waitingCount,
        };
    }
}
