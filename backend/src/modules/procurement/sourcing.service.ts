import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfqHeader } from './entities/rfq-header.entity';
import { RfqLine } from './entities/rfq-line.entity';
import { SupplierQuote } from './entities/supplier-quote.entity';
import { Supplier } from './entities/supplier.entity';
import { PurchaseOrderService } from './purchase-order.service';

@Injectable()
export class SourcingService {
    private readonly logger = new Logger(SourcingService.name);

    constructor(
        @InjectRepository(RfqHeader)
        private rfqRepo: Repository<RfqHeader>,
        @InjectRepository(RfqLine)
        private rfqLineRepo: Repository<RfqLine>,
        @InjectRepository(SupplierQuote)
        private quoteRepo: Repository<SupplierQuote>,
        @InjectRepository(Supplier)
        private supplierRepo: Repository<Supplier>,
        private readonly poService: PurchaseOrderService,
    ) { }

    async createRFQ(dto: any): Promise<RfqHeader> {
        const rfq = this.rfqRepo.create({
            rfqNumber: `RFQ-${Date.now()}`,
            title: dto.title,
            status: 'Draft',
            deadline: dto.deadline ? new Date(dto.deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        const savedRfq = await this.rfqRepo.save(rfq);

        if (dto.lines) {
            const lines = dto.lines.map((l: any) => this.rfqLineRepo.create({
                header: savedRfq,
                description: l.description,
                targetQuantity: l.targetQuantity,
                item: l.itemId ? { id: l.itemId } : undefined
            }));
            await this.rfqLineRepo.save(lines);
        }
        return this.findOneRFQ(savedRfq.id);
    }

    async findOneRFQ(id: string): Promise<RfqHeader> {
        const rfq = await this.rfqRepo.findOne({ where: { id }, relations: ['lines', 'quotes', 'quotes.supplier'] });
        if (!rfq) throw new NotFoundException('RFQ not found');
        return rfq;
    }

    async findAllRFQs(): Promise<RfqHeader[]> {
        return this.rfqRepo.find({ relations: ['lines', 'quotes'], order: { createdAt: 'DESC' } });
    }

    async publishRFQ(id: string): Promise<RfqHeader> {
        const rfq = await this.findOneRFQ(id);
        rfq.status = 'Active';
        return this.rfqRepo.save(rfq);
    }

    async submitQuote(id: string, dto: any): Promise<SupplierQuote> {
        const rfq = await this.findOneRFQ(id);
        if (rfq.status !== 'Active') throw new BadRequestException(`Cannot submit quote for RFQ in status ${rfq.status}`);

        const supplier = await this.supplierRepo.findOne({ where: { id: dto.supplierId } });
        if (!supplier) throw new NotFoundException('Supplier not found');

        const quote = this.quoteRepo.create({
            rfq,
            supplier,
            quoteAmount: dto.quoteAmount,
            status: 'Submitted'
        });
        return this.quoteRepo.save(quote);
    }

    async awardQuote(quoteId: string): Promise<any> {
        const quote = await this.quoteRepo.findOne({ where: { id: quoteId }, relations: ['rfq', 'rfq.lines', 'supplier'] });
        if (!quote) throw new NotFoundException('Quote not found');

        const rfq = quote.rfq;
        if (rfq.status !== 'Active') throw new BadRequestException('RFQ is not active');

        // Update Quote Status
        quote.status = 'Awarded';
        await this.quoteRepo.save(quote);

        // Close RFQ
        rfq.status = 'Awarded'; // Or Closed
        await this.rfqRepo.save(rfq);

        // Create PO
        // Distribute amount evenly across lines for MVP simplicity (or use specific line quotes if implemented)
        const poLines = rfq.lines.map((line, idx) => {
            const unitPrice = Number(quote.quoteAmount) / rfq.lines.reduce((sum, l) => sum + Number(l.targetQuantity), 0);
            return {
                lineNumber: idx + 1,
                itemDescription: line.description,
                categoryName: 'Sourced',
                quantity: line.targetQuantity,
                unitPrice: unitPrice, // Simplified: avg price. Real world would have line-level quotes.
                lineAmount: Number(line.targetQuantity) * unitPrice
            };
        });

        const po = await this.poService.create({
            poNumber: `PO-RFQ-${rfq.rfqNumber}`,
            supplierId: quote.supplier.id,
            status: 'Draft',
            lines: poLines
        });

        return { message: 'Quote Awarded and PO Created', po };
    }
}
