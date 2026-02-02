import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class PurchaseOrderService {
  private readonly logger = new Logger(PurchaseOrderService.name);

  constructor(
    @InjectRepository(PurchaseOrder)
    private poRepository: Repository<PurchaseOrder>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) { }

  async create(dto: any): Promise<PurchaseOrder> {
    // 1. Resolve Supplier
    let supplier: Supplier | undefined;
    if (dto.supplierId) {
      supplier = await this.supplierRepository.findOne({ where: { id: dto.supplierId } }) || undefined;
    }

    const po = this.poRepository.create({
      ...dto,
      supplier,
      status: 'Draft', // Always start as Draft
    });

    return this.poRepository.save(po);
  }

  async findAll(): Promise<PurchaseOrder[]> {
    return this.poRepository.find({ relations: ['supplier', 'lines'] });
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const po = await this.poRepository.findOne({
      where: { id },
      relations: ['supplier', 'lines', 'lines.distributions'],
    });
    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }
    return po;
  }

  async update(id: string, updateData: any): Promise<PurchaseOrder> {
    const po = await this.findOne(id);
    Object.assign(po, updateData);

    if (updateData.supplierId) {
      const supplier = await this.supplierRepository.findOne({ where: { id: updateData.supplierId } });
      if (supplier) po.supplier = supplier;
    }

    return this.poRepository.save(po);
  }

  async approve(id: string): Promise<PurchaseOrder> {
    const po = await this.findOne(id);
    if (po.status !== 'Draft') {
      throw new Error(`Cannot approve PO in status ${po.status}`);
    }
    po.status = 'Approved';
    return this.poRepository.save(po);
  }

  async open(id: string): Promise<PurchaseOrder> {
    const po = await this.findOne(id);
    if (po.status !== 'Approved') {
      throw new Error(`Cannot open PO in status ${po.status}`);
    }
    po.status = 'Open';
    return this.poRepository.save(po);
  }

  async cancel(id: string): Promise<PurchaseOrder> {
    const po = await this.findOne(id);
    if (po.status === 'Closed' || po.status === 'Cancelled') {
      throw new Error(`Cannot cancel PO in status ${po.status}`);
    }
    po.status = 'Cancelled';
    return this.poRepository.save(po);
  }

  async remove(id: string): Promise<void> {
    const result = await this.poRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }
  }
}
