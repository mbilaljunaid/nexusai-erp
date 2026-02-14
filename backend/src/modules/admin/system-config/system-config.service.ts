import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { systemConfig, featureFlags } from '@shared/schema/admin';
import type { SystemConfig, InsertSystemConfig, FeatureFlag, InsertFeatureFlag } from '@shared/schema/admin';
import { CacheService } from '../../../cache/cache.service';

const CONFIG_CACHE_PREFIX = 'config';
const FLAGS_CACHE_PREFIX = 'flags';
const CACHE_TTL = 7200; // 2 hours (config changes rarely)

@Injectable()
export class SystemConfigService {
    constructor(
        @Inject('DATABASE') private db: NodePgDatabase<Record<string, unknown>>,
        private cacheService: CacheService,
    ) { }

    // System Configuration
    async getAllConfig(): Promise<{ data: SystemConfig[] }> {
        const cacheKey = 'all';
        const cached = await this.cacheService.get<SystemConfig[]>(cacheKey, CONFIG_CACHE_PREFIX);

        if (cached) {
            return { data: cached };
        }

        const configs = await this.db.select().from(systemConfig);

        await this.cacheService.set(cacheKey, configs, { prefix: CONFIG_CACHE_PREFIX, ttl: CACHE_TTL });

        return { data: configs };
    }

    async getConfig(key: string): Promise<{ data: SystemConfig }> {
        const cacheKey = `key:${key}`;
        const cached = await this.cacheService.get<SystemConfig>(cacheKey, CONFIG_CACHE_PREFIX);

        if (cached) {
            return { data: cached };
        }

        const [config] = await this.db
            .select()
            .from(systemConfig)
            .where(eq(systemConfig.key, key))
            .limit(1);

        if (!config) {
            throw new NotFoundException(`Config ${key} not found`);
        }

        await this.cacheService.set(cacheKey, config, { prefix: CONFIG_CACHE_PREFIX, ttl: CACHE_TTL });

        return { data: config };
    }

    async setConfig(key: string, value: any, category?: string, description?: string): Promise<{ data: SystemConfig }> {
        const [existing] = await this.db
            .select()
            .from(systemConfig)
            .where(eq(systemConfig.key, key))
            .limit(1);

        let result: SystemConfig;

        if (existing) {
            const [updated] = await this.db
                .update(systemConfig)
                .set({
                    value,
                    category,
                    description,
                    updatedAt: new Date(),
                })
                .where(eq(systemConfig.key, key))
                .returning();

            result = updated;
        } else {
            const [newConfig] = await this.db
                .insert(systemConfig)
                .values({
                    key,
                    value,
                    category,
                    description,
                })
                .returning();

            result = newConfig;
        }

        // Invalidate cache
        await this.cacheService.delete(`key:${key}`, CONFIG_CACHE_PREFIX);
        await this.cacheService.delete('all', CONFIG_CACHE_PREFIX);

        return { data: result };
    }

    async deleteConfig(key: string): Promise<{ data: { success: boolean } }> {
        const [deleted] = await this.db
            .delete(systemConfig)
            .where(eq(systemConfig.key, key))
            .returning();

        if (!deleted) {
            throw new NotFoundException(`Config ${key} not found`);
        }

        // Invalidate cache
        await this.cacheService.delete(`key:${key}`, CONFIG_CACHE_PREFIX);
        await this.cacheService.delete('all', CONFIG_CACHE_PREFIX);

        return { data: { success: true } };
    }

    // Feature Flags
    async getAllFlags(): Promise<{ data: FeatureFlag[] }> {
        const cacheKey = 'all';
        const cached = await this.cacheService.get<FeatureFlag[]>(cacheKey, FLAGS_CACHE_PREFIX);

        if (cached) {
            return { data: cached };
        }

        const flags = await this.db.select().from(featureFlags);

        await this.cacheService.set(cacheKey, flags, { prefix: FLAGS_CACHE_PREFIX, ttl: CACHE_TTL });

        return { data: flags };
    }

    async getFlag(name: string): Promise<{ data: FeatureFlag }> {
        const cacheKey = `name:${name}`;
        const cached = await this.cacheService.get<FeatureFlag>(cacheKey, FLAGS_CACHE_PREFIX);

        if (cached) {
            return { data: cached };
        }

        const [flag] = await this.db
            .select()
            .from(featureFlags)
            .where(eq(featureFlags.name, name))
            .limit(1);

        if (!flag) {
            throw new NotFoundException(`Feature flag ${name} not found`);
        }

        await this.cacheService.set(cacheKey, flag, { prefix: FLAGS_CACHE_PREFIX, ttl: CACHE_TTL });

        return { data: flag };
    }

    async createFlag(data: InsertFeatureFlag): Promise<{ data: FeatureFlag }> {
        const [newFlag] = await this.db
            .insert(featureFlags)
            .values(data)
            .returning();

        // Invalidate cache
        await this.cacheService.delete('all', FLAGS_CACHE_PREFIX);

        return { data: newFlag };
    }

    async toggleFlag(name: string): Promise<{ data: FeatureFlag }> {
        const [flag] = await this.db
            .select()
            .from(featureFlags)
            .where(eq(featureFlags.name, name))
            .limit(1);

        if (!flag) {
            throw new NotFoundException(`Feature flag ${name} not found`);
        }

        const [updated] = await this.db
            .update(featureFlags)
            .set({
                enabled: !flag.enabled,
                updatedAt: new Date(),
            })
            .where(eq(featureFlags.name, name))
            .returning();

        // Invalidate cache
        await this.cacheService.delete(`name:${name}`, FLAGS_CACHE_PREFIX);
        await this.cacheService.delete('all', FLAGS_CACHE_PREFIX);

        return { data: updated };
    }

    async deleteFlag(name: string): Promise<{ data: { success: boolean } }> {
        const [deleted] = await this.db
            .delete(featureFlags)
            .where(eq(featureFlags.name, name))
            .returning();

        if (!deleted) {
            throw new NotFoundException(`Feature flag ${name} not found`);
        }

        // Invalidate cache
        await this.cacheService.delete(`name:${name}`, FLAGS_CACHE_PREFIX);
        await this.cacheService.delete('all', FLAGS_CACHE_PREFIX);

        return { data: { success: true } };
    }
}
