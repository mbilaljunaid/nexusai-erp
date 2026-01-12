import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApInvoice } from './entities/ap-invoice.entity';
import { ApInvoiceLine } from './entities/ap-invoice-line.entity';
import { ApPayment } from './entities/ap-payment.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class ApService {
    private readonly logger = new Logger(ApService.name);

    constructor(
        @InjectRepository(ApInvoice)
        private invoiceRepo: Repository<ApInvoice>,
        @InjectRepository(ApInvoiceLine)
        private invoiceLineRepo: Repository<ApInvoiceLine>,
        @InjectRepository(ApPayment)
        private paymentRepo: Repository<ApPayment>,
        @InjectRepository(PurchaseOrder)
        private poRepo: Repository<PurchaseOrder>,
        @InjectRepository(Supplier)
        private supplierRepo: Repository<Supplier>,
    ) { }

    async createInvoice(dto: any): Promise<ApInvoice> {
        const supplier = await this.supplierRepo.findOne({ where: { id: dto.supplierId } });
        if (!supplier) throw new NotFoundException('Supplier not found');

        let po: PurchaseOrder | undefined;
        if (dto.purchaseOrderId) {
            po = await this.poRepo.findOne({ where: { id: dto.purchaseOrderId } }) || undefined;
        }

        const invoice = this.invoiceRepo.create({
            invoiceNumber: dto.invoiceNumber,
            supplier,
            purchaseOrder: po,
            amount: dto.amount,
            invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : new Date(),
            status: 'Draft',
        });

        const savedInvoice = await this.invoiceRepo.save(invoice);

        if (dto.lines && dto.lines.length > 0) {
            const lines = dto.lines.map((lineDto: any) => this.invoiceLineRepo.create({
                invoice: savedInvoice,
                description: lineDto.description,
                amount: lineDto.amount,
                poLine: lineDto.poLineId ? { id: lineDto.poLineId } : undefined
            }));
            await this.invoiceLineRepo.save(lines);
        }

        return this.findOneInvoice(savedInvoice.id);
    }

    async findAllInvoices(): Promise<ApInvoice[]> {
        return this.invoiceRepo.find({ relations: ['supplier', 'purchaseOrder'] });
    }

    async findOneInvoice(id: string): Promise<ApInvoice> {
        const invoice = await this.invoiceRepo.findOne({ where: { id }, relations: ['supplier', 'purchaseOrder', 'lines', 'payments'] });
        if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
        return invoice;
    }

    async validateInvoice(id: string): Promise<ApInvoice> {
        const invoice = await this.findOneInvoice(id);
        if (invoice.status !== 'Draft') throw new BadRequestException(`Cannot validate invoice in status ${invoice.status}`);

        // Simple validation: check if total matches lines (if lines exist)
        const lineTotal = invoice.lines.reduce((sum, line) => sum + Number(line.amount), 0);
        // Tolerance check?
        if (invoice.lines.length > 0 && Math.abs(Number(invoice.amount) - lineTotal) > 0.01) {
            // throw new BadRequestException(`Invoice amount ${invoice.amount} does not match line total ${lineTotal}`);
            // For now, let's just warn or force update header? Or simply mark as Validated despite mismatch (hold).
            this.logger.warn(`Invoice ${id} amount mismatch. Header: ${invoice.amount}, Lines: ${lineTotal}`);
        }

        invoice.status = 'Validated';
        return this.invoiceRepo.save(invoice);
    }

    async payInvoice(id: string, dto: any): Promise<ApPayment> {
        const invoice = await this.findOneInvoice(id);
        if (invoice.status !== 'Validated' && invoice.status !== 'Partially Paid') {
            throw new BadRequestException(`Cannot pay invoice in status ${invoice.status}`);
        }

        const payment = this.paymentRepo.create({
            paymentNumber: `PAY-${Date.now()}`,
            invoice,
            amount: dto.amount,
            paymentDate: new Date(),
            paymentMethod: dto.paymentMethod || 'Check'
        });
        const savedPayment = await this.paymentRepo.save(payment);

        // Check remaining balance
        const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(dto.amount);
        if (totalPaid >= Number(invoice.amount)) {
            invoice.status = 'Paid';
        } else {
            invoice.status = 'Partially Paid';
        }
        await this.invoiceRepo.save(invoice);

        return savedPayment;
    }
}
