
import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema/index';
import { eq, desc } from 'drizzle-orm';
import { PurchaseOrderService } from './purchase-order.service';

@Injectable()
export class SourcingService {
    private readonly logger = new Logger(SourcingService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private readonly poService: PurchaseOrderService,
    ) { }

    async createRFQ(dto: any): Promise<typeof schema.rfqHeaders.$inferSelect> {
        return this.db.transaction(async (tx) => {
            const deadline = dto.deadline ? new Date(dto.deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            const [rfq] = await tx.insert(schema.rfqHeaders).values({
                rfqNumber: `RFQ-${Date.now()}`,
                title: dto.title,
                status: 'Draft',
                deadline: deadline
            }).returning();

            if (dto.lines && dto.lines.length > 0) {
                const lines = dto.lines.map((l: any) => ({
                    headerId: rfq.id,
                    description: l.description,
                    targetQuantity: l.targetQuantity.toString(),
                    itemId: l.itemId
                }));
                await tx.insert(schema.rfqLines).values(lines);
            }
            // Return full object requires re-fetch if we want relations, but for now returning header is basic MVP
            return rfq;
        });
    }

    async findOneRFQ(id: string): Promise<typeof schema.rfqHeaders.$inferSelect & { lines: any[], quotes: any[] }> {
        // Use query builder for relations
        const rfq = await this.db.query.rfqHeaders.findFirst({
            where: eq(schema.rfqHeaders.id, id),
            with: {
                lines: true,
                quotes: {
                    with: {
                        supplier: true
                    }
                }
            }
        });
        if (!rfq) throw new NotFoundException('RFQ not found');
        return rfq;
    }

    async findAllRFQs(): Promise<typeof schema.rfqHeaders.$inferSelect[]> {
        return this.db.query.rfqHeaders.findMany({
            with: { lines: true, quotes: true },
            orderBy: [desc(schema.rfqHeaders.createdAt)]
        });
    }

    async publishRFQ(id: string): Promise<typeof schema.rfqHeaders.$inferSelect> {
        const [updated] = await this.db.update(schema.rfqHeaders)
            .set({ status: 'Active' })
            .where(eq(schema.rfqHeaders.id, id))
            .returning();
        if (!updated) throw new NotFoundException('RFQ not found');
        return updated;
    }

    async submitQuote(id: string, dto: any): Promise<typeof schema.supplierQuotes.$inferSelect> {
        const rfq = await this.db.query.rfqHeaders.findFirst({
            where: eq(schema.rfqHeaders.id, id)
        });
        if (!rfq) throw new NotFoundException('RFQ not found');
        if (rfq.status !== 'Active') throw new BadRequestException(`Cannot submit quote for RFQ in status ${rfq.status}`);

        const supplier = await this.db.query.suppliers.findFirst({
            where: eq(schema.suppliers.id, dto.supplierId)
        });
        if (!supplier) throw new NotFoundException('Supplier not found');

        const [quote] = await this.db.insert(schema.supplierQuotes).values({
            rfqId: rfq.id,
            supplierId: supplier.id,
            quoteAmount: dto.quoteAmount.toString(),
            status: 'Submitted'
        }).returning();

        return quote;
    }

    async awardQuote(quoteId: string): Promise<any> {
        return this.db.transaction(async (tx) => {
            const quote = await tx.query.supplierQuotes.findFirst({
                where: eq(schema.supplierQuotes.id, quoteId),
                with: {
                    rfq: {
                        with: { lines: true }
                    },
                    supplier: true
                }
            });
            if (!quote) throw new NotFoundException('Quote not found');

            const rfq = quote.rfq;
            if (rfq.status !== 'Active') throw new BadRequestException('RFQ is not active');

            // Update Quote Status
            await tx.update(schema.supplierQuotes)
                .set({ status: 'Awarded' })
                .where(eq(schema.supplierQuotes.id, quote.id));

            // Close RFQ
            await tx.update(schema.rfqHeaders)
                .set({ status: 'Awarded' })
                .where(eq(schema.rfqHeaders.id, rfq.id));

            // Create PO lines logic
            // Distribute amount evenly across lines for MVP simplicity
            const totalTargetQty = rfq.lines.reduce((sum: number, l: any) => sum + Number(l.targetQuantity), 0);
            const poLines = rfq.lines.map((line: any, idx: number) => {
                const unitPrice = totalTargetQty > 0 ? Number(quote.quoteAmount) / totalTargetQty : 0;
                return {
                    lineNumber: idx + 1,
                    itemDescription: line.description,
                    categoryName: 'Sourced',
                    quantity: line.targetQuantity, // DTO expects string or number? Drizzle inputs usually string for number types, but Service might handle logic.
                    // PO Service likely handles "number" or "string" if it's "any" typed DTO.
                    // Let's pass number as per original logic.
                    unitPrice: unitPrice,
                    lineAmount: Number(line.targetQuantity) * unitPrice
                };
            });

            const po = await this.poService.create({
                // PO Service Create expects DTO.
                // poNumber is generated by PO Service mostly? Or generic helper?
                // Legacy: `poNumber: PO-RFQ-...`. Drizzle PO Service generates it?
                // Drizzle PO Service `create` method:
                // `orderNumber: dto.orderNumber || ...`
                orderNumber: `PO-RFQ-${rfq.rfqNumber}`,
                supplierId: quote.supplier.id,
                status: 'Draft',
                lines: poLines
            },); // 'Sourcing' removed as service takes 1 arg

            return { message: 'Quote Awarded and PO Created', po };
        });
    }
}
