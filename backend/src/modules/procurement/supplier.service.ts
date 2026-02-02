import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { SupplierSite } from './entities/supplier-site.entity';

@Injectable()
export class SupplierService {
    private readonly logger = new Logger(SupplierService.name);

    constructor(
        @InjectRepository(Supplier)
        private supplierRepository: Repository<Supplier>,
        @InjectRepository(SupplierSite)
        private siteRepository: Repository<SupplierSite>,
    ) { }

    async create(createSupplierDto: any): Promise<Supplier> {
        // In real app use specific DTO
        this.logger.log(`Creating supplier: ${createSupplierDto.supplierName}`);
        const supplier = this.supplierRepository.create(createSupplierDto);
        return this.supplierRepository.save(supplier);
    }

    async findAll(query?: { search?: string; limit?: number; offset?: number }): Promise<{ data: Supplier[]; total: number }> {
        const qb = this.supplierRepository.createQueryBuilder('supplier')
            .leftJoinAndSelect('supplier.sites', 'site')
            .orderBy('supplier.createdAt', 'DESC');

        if (query?.search) {
            qb.where('supplier.supplierName ILIKE :search OR supplier.supplierNumber ILIKE :search', { search: `%${query.search}%` });
        }

        if (query?.limit) {
            qb.take(query.limit);
        }

        if (query?.offset) {
            qb.skip(query.offset);
        }

        const [data, total] = await qb.getManyAndCount();
        return { data, total };
    }

    async findOne(id: string): Promise<Supplier> {
        const supplier = await this.supplierRepository.findOne({
            where: { id },
            relations: ['sites'],
        });
        if (!supplier) {
            throw new NotFoundException(`Supplier with ID ${id} not found`);
        }
        return supplier;
    }

    async update(id: string, updateData: any): Promise<Supplier> {
        const supplier = await this.findOne(id);
        Object.assign(supplier, updateData);
        return this.supplierRepository.save(supplier);
    }

    async remove(id: string): Promise<void> {
        const result = await this.supplierRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Supplier with ID ${id} not found`);
        }
    }

    async addSite(supplierId: string, siteData: any): Promise<SupplierSite> {
        const supplier = await this.findOne(supplierId);
        const site = this.siteRepository.create({
            ...siteData,
            supplier,
        });
        return this.siteRepository.save(site);
    }

    async getSites(supplierId: string): Promise<SupplierSite[]> {
        return this.siteRepository.find({
            where: { supplier: { id: supplierId } },
            order: { createdAt: 'DESC' }
        });
    }

    async updateSite(siteId: string, updateData: any): Promise<SupplierSite> {
        const site = await this.siteRepository.findOne({ where: { id: siteId } });
        if (!site) throw new NotFoundException(`Site with ID ${siteId} not found`);
        Object.assign(site, updateData);
        return this.siteRepository.save(site);
    }

    async removeSite(siteId: string): Promise<void> {
        const result = await this.siteRepository.delete(siteId);
        if (result.affected === 0) {
            throw new NotFoundException(`Site with ID ${siteId} not found`);
        }
    }
}
