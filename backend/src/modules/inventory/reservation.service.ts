import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema/index';

export interface CreateReservationDto {
    organizationId: string;
    itemId: string;
    demandSourceType: string;
    demandSourceHeaderId: string;
    demandSourceLineId?: string;
    quantity: number;
    uom?: string;
    subinventoryId?: string;
    locatorId?: string;
    lotId?: string;
    serialId?: string;
}

@Injectable()
export class ReservationService {
    private readonly logger = new Logger(ReservationService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    async createReservation(dto: CreateReservationDto) {
        // 1. Check Availability (ATP Check)
        const availableQty = await this.calculateAvailableQuantity(
            dto.organizationId,
            dto.itemId,
            dto.subinventoryId,
            dto.locatorId,
            dto.lotId
        );

        if (availableQty < dto.quantity) {
            throw new BadRequestException(`Insufficient Available Quantity. Requested: ${dto.quantity}, Available: ${availableQty}`);
        }

        // 2. Create Reservation
        const [reservation] = await this.db.insert(schema.inventoryReservations).values({
            organizationId: dto.organizationId,
            itemId: dto.itemId,
            demandSourceType: dto.demandSourceType,
            demandSourceHeaderId: dto.demandSourceHeaderId,
            demandSourceLineId: dto.demandSourceLineId,
            subinventoryId: dto.subinventoryId,
            locatorId: dto.locatorId,
            lotId: dto.lotId,
            serialId: dto.serialId,
            quantity: dto.quantity.toString(),
            uom: dto.uom || 'EA',
            reservationType: dto.subinventoryId ? 'Hard' : 'Soft',
        }).returning();

        return reservation;
    }

    async calculateAvailableQuantity(orgId: string, itemId: string, subinvId?: string, locatorId?: string, lotId?: string): Promise<number> {
        // A. Get On Hand
        const onHandFilters = [
            eq(schema.inventoryOnHandQuantities.organizationId, orgId),
            eq(schema.inventoryOnHandQuantities.itemId, itemId)
        ];
        if (subinvId) onHandFilters.push(eq(schema.inventoryOnHandQuantities.subinventoryId, subinvId));
        if (locatorId) onHandFilters.push(eq(schema.inventoryOnHandQuantities.locatorId, locatorId));
        if (lotId) onHandFilters.push(eq(schema.inventoryOnHandQuantities.lotNumber, lotId)); // Assuming lotId maps to lotNumber

        const [onHandResult] = await this.db.select({
            total: sql<number>`SUM(${schema.inventoryOnHandQuantities.quantity})`
        })
            .from(schema.inventoryOnHandQuantities)
            .where(and(...onHandFilters));

        const onHand = Number(onHandResult?.total || 0);

        // B. Get Existing Reservations
        const resFilters = [
            eq(schema.inventoryReservations.organizationId, orgId),
            eq(schema.inventoryReservations.itemId, itemId)
        ];
        if (subinvId) resFilters.push(eq(schema.inventoryReservations.subinventoryId, subinvId));
        if (locatorId) resFilters.push(eq(schema.inventoryReservations.locatorId, locatorId));
        if (lotId) resFilters.push(eq(schema.inventoryReservations.lotId, lotId));

        const [resResult] = await this.db.select({
            total: sql<number>`SUM(${schema.inventoryReservations.quantity})`
        })
            .from(schema.inventoryReservations)
            .where(and(...resFilters));

        const reserved = Number(resResult?.total || 0);

        // ATP = OnHand - Reserved
        return onHand - reserved;
    }
}
