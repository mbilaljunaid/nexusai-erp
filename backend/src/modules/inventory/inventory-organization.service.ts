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
        const org = this.orgRepository.create(dto as any);
        return this.orgRepository.save(org as any) as Promise<InventoryOrganization>;
    }

    async findAll(limit?: number, offset?: number): Promise<{ data: InventoryOrganization[], total: number }> {
        const [orgs, total] = await this.orgRepository.findAndCount({
            take: limit,
            skip: offset,
        });
        return { data: orgs, total };
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
