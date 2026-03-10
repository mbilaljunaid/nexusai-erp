import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema/index';
import { eq } from 'drizzle-orm';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

// Mapping to legacy 'invoices' table in finance schema or 'apInvoices' depending on intent.
// Given ERP module context, it's likely AR or generic. Using 'invoices' from legacy finance schema.

@Injectable()
export class InvoiceService {
  constructor(
    @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
  ) { }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<any> {
    const [invoice] = await this.db.insert(schema.invoices)
      .values({
        invoiceNumber: createInvoiceDto.invoiceNumber,
        amount: createInvoiceDto.amount.toString(),
        customerId: createInvoiceDto.customerId,
        dueDate: createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : undefined,
        status: createInvoiceDto.status || 'draft'
      })
      .returning();
    return invoice;
  }

  async findAll(): Promise<any[]> {
    return this.db.select().from(schema.invoices);
  }

  async findOne(id: string): Promise<any | null> {
    const results = await this.db.select().from(schema.invoices).where(eq(schema.invoices.id, id));
    return results[0] || null;
  }

  async update(id: string, updateData: Partial<CreateInvoiceDto>): Promise<any | null> {
    // Drizzle update
    const updatePayload: any = {};
    if (updateData.invoiceNumber) updatePayload.invoiceNumber = updateData.invoiceNumber;
    if (updateData.amount) updatePayload.amount = updateData.amount.toString();
    if (updateData.status) updatePayload.status = updateData.status;

    await this.db.update(schema.invoices)
      .set(updatePayload)
      .where(eq(schema.invoices.id, id));

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(schema.invoices).where(eq(schema.invoices.id, id));
  }
}
