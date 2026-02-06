import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, like, and, isNotNull, desc, sql } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema/index.ts';

@Injectable()
export class LotService {
    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    async create(data: any) {
        // Lots are now often auto-created via transactions or reception, 
        // but if we need master data creation:
        const [lot] = await this.db.insert(schema.inventoryLotSerial).values({
            inventoryId: data.item?.id || data.inventoryId,
            lotNumber: data.lotNumber,
            status: data.status || 'ACTIVE',
            quantity: data.quantity?.toString() || '0',
            expirationDate: data.expirationDate ? new Date(data.expirationDate) : null
        }).returning();
        return lot;
    }

    async findAll(query: { limit?: number; offset?: number; search?: string; status?: string; itemId?: string }) {
        const limit = query.limit || 25;
        const offset = query.offset || 0;

        const filters = [isNotNull(schema.inventoryLotSerial.lotNumber)];

        if (query.status) filters.push(eq(schema.inventoryLotSerial.status, query.status));
        if (query.itemId) filters.push(eq(schema.inventoryLotSerial.inventoryId, query.itemId));
        if (query.search) filters.push(like(schema.inventoryLotSerial.lotNumber, `%${query.search}%`));

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
        const [lot] = await this.db.select()
            .from(schema.inventoryLotSerial)
            .where(eq(schema.inventoryLotSerial.id, id));
        return lot || null;
    }

    async update(id: string, data: any) {
        const [lot] = await this.db.update(schema.inventoryLotSerial)
            .set({
                status: data.status,
                expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined
            })
            .where(eq(schema.inventoryLotSerial.id, id))
            .returning();
        return lot || null;
    }

    async remove(id: string): Promise<void> {
        await this.db.delete(schema.inventoryLotSerial)
            .where(eq(schema.inventoryLotSerial.id, id));
    }
}
