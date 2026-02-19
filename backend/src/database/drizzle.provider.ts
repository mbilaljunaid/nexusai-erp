import { Provider, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../../shared/schema/index';
import { databaseConfig } from '../config/database.config';

export const DRIZZLE_DB = 'DRIZZLE_DB';
export const DATABASE = 'DATABASE'; // Alias for backward compatibility
export const DATABASE_POOL = 'DATABASE_POOL'; // Export pool for monitoring

let poolInstance: Pool | null = null;

export const DatabasePoolProvider: Provider = {
    provide: DATABASE_POOL,
    useFactory: async () => {
        if (poolInstance) {
            return poolInstance;
        }

        console.log('🔧 Initializing database connection pool...');
        poolInstance = new Pool(databaseConfig);

        // Pool event listeners for monitoring
        poolInstance.on('connect', (client) => {
            console.log('✅ New database client connected to pool');
        });

        poolInstance.on('error', (err, client) => {
            console.error('❌ Unexpected database pool error:', err);
        });

        poolInstance.on('remove', (client) => {
            console.log('🔌 Database client removed from pool');
        });

        // Test connection
        try {
            const client = await poolInstance.connect();
            await client.query('SELECT 1');
            client.release();
            console.log('✅ Database pool connection test successful');
        } catch (error) {
            console.error('❌ Database pool connection test failed:', error);
            throw error;
        }

        return poolInstance;
    },
};

export const DrizzleProvider: Provider = {
    provide: DRIZZLE_DB,
    useFactory: async (pool: Pool) => {
        console.log('🔧 Initializing Drizzle ORM with connection pool...');
        return drizzle(pool, { schema });
    },
    inject: [DATABASE_POOL],
};

// Alias provider for backward compatibility
export const DatabaseAliasProvider: Provider = {
    provide: DATABASE,
    useExisting: DRIZZLE_DB,
};

// Export function to get pool statistics
export function getPoolStats() {
    if (!poolInstance) {
        return null;
    }
    return {
        total: poolInstance.totalCount,
        idle: poolInstance.idleCount,
        waiting: poolInstance.waitingCount,
    };
}
