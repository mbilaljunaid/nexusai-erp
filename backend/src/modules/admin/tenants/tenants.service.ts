import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { tenants } from '@shared/schema/common';
import type { Tenant, InsertTenant } from '@shared/schema/common';

@Injectable()
export class TenantsService {
    constructor(
        @Inject('DATABASE') private db: NodePgDatabase<Record<string, unknown>>,
    ) { }

    async findAll(query?: any): Promise<{ data: Tenant[] }> {
        // For now, return all tenants. Can add filtering later
        const allTenants = await this.db.select().from(tenants);

        let filtered = allTenants;

        // Apply filters if provided
        if (query?.status) {
            filtered = filtered.filter(t => t.status === query.status);
        }

        return { data: filtered };
    }

    async findById(id: string): Promise<{ data: Tenant }> {
        const [tenant] = await this.db
            .select()
            .from(tenants)
            .where(eq(tenants.id, id))
            .limit(1);

        if (!tenant) {
            throw new NotFoundException(`Tenant ${id} not found`);
        }

        return { data: tenant };
    }

    async create(data: InsertTenant): Promise<{ data: Tenant }> {
        const [newTenant] = await this.db
            .insert(tenants)
            .values(data)
            .returning();

        return { data: newTenant };
    }

    async update(id: string, data: Partial<InsertTenant>): Promise<{ data: Tenant }> {
        const [updatedTenant] = await this.db
            .update(tenants)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(tenants.id, id))
            .returning();

        if (!updatedTenant) {
            throw new NotFoundException(`Tenant ${id} not found`);
        }

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

        return { data: { success: true } };
    }
}
