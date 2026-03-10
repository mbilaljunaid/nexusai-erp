import { Injectable } from '@nestjs/common';
import { redisClient } from './redis.client';

export interface CacheOptions {
    ttl?: number; // Time to live in seconds
    namespace?: string; // Key namespace for organization
}

export interface CacheStats {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
}

@Injectable()
export class CacheManagerService {
    private stats: CacheStats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
    };

    private readonly defaultTTL = parseInt(process.env.CACHE_TTL_DEFAULT || '3600', 10);

    /**
     * Build a namespaced cache key
     */
    private buildKey(key: string, namespace?: string): string {
        return namespace ? `${namespace}:${key}` : key;
    }

    /**
     * Get a value from cache
     */
    async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
        try {
            const fullKey = this.buildKey(key, options?.namespace);
            const value = await redisClient.get(fullKey);

            if (value === null) {
                this.stats.misses++;
                return null;
            }

            this.stats.hits++;
            return JSON.parse(value) as T;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Set a value in cache
     */
    async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
        try {
            const fullKey = this.buildKey(key, options?.namespace);
            const ttl = options?.ttl || this.defaultTTL;
            const serialized = JSON.stringify(value);

            await redisClient.setex(fullKey, ttl, serialized);
            this.stats.sets++;
            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    /**
     * Delete a value from cache
     */
    async delete(key: string, options?: CacheOptions): Promise<boolean> {
        try {
            const fullKey = this.buildKey(key, options?.namespace);
            const result = await redisClient.del(fullKey);
            this.stats.deletes++;
            return result > 0;
        } catch (error) {
            console.error('Cache delete error:', error);
            return false;
        }
    }

    /**
     * Invalidate all keys matching a pattern
     */
    async invalidatePattern(pattern: string, namespace?: string): Promise<number> {
        try {
            const fullPattern = this.buildKey(pattern, namespace);
            const keys = await redisClient.keys(fullPattern);

            if (keys.length === 0) {
                return 0;
            }

            const result = await redisClient.del(...keys);
            this.stats.deletes += result;
            return result;
        } catch (error) {
            console.error('Cache invalidate pattern error:', error);
            return 0;
        }
    }

    /**
     * Get multiple values from cache
     */
    async mget<T>(keys: string[], options?: CacheOptions): Promise<(T | null)[]> {
        try {
            const fullKeys = keys.map(key => this.buildKey(key, options?.namespace));
            const values = await redisClient.mget(...fullKeys);

            return values.map(value => {
                if (value === null) {
                    this.stats.misses++;
                    return null;
                }
                this.stats.hits++;
                return JSON.parse(value) as T;
            });
        } catch (error) {
            console.error('Cache mget error:', error);
            return keys.map(() => null);
        }
    }

    /**
     * Set multiple values in cache
     */
    async mset<T>(entries: Array<{ key: string; value: T }>, options?: CacheOptions): Promise<boolean> {
        try {
            const pipeline = redisClient.pipeline();
            const ttl = options?.ttl || this.defaultTTL;

            for (const entry of entries) {
                const fullKey = this.buildKey(entry.key, options?.namespace);
                const serialized = JSON.stringify(entry.value);
                pipeline.setex(fullKey, ttl, serialized);
            }

            await pipeline.exec();
            this.stats.sets += entries.length;
            return true;
        } catch (error) {
            console.error('Cache mset error:', error);
            return false;
        }
    }

    /**
     * Check if a key exists in cache
     */
    async exists(key: string, options?: CacheOptions): Promise<boolean> {
        try {
            const fullKey = this.buildKey(key, options?.namespace);
            const result = await redisClient.exists(fullKey);
            return result === 1;
        } catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats {
        return { ...this.stats };
    }

    /**
     * Reset cache statistics
     */
    resetStats(): void {
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
        };
    }

    /**
     * Clear all cache (use with caution!)
     */
    async clearAll(): Promise<boolean> {
        try {
            await redisClient.flushdb();
            return true;
        } catch (error) {
            console.error('Cache clear all error:', error);
            return false;
        }
    }
}
