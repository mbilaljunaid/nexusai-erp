import { PoolConfig } from 'pg';

export const databaseConfig: PoolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'nexusai_erp',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',

    // Connection Pool Settings
    min: parseInt(process.env.DB_POOL_MIN || '2', 10), // Minimum connections
    max: parseInt(process.env.DB_POOL_MAX || '10', 10), // Maximum connections
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10), // 30 seconds
    connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '5000', 10), // 5 seconds

    // SSL Configuration (for production)
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false, // Set to true in production with proper certs
    } : false,
};

export const getDatabaseUrl = (): string => {
    return process.env.DATABASE_URL ||
        `postgresql://${databaseConfig.user}:${databaseConfig.password}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`;
};
