import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { tenants } from '@shared/schema';
import type { Tenant, InsertTenant } from '@shared/schema';
import { CacheService } from '../../../cache/cache.service';

const CACHE_PREFIX = 'tenant';
const CACHE_TTL = 3600; // 1 hour

@Injectable()
export class TenantsService {
    constructor(
        @Inject('DATABASE') private db: NodePgDatabase<Record<string, unknown>>,
        private cacheService: CacheService,
    ) { }

    async findAll(query?: any): Promise<{ data: Tenant[] }> {
        // Try cache first
        const cacheKey = `all:${JSON.stringify(query || {})}`;
        const cached = await this.cacheService.get<Tenant[]>(cacheKey, CACHE_PREFIX);

        if (cached) {
            return { data: cached };
        }

        // Fetch from database
        const allTenants = await this.db.select().from(tenants);

        let filtered = allTenants;

        // Apply filters if provided
        if (query?.status) {
            filtered = filtered.filter(t => t.status === query.status);
        }

        // Cache the result
        await this.cacheService.set(cacheKey, filtered, { prefix: CACHE_PREFIX, ttl: CACHE_TTL });

        return { data: filtered };
    }

    async findById(id: string): Promise<{ data: Tenant }> {
        // Try cache first
        const cacheKey = `id:${id}`;
        const cached = await this.cacheService.get<Tenant>(cacheKey, CACHE_PREFIX);

        if (cached) {
            return { data: cached };
        }

        // Fetch from database
        const [tenant] = await this.db
            .select()
            .from(tenants)
            .where(eq(tenants.id, id))
            .limit(1);

        if (!tenant) {
            throw new NotFoundException(`Tenant ${id} not found`);
        }

        // Cache the result
        await this.cacheService.set(cacheKey, tenant, { prefix: CACHE_PREFIX, ttl: CACHE_TTL });

        return { data: tenant };
    }

    async create(data: Partial<InsertTenant>): Promise<{ data: Tenant }> {
        const [newTenant] = await this.db
            .insert(tenants)
            .values({
                name: data.name || '',
                slug: data.slug || '',
                status: data.status || 'active',
            })
            .returning();

        // Invalidate cache
        await this.cacheService.invalidateByPrefix(CACHE_PREFIX);

        return { data: newTenant };
    }

    async update(id: string, data: Partial<InsertTenant>): Promise<{ data: Tenant }> {
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.slug) updateData.slug = data.slug;
        if (data.status) updateData.status = data.status;

        updateData.updatedAt = new Date();

        const [updatedTenant] = await this.db
            .update(tenants)
            .set(updateData)
            .where(eq(tenants.id, id))
            .returning();

        if (!updatedTenant) {
            throw new NotFoundException(`Tenant ${id} not found`);
        }

        // Invalidate cache
        await this.cacheService.delete(`id:${id}`, CACHE_PREFIX);
        await this.cacheService.invalidateByPrefix(CACHE_PREFIX);

        return { data: updatedTenant };
    }

    async delete(id: string): Promise<{ data: { success: boolean } }> {
        const [deletedTenant] = await this.db
            .delete(tenants)
            .where(eq(tenants.id, id))
            .returning();

        if (!deletedTenant) {
            throw new NotFoundException(`Tenant ${id} not found`);
        }

        // Invalidate cache
        await this.cacheService.delete(`id:${id}`, CACHE_PREFIX);
        await this.cacheService.invalidateByPrefix(CACHE_PREFIX);

        return { data: { success: true } };
    }
}
