/**
 * BullMQ — shared Redis connection and queue factory
 *
 * All queues in the system share one IORedis connection.
 * Workers are started lazily only when REDIS_URL is configured.
 */

import IORedis from 'ioredis';
import { Queue, Worker, QueueEvents, DefaultJobOptions } from 'bullmq';

// ---------------------------------------------------------------------------
// Redis Connection
// ---------------------------------------------------------------------------

let _redisConnection: IORedis | null = null;

export function getRedisConnection(): IORedis {
    if (!_redisConnection) {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        _redisConnection = new IORedis(redisUrl, {
            maxRetriesPerRequest: null, // required by BullMQ
            enableReadyCheck: false,
        });
        _redisConnection.on('error', (err) => {
            console.error('[BullMQ] Redis connection error:', err.message);
        });
        _redisConnection.on('connect', () => {
            console.log('[BullMQ] Redis connected');
        });
    }
    return _redisConnection;
}

// ---------------------------------------------------------------------------
// Queue Factory
// ---------------------------------------------------------------------------

const defaultJobOptions: DefaultJobOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 200 },
};

const _queues = new Map<string, Queue>();

export function createQueue(name: string): Queue {
    if (!_queues.has(name)) {
        const q = new Queue(name, {
            connection: getRedisConnection(),
            defaultJobOptions,
        });
        _queues.set(name, q);
        console.log(`[BullMQ] Queue '${name}' initialized`);
    }
    return _queues.get(name)!;
}

export function createWorker<T = any>(
    queueName: string,
    processor: (job: import('bullmq').Job<T>) => Promise<any>,
    concurrency = 5,
): Worker<T> {
    const worker = new Worker<T>(queueName, processor, {
        connection: getRedisConnection(),
        concurrency,
    });
    worker.on('completed', (job) => {
        console.log(`[BullMQ:${queueName}] ✅ Job ${job.id} completed`);
    });
    worker.on('failed', (job, err) => {
        console.error(`[BullMQ:${queueName}] ❌ Job ${job?.id} failed:`, err.message);
    });
    return worker;
}

export function createQueueEvents(queueName: string): QueueEvents {
    return new QueueEvents(queueName, { connection: getRedisConnection() });
}

// ---------------------------------------------------------------------------
// Graceful Shutdown
// ---------------------------------------------------------------------------

export async function closeAllQueues() {
    for (const [name, q] of _queues.entries()) {
        await q.close();
        console.log(`[BullMQ] Queue '${name}' closed`);
    }
    if (_redisConnection) {
        await _redisConnection.quit();
        _redisConnection = null;
    }
}
