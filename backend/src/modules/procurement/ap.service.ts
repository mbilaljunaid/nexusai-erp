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

        // Payment Terms Logic
        const terms = dto.paymentTerms || supplier.paymentTerms || 'Net 30';
        const invoiceDate = dto.invoiceDate ? new Date(dto.invoiceDate) : new Date();
        let dueDate = new Date(invoiceDate);

        // Simple parser for Terms
        if (terms === 'Net 30') {
            dueDate.setDate(dueDate.getDate() + 30);
        } else if (terms === 'Immediate') {
            // Same as invoice date
        } else {
            // Default to 30 if unknown
            dueDate.setDate(dueDate.getDate() + 30);
        }

        const invoice = this.invoiceRepo.create({
            invoiceNumber: dto.invoiceNumber,
            supplier,
            purchaseOrder: po,
            amount: dto.amount,
            invoiceDate: invoiceDate,
            dueDate: dueDate,
            paymentTerms: terms,
            status: dto.status || 'Draft',
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

    async createDebitMemo(dto: any): Promise<ApInvoice> {
        if (Number(dto.amount) > 0 && !dto.isCreditMemo) {
            dto.amount = -1 * Number(dto.amount);
        }
        dto.status = 'Validated';
        return this.createInvoice(dto);
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

        // Automated Tax Logic
        const hasTaxLine = invoice.lines.some(l => l.description.toLowerCase().includes('tax'));
        if (!hasTaxLine && Number(invoice.amount) > 0) { // Don't tax credit memos automatically for MVP simplicity
            const taxRate = 0.10; // 10% Stub
            const netAmount = Number(invoice.amount);
            const taxAmount = netAmount * taxRate;

            // Add Tax Line
            await this.invoiceLineRepo.save(this.invoiceLineRepo.create({
                invoice,
                description: 'Automated Tax (10%)',
                amount: taxAmount
            }));

            // Update Header to include Tax
            invoice.amount = netAmount + taxAmount;
            this.logger.log(`Added automated tax of ${taxAmount} to Invoice ${invoice.invoiceNumber}`);
        }

        // Refresh lines to check total
        const updatedInvoice = await this.findOneInvoice(id);
        const lineTotal = updatedInvoice.lines.reduce((sum, line) => sum + Number(line.amount), 0);

        // Simple tolerance check
        if (Math.abs(Number(updatedInvoice.amount) - lineTotal) > 0.01) {
            this.logger.warn(`Invoice ${id} amount mismatch. Header: ${updatedInvoice.amount}, Lines: ${lineTotal}`);
        }

        updatedInvoice.status = 'Validated';
        return this.invoiceRepo.save(updatedInvoice);
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

        const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(dto.amount);
        if (Math.abs(totalPaid) >= Math.abs(Number(invoice.amount))) {
            invoice.status = 'Paid';
        } else {
            invoice.status = 'Partially Paid';
        }
        await this.invoiceRepo.save(invoice);

        return savedPayment;
    }
}
