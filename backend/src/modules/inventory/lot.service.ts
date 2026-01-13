import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Lot } from './entities/lot.entity';

@Injectable()
export class LotService {
    constructor(
        @InjectRepository(Lot)
        private readonly lotRepository: Repository<Lot>,
    ) { }

    async create(data: Partial<Lot>): Promise<Lot> {
        const lot = this.lotRepository.create(data);
        return await this.lotRepository.save(lot);
    }

    async findAll(query: { limit?: number; offset?: number; search?: string; status?: string; itemId?: string }) {
        const take = query.limit || 25;
        const skip = query.offset || 0;

        const where: any = {};
        if (query.status) where.status = query.status;
        if (query.itemId) where.item = { id: query.itemId };
        if (query.search) {
            where.lotNumber = Like(`%${query.search}%`);
        }

        const [data, total] = await this.lotRepository.findAndCount({
            where,
            take,
            skip,
            relations: ['item', 'organization'],
            order: { createdAt: 'DESC' }
        });

        return { data, total };
    }

    async findOne(id: string): Promise<Lot | null> {
        return await this.lotRepository.findOne({
            where: { id },
            relations: ['item', 'organization']
        });
    }

    async update(id: string, data: Partial<Lot>): Promise<Lot | null> {
        await this.lotRepository.update(id, data);
        return await this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.lotRepository.delete(id);
    }
}
