import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

@Injectable()
export class InventoryOrganizationService {
    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async create(dto: any) {
        const [org] = await this.db.insert(schema.inventoryOrganizations).values({
            code: dto.code,
            name: dto.name,
            active: dto.active ?? true,
        }).returning();
        return org;
    }

    async findAll(limit?: number, offset?: number) {
        // Drizzle doesn't support findAndCount directly in one query efficiently without raw SQL count
        // For now, simpler query
        const orgs = await this.db.select().from(schema.inventoryOrganizations).limit(limit || 100).offset(offset || 0);
        const total = (await this.db.select({ count: schema.sql`count(*)` }).from(schema.inventoryOrganizations))[0].count;
        return { data: orgs, total: Number(total) };
    }

    async findOne(id: string) {
        const [org] = await this.db.select().from(schema.inventoryOrganizations).where(eq(schema.inventoryOrganizations.id, id));
        if (!org) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }
        return org;
    }

    async remove(id: string) {
        const result = await this.db.delete(schema.inventoryOrganizations).where(eq(schema.inventoryOrganizations.id, id)).returning();
        if (result.length === 0) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }
    }
}
