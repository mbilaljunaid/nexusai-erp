import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { InventoryOrganization } from './entities/inventory-organization.entity';

@Injectable()
export class ItemService {
    private readonly logger = new Logger(ItemService.name);

    constructor(
        @InjectRepository(Item)
        private itemRepository: Repository<Item>,
        @InjectRepository(InventoryOrganization)
        private orgRepository: Repository<InventoryOrganization>,
    ) { }

    async create(dto: any): Promise<Item> {
        // Check organization if provided
        let organization: InventoryOrganization | undefined;
        if (dto.organizationId) {
            organization = await this.orgRepository.findOne({ where: { id: dto.organizationId } }) || undefined;
        }

        const item = this.itemRepository.create({
            ...dto,
            organization,
        });
        return this.itemRepository.save(item);
    }

    async findAll(): Promise<Item[]> {
        return this.itemRepository.find({ relations: ['organization'] });
    }

    async findOne(id: string): Promise<Item> {
        const item = await this.itemRepository.findOne({
            where: { id },
            relations: ['organization'],
        });
        if (!item) {
            throw new NotFoundException(`Item with ID ${id} not found`);
        }
        return item;
    }

    async update(id: string, updateData: any): Promise<Item> {
        const item = await this.findOne(id);
        Object.assign(item, updateData);
        return this.itemRepository.save(item);
    }

    async remove(id: string): Promise<void> {
        const result = await this.itemRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Item with ID ${id} not found`);
        }
    }
}
