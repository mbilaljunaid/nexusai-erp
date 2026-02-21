/**
 * Feature Flag Service — per-tenant, per-module
 *
 * Reads from the `feature_flags` table which has been extended with:
 *   tenant_id   VARCHAR — NULL = global (applies to all tenants)
 *   module      VARCHAR — e.g. 'AP', 'AR', 'GL', 'HR', 'ALL'
 *   rollout_pct INTEGER — 0-100 gradual rollout percentage
 */

import { db } from '../../db';
import { featureFlags } from '../../../shared/schema/admin';
import { eq } from 'drizzle-orm';

interface FeatureFlagRow {
    id: string;
    name: string;
    description: string | null;
    enabled: boolean;
    tenantId: string | null;
    module: string | null;
    rolloutPct: number;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export class FeatureFlagService {

    /**
     * List flags, optionally filtered by tenant_id and/or module.
     */
    async list(tenantId?: string, module?: string): Promise<FeatureFlagRow[]> {
        // Build WHERE: (tenant_id IS NULL OR tenant_id = tenantId)
        //              AND (module IS NULL OR module = module OR module = 'ALL')
        const rows = await db.select().from(featureFlags);

        return rows
            .filter((f: any) => {
                const tenantOk = !tenantId || f.tenantId === null || f.tenantId === tenantId;
                const moduleOk = !module || f.module === null || f.module === module || f.module === 'ALL';
                return tenantOk && moduleOk;
            })
            .map((f: any) => ({
                ...f,
                rolloutPct: (f as any).rolloutPct ?? 100,
            })) as FeatureFlagRow[];
    }

    /**
     * Evaluate whether a feature flag is active for a given tenant.
     * Rolls out based on rollout_pct using a deterministic hash of tenantId.
     */
    async evaluate(flagName: string, tenantId?: string): Promise<boolean> {
        const rows = await db
            .select()
            .from(featureFlags)
            .where(eq(featureFlags.name, flagName));

        if (rows.length === 0) return false;

        // Prefer tenant-specific override, fall back to global
        const row = (rows.find((r: any) => r.tenantId === tenantId) || rows.find((r: any) => r.tenantId === null) || rows[0]) as any;

        if (!row.enabled) return false;

        const pct = row.rolloutPct ?? 100;
        if (pct >= 100) return true;
        if (pct <= 0) return false;

        // Deterministic hash: simple checksum of flagName+tenantId mod 100
        const hash = [...`${flagName}:${tenantId ?? 'global'}`].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) % 100, 0);
        return hash < pct;
    }

    /**
     * Create a new feature flag.
     */
    async create(data: {
        name: string;
        description?: string;
        enabled?: boolean;
        tenantId?: string;
        module?: string;
        rolloutPct?: number;
    }): Promise<FeatureFlagRow> {
        const [row] = await db
            .insert(featureFlags)
            .values({
                name: data.name,
                description: data.description,
                enabled: data.enabled ?? false,
                ...(data.tenantId !== undefined && { tenantId: data.tenantId } as any),
                ...(data.module !== undefined && { module: data.module } as any),
                ...(data.rolloutPct !== undefined && { rolloutPct: data.rolloutPct } as any),
            } as any)
            .returning();
        return row as any;
    }

    /**
     * Toggle a flag's enabled status.
     */
    async toggle(id: string): Promise<FeatureFlagRow> {
        // Read current
        const [current] = await db.select().from(featureFlags).where(eq(featureFlags.id, id));
        if (!current) throw new Error(`Feature flag ${id} not found`);

        const [updated] = await db
            .update(featureFlags)
            .set({ enabled: !current.enabled, updatedAt: new Date() })
            .where(eq(featureFlags.id, id))
            .returning();
        return updated as any;
    }

    /**
     * Update a flag.
     */
    async update(id: string, data: Partial<{
        name: string;
        description: string;
        enabled: boolean;
        tenantId: string | null;
        module: string;
        rolloutPct: number;
    }>): Promise<FeatureFlagRow> {
        const [updated] = await db
            .update(featureFlags)
            .set({ ...data as any, updatedAt: new Date() })
            .where(eq(featureFlags.id, id))
            .returning();
        return updated as any;
    }

    /**
     * Delete a flag.
     */
    async delete(id: string): Promise<void> {
        await db.delete(featureFlags).where(eq(featureFlags.id, id));
    }
}

export const featureFlagService = new FeatureFlagService();
