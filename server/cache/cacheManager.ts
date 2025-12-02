/**
 * Cache Manager - Phase 7
 * Multi-level caching for performance
 */

export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: Date;
  hits: number;
  createdAt: Date;
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  memoryUsage: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private totalHits: number = 0;
  private totalMisses: number = 0;
  private readonly maxSize: number = 1000; // Max entries
  private readonly defaultTtl: number = 3600000; // 1 hour default

  /**
   * Set cache entry
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    if (!key) {
      throw new Error("Cache key is required");
    }

    const ttl = ttlMs ?? this.defaultTtl;

    // Evict oldest if at max size
    if (this.cache.size >= this.maxSize) {
      const oldest = Array.from(this.cache.values()).sort((a, b) =>
        a.createdAt.getTime() - b.createdAt.getTime()
      )[0];
      if (oldest) {
        this.cache.delete(oldest.key);
      }
    }

    this.cache.set(key, {
      key,
      value,
      expiresAt: new Date(Date.now() + ttl),
      hits: 0,
      createdAt: new Date(),
    });
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    if (!key) {
      throw new Error("Cache key is required");
    }

    const entry = this.cache.get(key);

    if (!entry) {
      this.totalMisses++;
      return null;
    }

    // Check expiration
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      this.totalMisses++;
      return null;
    }

    entry.hits++;
    this.totalHits++;
    return entry.value as T;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    if (!key) {
      throw new Error("Cache key is required");
    }

    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.totalHits = 0;
    this.totalMisses = 0;
  }

  /**
   * Get cache stats
   */
  getStats(): CacheStats {
    const total = this.totalHits + this.totalMisses;
    return {
      totalEntries: this.cache.size,
      hitRate: total > 0 ? (this.totalHits / total) * 100 : 0,
      totalHits: this.totalHits,
      totalMisses: this.totalMisses,
      memoryUsage: this.cache.size * 1024, // Rough estimate
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    let count = 0;
    const now = new Date();

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Get entry by key
   */
  has(key: string): boolean {
    if (!key) {
      return false;
    }
    return this.cache.has(key);
  }
}

export const cacheManager = new CacheManager();
