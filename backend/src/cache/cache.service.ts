import { Injectable } from '@nestjs/common';
import { redisClient } from './redis.client';

export interface CacheOptions {
    ttl?: number; // Time to live in seconds
    prefix?: string; // Key prefix
}

@Injectable()
export class CacheService {
    private readonly defaultTTL = 3600; // 1 hour default
    private isRedisAvailable = true;

    constructor() {
        // Check Redis availability on startup
        this.checkRedisAvailability();
    }

    private async checkRedisAvailability() {
        try {
            await redisClient.ping();
            this.isRedisAvailable = true;
            console.log('✅ Redis cache available');
        } catch (error) {
            this.isRedisAvailable = false;
            console.warn('⚠️  Redis not available - caching disabled');
        }
    }

    /**
     * Get value from cache
     */
    async get<T>(key: string, prefix?: string): Promise<T | null> {
        if (!this.isRedisAvailable) return null;

        try {
            const fullKey = this.buildKey(key, prefix);
            const value = await redisClient.get(fullKey);

            if (!value) {
                return null;
            }

            return JSON.parse(value) as T;
        } catch (error) {
            console.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Set value in cache
     */
    async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
        if (!this.isRedisAvailable) return;

        try {
            const fullKey = this.buildKey(key, options?.prefix);
            const ttl = options?.ttl || this.defaultTTL;

            await redisClient.setex(fullKey, ttl, JSON.stringify(value));
        } catch (error) {
            console.error(`Cache set error for key ${key}:`, error);
        }
    }

    /**
     * Delete value from cache
     */
    async delete(key: string, prefix?: string): Promise<void> {
        if (!this.isRedisAvailable) return;

        try {
            const fullKey = this.buildKey(key, prefix);
            await redisClient.del(fullKey);
        } catch (error) {
            console.error(`Cache delete error for key ${key}:`, error);
        }
    }

    /**
     * Delete all keys matching pattern
     */
    async deletePattern(pattern: string): Promise<void> {
        if (!this.isRedisAvailable) return;

        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
        } catch (error) {
            console.error(`Cache delete pattern error for ${pattern}:`, error);
        }
    }

    /**
     * Check if key exists
     */
    async exists(key: string, prefix?: string): Promise<boolean> {
        if (!this.isRedisAvailable) return false;

        try {
            const fullKey = this.buildKey(key, prefix);
            const result = await redisClient.exists(fullKey);
            return result === 1;
        } catch (error) {
            console.error(`Cache exists error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Get or set pattern (cache-aside)
     */
    async getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        options?: CacheOptions
    ): Promise<T> {
        // Try to get from cache
        const cached = await this.get<T>(key, options?.prefix);
        if (cached !== null) {
            return cached;
        }

        // Fetch from source
        const value = await fetchFn();

        // Store in cache
        await this.set(key, value, options);

        return value;
    }

    /**
     * Invalidate cache by prefix
     */
    async invalidateByPrefix(prefix: string): Promise<void> {
        await this.deletePattern(`${prefix}:*`);
    }

    /**
     * Build full cache key
     */
    private buildKey(key: string, prefix?: string): string {
        return prefix ? `${prefix}:${key}` : key;
    }

    /**
     * Clear all cache (use with caution!)
     */
    async clearAll(): Promise<void> {
        if (!this.isRedisAvailable) return;

        try {
            await redisClient.flushdb();
            console.log('Cache cleared');
        } catch (error) {
            console.error('Cache clear error:', error);
        }
    }
}
