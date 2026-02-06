import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

@Injectable()
export class PurchaseOrderService {
  private readonly logger = new Logger(PurchaseOrderService.name);

  constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

  async create(dto: any) {
    return await this.db.transaction(async (tx) => {
      // 1. Create Header
      const [po] = await tx.insert(schema.purchaseOrders).values({
        orderNumber: dto.orderNumber, // Ensure this exists in DTO 
        supplierId: dto.supplierId,
        totalAmount: dto.totalAmount ? String(dto.totalAmount) : '0',
        status: 'Draft',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      }).returning();

      // 2. Create Lines
      if (dto.lines && Array.isArray(dto.lines)) {
        for (const line of dto.lines) {
          const [poLine] = await tx.insert(schema.purchaseOrderLines).values({
            poHeaderId: po.id,
            lineNumber: line.lineNumber,
            itemId: line.itemId,
            description: line.description || line.itemDescription,
            quantity: String(line.quantity),
            unitPrice: String(line.unitPrice),
            amount: String(line.lineAmount || (line.quantity * line.unitPrice)),
            projectId: line.projectId,
            taskId: line.taskId,
          }).returning();

          // 3. Create Distributions (if any)
          if (line.distributions && Array.isArray(line.distributions)) {
            for (const dist of line.distributions) {
              await tx.insert(schema.purchaseOrderDistributions).values({
                poLineId: poLine.id, // Fixed: Use poLine from previous step
                distributionNumber: dist.distributionNumber,
                quantity: String(dist.quantity),
                amount: String(dist.amount),
                chargeAccountParams: dist.chargeAccountParams ? JSON.stringify(dist.chargeAccountParams) : null,
              });
            }
          }
        }
      }

      return po;
    });
  }

  async findAll() {
    return this.db.query.purchaseOrders.findMany({
      with: {
        supplier: true,
        lines: true
      }
    });
  }

  async findOne(id: string) {
    const po = await this.db.query.purchaseOrders.findFirst({
      where: eq(schema.purchaseOrders.id, id),
      with: {
        supplier: true,
        lines: {
          with: {
            distributions: true
          }
        }
      }
    });

    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }
    return po;
  }

  async update(id: string, updateData: any) {
    const [updated] = await this.db.update(schema.purchaseOrders)
      .set({
        ...updateData,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined
      })
      .where(eq(schema.purchaseOrders.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`PO ${id} not found`);
    return this.findOne(id);
  }

  async approve(id: string) {
    const [po] = await this.db.update(schema.purchaseOrders)
      .set({ status: 'Approved' })
      .where(eq(schema.purchaseOrders.id, id))
      .returning();

    if (!po) throw new NotFoundException(`PO ${id} not found`);
    return po;
  }

  async open(id: string) {
    const [po] = await this.db.update(schema.purchaseOrders)
      .set({ status: 'Open' })
      .where(eq(schema.purchaseOrders.id, id))
      .returning();
    return po;
  }

  async cancel(id: string) {
    const [po] = await this.db.update(schema.purchaseOrders)
      .set({ status: 'Cancelled' })
      .where(eq(schema.purchaseOrders.id, id))
      .returning();
    return po;
  }

  async remove(id: string) {
    // Cascade delete provided by DB FKs usually, but strict Drizzle checks:
    // Delete lines first? Or rely on ON DELETE CASCADE.
    // Explicit delete for safety in logical order since Drizzle doesn't cascade in-memory.
    await this.db.delete(schema.purchaseOrders).where(eq(schema.purchaseOrders.id, id));
  }
}
