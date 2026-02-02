import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { OnHandBalance } from './entities/on-hand-balance.entity';
import { InventoryOrganization } from './entities/inventory-organization.entity';
import { Item } from './entities/item.entity';
import { Subinventory } from './entities/subinventory.entity';
import { Locator } from './entities/locator.entity';
import { Lot } from './entities/lot.entity';
import { Serial } from './entities/serial.entity';

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
        @InjectRepository(Reservation)
        private reservationRepo: Repository<Reservation>,
        @InjectRepository(OnHandBalance)
        private balanceRepo: Repository<OnHandBalance>,
        @InjectRepository(Item)
        private itemRepo: Repository<Item>,
    ) { }

    async createReservation(dto: CreateReservationDto): Promise<Reservation> {
        // 1. Check Availability (ATP Check)
        // We must ensure (OnHand - ExistingReservations) >= RequestQty

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
        const reservation = new Reservation();
        reservation.organization = { id: dto.organizationId } as InventoryOrganization;
        reservation.item = { id: dto.itemId } as Item;
        reservation.demandSourceType = dto.demandSourceType;
        reservation.demandSourceHeaderId = dto.demandSourceHeaderId;
        reservation.demandSourceLineId = dto.demandSourceLineId;

        if (dto.subinventoryId) reservation.subinventory = { id: dto.subinventoryId } as Subinventory;
        if (dto.locatorId) reservation.locator = { id: dto.locatorId } as Locator;
        if (dto.lotId) reservation.lot = { id: dto.lotId } as Lot;
        if (dto.serialId) reservation.serial = { id: dto.serialId } as Serial;

        reservation.quantity = dto.quantity;
        reservation.uom = dto.uom || 'EA';
        reservation.reservationType = dto.subinventoryId ? 'Hard' : 'Soft'; // Simple logic for now

        return this.reservationRepo.save(reservation);
    }

    async calculateAvailableQuantity(orgId: string, itemId: string, subinvId?: string, locatorId?: string, lotId?: string): Promise<number> {
        // A. Get On Hand
        const balanceQuery = this.balanceRepo.createQueryBuilder('b')
            .select('SUM(b.quantity)', 'total')
            .where('b.organizationId = :orgId', { orgId })
            .andWhere('b.itemId = :itemId', { itemId });

        if (subinvId) balanceQuery.andWhere('b.subinventoryId = :subinvId', { subinvId });
        if (locatorId) balanceQuery.andWhere('b.locatorId = :locatorId', { locatorId });
        if (lotId) balanceQuery.andWhere('b.lotId = :lotId', { lotId });

        const balanceResult = await balanceQuery.getRawOne();
        const onHand = Number(balanceResult?.total || 0);

        // B. Get Existing Reservations
        const resQuery = this.reservationRepo.createQueryBuilder('r')
            .select('SUM(r.quantity)', 'total')
            .where('r.organizationId = :orgId', { orgId })
            .andWhere('r.itemId = :itemId', { itemId });

        if (subinvId) resQuery.andWhere('r.subinventoryId = :subinvId', { subinvId });
        if (locatorId) resQuery.andWhere('r.locatorId = :locatorId', { locatorId });
        if (lotId) resQuery.andWhere('r.lotId = :lotId', { lotId });

        const resResult = await resQuery.getRawOne();
        const reserved = Number(resResult?.total || 0);

        // ATP = OnHand - Reserved
        return onHand - reserved;
    }
}
