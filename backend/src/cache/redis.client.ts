import Redis from 'ioredis';

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
};

// Create Redis client
export const redisClient = new Redis(redisConfig);

// Event handlers
redisClient.on('connect', () => {
    console.log('✅ Redis client connected');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis client error:', err);
});

redisClient.on('ready', () => {
    console.log('✅ Redis client ready');
});

// Health check
export async function checkRedisHealth(): Promise<{ healthy: boolean; latency?: number }> {
    try {
        const start = Date.now();
        await redisClient.ping();
        const latency = Date.now() - start;
        return { healthy: true, latency };
    } catch (error) {
        console.error('Redis health check failed:', error);
        return { healthy: false };
    }
}

// Graceful shutdown
export async function closeRedisConnection(): Promise<void> {
    console.log('Closing Redis connection...');
    await redisClient.quit();
    console.log('Redis connection closed');
}

// Handle process termination
process.on('SIGINT', async () => {
    await closeRedisConnection();
});

process.on('SIGTERM', async () => {
    await closeRedisConnection();
});
