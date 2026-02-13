import { db } from '@/lib/db';
import { systemConfig, featureFlags } from '@/lib/db/schema/admin';
import { eq } from 'drizzle-orm';

export class SystemConfigService {
    /**
     * Get configuration value
     */
    static async get(key: string) {
        const [config] = await db.select()
            .from(systemConfig)
            .where(eq(systemConfig.key, key));

        return config?.value;
    }

    /**
     * Set configuration value
     */
    static async set(key: string, value: any, category?: string, description?: string, updatedBy?: string) {
        const [config] = await db.insert(systemConfig).values({
            key,
            value,
            category,
            description,
            updatedBy,
        })
            .onConflictDoUpdate({
                target: systemConfig.key,
                set: {
                    value,
                    category,
                    description,
                    updatedBy,
                    updatedAt: new Date(),
                },
            })
            .returning();

        return config;
    }

    /**
     * Get all configurations
     */
    static async getAll(category?: string) {
        if (category) {
            return db.select()
                .from(systemConfig)
                .where(eq(systemConfig.category, category));
        }
        return db.select().from(systemConfig);
    }

    /**
     * Delete configuration
     */
    static async delete(key: string) {
        await db.delete(systemConfig)
            .where(eq(systemConfig.key, key));
    }
}

export class FeatureFlagService {
    /**
     * Check if feature is enabled
     */
    static async isEnabled(name: string): Promise<boolean> {
        const [flag] = await db.select()
            .from(featureFlags)
            .where(eq(featureFlags.name, name));

        return flag?.enabled || false;
    }

    /**
     * Enable feature flag
     */
    static async enable(name: string) {
        const [flag] = await db.update(featureFlags)
            .set({
                enabled: true,
                updatedAt: new Date()
            })
            .where(eq(featureFlags.name, name))
            .returning();

        return flag;
    }

    /**
     * Disable feature flag
     */
    static async disable(name: string) {
        const [flag] = await db.update(featureFlags)
            .set({
                enabled: false,
                updatedAt: new Date()
            })
            .where(eq(featureFlags.name, name))
            .returning();

        return flag;
    }

    /**
     * Get all feature flags
     */
    static async getAll() {
        return db.select().from(featureFlags);
    }

    /**
     * Create feature flag
     */
    static async create(name: string, enabled: boolean = false, description?: string) {
        const [flag] = await db.insert(featureFlags).values({
            name,
            enabled,
            description,
        }).returning();

        return flag;
    }
}
