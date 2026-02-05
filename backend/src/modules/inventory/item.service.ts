import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

@Injectable()
export class ItemService {
    private readonly logger = new Logger(ItemService.name);

    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async create(dto: any) {
        // Check organization if provided
        if (dto.organizationId) {
            const [org] = await this.db.select().from(schema.inventoryOrganizations).where(eq(schema.inventoryOrganizations.id, dto.organizationId));
            if (!org) {
                // handle missing org if strict constraint needed, or let DB foreign key handle it eventually
                // For now, mimicking previous logic which just "found" it.
            }
        }

        const [item] = await this.db.insert(schema.inventory).values({
            itemNumber: dto.itemNumber,
            description: dto.description,
            organizationId: dto.organizationId,
            primaryUomCode: dto.primaryUomCode,
            quantityOnHand: dto.quantityOnHand?.toString() || '0',
            minQuantity: dto.minQuantity?.toString() || '0',
            maxQuantity: dto.maxQuantity?.toString() || '0',
        }).returning();

        return item;
    }

    async findAll(limit?: number, offset?: number) {
        const items = await this.db.select().from(schema.inventory)
            .limit(limit || 100)
            .offset(offset || 0)
            .orderBy(desc(schema.inventory.createdAt));

        // Basic join simulation if needed, but Drizzle join is different. 
        // Returning flat items for now as per previous return structure mostly.
        const total = (await this.db.select({ count: schema.sql`count(*)` }).from(schema.inventory))[0].count;
        return { data: items, total: Number(total) };
    }

    async findOne(id: string) {
        const [item] = await this.db.select().from(schema.inventory).where(eq(schema.inventory.id, id));
        if (!item) {
            throw new NotFoundException(`Item with ID ${id} not found`);
        }
        return item;
    }

    async update(id: string, updateData: any) {
        const updateValues: any = {};
        if (updateData.description) updateValues.description = updateData.description;
        if (updateData.primaryUomCode) updateValues.primaryUomCode = updateData.primaryUomCode;
        if (updateData.quantityOnHand) updateValues.quantityOnHand = updateData.quantityOnHand.toString();

        const [item] = await this.db.update(schema.inventory)
            .set(updateValues)
            .where(eq(schema.inventory.id, id))
            .returning();

        if (!item) throw new NotFoundException(`Item with ID ${id} not found`);
        return item;
    }

    async remove(id: string) {
        const result = await this.db.delete(schema.inventory).where(eq(schema.inventory.id, id)).returning();
        if (result.length === 0) {
            throw new NotFoundException(`Item with ID ${id} not found`);
        }
    }
}
