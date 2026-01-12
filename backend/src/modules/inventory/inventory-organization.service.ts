import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryOrganization } from './entities/inventory-organization.entity';

@Injectable()
export class InventoryOrganizationService {
    private readonly logger = new Logger(InventoryOrganizationService.name);

    constructor(
        @InjectRepository(InventoryOrganization)
        private orgRepository: Repository<InventoryOrganization>,
    ) { }

    async create(dto: any): Promise<InventoryOrganization> {
        const org = this.orgRepository.create(dto);
        return this.orgRepository.save(org);
    }

    async findAll(): Promise<InventoryOrganization[]> {
        return this.orgRepository.find();
    }

    async findOne(id: string): Promise<InventoryOrganization> {
        const org = await this.orgRepository.findOne({ where: { id } });
        if (!org) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }
        return org;
    }

    async remove(id: string): Promise<void> {
        const result = await this.orgRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }
    }
}
