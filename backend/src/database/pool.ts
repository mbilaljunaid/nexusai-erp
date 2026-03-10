import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { databaseConfig } from '../config/database.config';

// Create PostgreSQL connection pool
export const pool = new Pool(databaseConfig);

// Pool event handlers for monitoring
pool.on('connect', (client) => {
    console.log('New client connected to the pool');
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

pool.on('remove', (client) => {
    console.log('Client removed from pool');
});

// Create Drizzle instance with pool
export const db = drizzle(pool);

// Health check function
export async function checkDatabaseHealth(): Promise<{
    healthy: boolean;
    totalConnections: number;
    idleConnections: number;
    waitingClients: number;
}> {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();

        return {
            healthy: true,
            totalConnections: pool.totalCount,
            idleConnections: pool.idleCount,
            waitingClients: pool.waitingCount,
        };
    } catch (error) {
        console.error('Database health check failed:', error);
        return {
            healthy: false,
            totalConnections: pool.totalCount,
            idleConnections: pool.idleCount,
            waitingClients: pool.waitingCount,
        };
    }
}

// Graceful shutdown
export async function closeDatabasePool(): Promise<void> {
    console.log('Closing database pool...');
    await pool.end();
    console.log('Database pool closed');
}

// Handle process termination
process.on('SIGINT', async () => {
    await closeDatabasePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closeDatabasePool();
    process.exit(0);
});
