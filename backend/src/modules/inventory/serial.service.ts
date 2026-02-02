import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Serial } from './entities/serial.entity';

@Injectable()
export class SerialService {
    constructor(
        @InjectRepository(Serial)
        private readonly serialRepository: Repository<Serial>,
    ) { }

    async create(data: Partial<Serial>): Promise<Serial> {
        const serial = this.serialRepository.create(data);
        return await this.serialRepository.save(serial);
    }

    async findAll(query: { limit?: number; offset?: number; search?: string; status?: string; itemId?: string }) {
        const take = query.limit || 25;
        const skip = query.offset || 0;

        const where: any = {};
        if (query.status) where.status = query.status;
        if (query.itemId) where.item = { id: query.itemId };
        if (query.search) {
            where.serialNumber = Like(`%${query.search}%`);
        }

        const [data, total] = await this.serialRepository.findAndCount({
            where,
            take,
            skip,
            relations: ['item', 'organization'],
            order: { createdAt: 'DESC' }
        });

        return { data, total };
    }

    async findOne(id: string): Promise<Serial | null> {
        return await this.serialRepository.findOne({
            where: { id },
            relations: ['item', 'organization']
        });
    }

    async update(id: string, data: Partial<Serial>): Promise<Serial | null> {
        await this.serialRepository.update(id, data);
        return await this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.serialRepository.delete(id);
    }
}
