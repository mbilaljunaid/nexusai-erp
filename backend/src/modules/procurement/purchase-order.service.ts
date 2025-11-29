import { Injectable } from '@nestjs/common';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { PurchaseOrder } from './entities/purchase-order.entity';

@Injectable()
export class PurchaseOrderService {
  private pos: PurchaseOrder[] = [];
  private idCounter = 1;

  async create(createPoDto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const po: PurchaseOrder = {
      id: this.idCounter++,
      ...createPoDto,
      createdAt: new Date(),
    };
    this.pos.push(po);
    return po;
  }

  async findAll(): Promise<PurchaseOrder[]> {
    return this.pos;
  }

  async findOne(id: string): Promise<PurchaseOrder | null> {
    return this.pos.find(p => p.id === parseInt(id)) || null;
  }

  async update(id: string, updatePoDto: Partial<CreatePurchaseOrderDto>): Promise<PurchaseOrder | null> {
    const po = this.pos.find(p => p.id === parseInt(id));
    if (!po) return null;
    Object.assign(po, updatePoDto);
    return po;
  }

  async remove(id: string): Promise<void> {
    const index = this.pos.findIndex(p => p.id === parseInt(id));
    if (index > -1) this.pos.splice(index, 1);
  }
}
