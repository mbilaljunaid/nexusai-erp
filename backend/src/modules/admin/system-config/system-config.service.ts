import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { systemConfig, featureFlags } from '@shared/schema/admin';
import type { SystemConfig, InsertSystemConfig, FeatureFlag, InsertFeatureFlag } from '@shared/schema/admin';

@Injectable()
export class SystemConfigService {
    constructor(
        @Inject('DATABASE') private db: NodePgDatabase<Record<string, unknown>>,
    ) { }

    // System Configuration
    async getAllConfig(): Promise<{ data: SystemConfig[] }> {
        const configs = await this.db.select().from(systemConfig);
        return { data: configs };
    }

    async getConfig(key: string): Promise<{ data: SystemConfig }> {
        const [config] = await this.db
            .select()
            .from(systemConfig)
            .where(eq(systemConfig.key, key))
            .limit(1);

        if (!config) {
            throw new NotFoundException(`Config ${key} not found`);
        }

        return { data: config };
    }

    async setConfig(key: string, value: any, category?: string, description?: string): Promise<{ data: SystemConfig }> {
        // Try to find existing config
        const [existing] = await this.db
            .select()
            .from(systemConfig)
            .where(eq(systemConfig.key, key))
            .limit(1);

        if (existing) {
            // Update existing
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

            return { data: updated };
        } else {
            // Create new
            const [newConfig] = await this.db
                .insert(systemConfig)
                .values({
                    key,
                    value,
                    category,
                    description,
                })
                .returning();

            return { data: newConfig };
        }
    }

    async deleteConfig(key: string): Promise<{ data: { success: boolean } }> {
        const [deleted] = await this.db
            .delete(systemConfig)
            .where(eq(systemConfig.key, key))
            .returning();

        if (!deleted) {
            throw new NotFoundException(`Config ${key} not found`);
        }

        return { data: { success: true } };
    }

    // Feature Flags
    async getAllFlags(): Promise<{ data: FeatureFlag[] }> {
        const flags = await this.db.select().from(featureFlags);
        return { data: flags };
    }

    async getFlag(name: string): Promise<{ data: FeatureFlag }> {
        const [flag] = await this.db
            .select()
            .from(featureFlags)
            .where(eq(featureFlags.name, name))
            .limit(1);

        if (!flag) {
            throw new NotFoundException(`Feature flag ${name} not found`);
        }

        return { data: flag };
    }

    async createFlag(data: InsertFeatureFlag): Promise<{ data: FeatureFlag }> {
        const [newFlag] = await this.db
            .insert(featureFlags)
            .values(data)
            .returning();

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

        return { data: { success: true } };
    }
}
