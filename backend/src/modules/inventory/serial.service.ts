import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, like, and, isNotNull, desc, sql } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema/index';

@Injectable()
export class SerialService {
    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    async create(data: any) {
        const [serial] = await this.db.insert(schema.inventoryLotSerial).values({
            inventoryId: data.item?.id || data.inventoryId,
            serialNumber: data.serialNumber, // Assuming input has serialNumber
            status: data.status || 'ACTIVE',
            quantity: '1', // Serials are always qty 1
        }).returning();
        return serial;
    }

    async findAll(query: { limit?: number; offset?: number; search?: string; status?: string; itemId?: string }) {
        const limit = query.limit || 25;
        const offset = query.offset || 0;

        const filters = [isNotNull(schema.inventoryLotSerial.serialNumber)];

        if (query.status) filters.push(eq(schema.inventoryLotSerial.status, query.status));
        if (query.itemId) filters.push(eq(schema.inventoryLotSerial.inventoryId, query.itemId));
        if (query.search) filters.push(like(schema.inventoryLotSerial.serialNumber, `%${query.search}%`));

        const data = await this.db.select()
            .from(schema.inventoryLotSerial)
            .where(and(...filters))
            .limit(limit)
            .offset(offset)
            .orderBy(desc(schema.inventoryLotSerial.createdAt));

        const [countResult] = await this.db.select({ count: sql<number>`count(*)` })
            .from(schema.inventoryLotSerial)
            .where(and(...filters));

        return { data, total: Number(countResult?.count || 0) };
    }

    async findOne(id: string) {
        const [serial] = await this.db.select()
            .from(schema.inventoryLotSerial)
            .where(eq(schema.inventoryLotSerial.id, id));
        return serial || null;
    }

    async update(id: string, data: any) {
        const [serial] = await this.db.update(schema.inventoryLotSerial)
            .set({
                status: data.status,
            })
            .where(eq(schema.inventoryLotSerial.id, id))
            .returning();
        return serial || null;
    }

    async remove(id: string): Promise<void> {
        await this.db.delete(schema.inventoryLotSerial)
            .where(eq(schema.inventoryLotSerial.id, id));
    }
}
