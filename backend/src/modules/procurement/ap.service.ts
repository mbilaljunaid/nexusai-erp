
import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema/index';
import { eq, desc, and, sql } from 'drizzle-orm';
import { ProcurementGlIntegrationService } from './gl-integration.service';

@Injectable()
export class ApService {
    private readonly logger = new Logger(ApService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private readonly glService: ProcurementGlIntegrationService,
    ) { }

    async createInvoice(dto: any): Promise<any> {
        return this.db.transaction(async (tx) => {
            const supplier = await tx.query.suppliers.findFirst({
                where: eq(schema.suppliers.id, dto.supplierId)
            });
            if (!supplier) throw new NotFoundException('Supplier not found');

            let po;
            if (dto.purchaseOrderId) {
                po = await tx.query.purchaseOrders.findFirst({
                    where: eq(schema.purchaseOrders.id, dto.purchaseOrderId)
                });
            }

            const terms = dto.paymentTerms || 'Net 30';
            const invoiceDate = dto.invoiceDate ? new Date(dto.invoiceDate) : new Date();
            let dueDate = new Date(invoiceDate);

            if (terms === 'Net 30') {
                dueDate.setDate(dueDate.getDate() + 30);
            } else if (terms === 'Immediate') {
                // Same day
            } else {
                dueDate.setDate(dueDate.getDate() + 30);
            }

            const [invoice] = await tx.insert(schema.apInvoices).values({
                invoiceNumber: dto.invoiceNumber,
                supplierId: supplier.id,
                supplierSiteId: dto.siteId,
                invoiceAmount: dto.amount.toString(),
                invoiceDate: invoiceDate,
                dueDate: dueDate,
                paymentTerms: terms,
                invoiceStatus: dto.status || 'Draft',
                description: dto.description
            } as any).returning();

            if (dto.lines && dto.lines.length > 0) {
                const linesToInsert = dto.lines.map((lineDto: any, index: number) => ({
                    invoiceId: invoice.id,
                    lineNumber: index + 1,
                    description: lineDto.description,
                    amount: lineDto.amount.toString(),
                    poLineId: lineDto.poLineId,
                    lineType: 'ITEM'
                }));
                await tx.insert(schema.apInvoiceLines).values(linesToInsert);
            }

            return this.findOneInvoice(invoice.id);
        });
    }

    async createDebitMemo(dto: any): Promise<any> {
        if (Number(dto.amount) > 0 && !dto.isCreditMemo) {
            dto.amount = -1 * Number(dto.amount);
        }
        dto.status = 'Validated';
        return this.createInvoice(dto);
    }

    async findAllInvoices(): Promise<any[]> {
        return this.db.query.apInvoices.findMany({
            with: {
                supplier: true,
                lines: true
            }
        } as any);
    }

    async findOneInvoice(id: string): Promise<any> {
        const invoice = await this.db.query.apInvoices.findFirst({
            where: eq(schema.apInvoices.id, id),
            with: {
                supplier: true,
                lines: true,
                payments: true
            }
        } as any);
        if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
        return invoice;
    }

    async validateInvoice(id: string): Promise<any> {
        return this.db.transaction(async (tx) => {
            const invoice: any = await tx.query.apInvoices.findFirst({
                where: eq(schema.apInvoices.id, id),
                with: { lines: true }
            } as any);

            if (!invoice) throw new NotFoundException('Invoice not found');
            if (invoice.invoiceStatus !== 'Draft') throw new BadRequestException(`Cannot validate invoice in status ${invoice.invoiceStatus}`);

            const lines: any[] = invoice.lines || [];
            const hasTaxLine = lines.some((l: any) => l.description?.toLowerCase().includes('tax'));
            let currentAmount = Number(invoice.invoiceAmount);
            let taxAmount = 0;

            if (!hasTaxLine && currentAmount > 0) {
                const taxRate = 0.10;
                taxAmount = currentAmount * taxRate;

                await tx.insert(schema.apInvoiceLines).values({
                    invoiceId: invoice.id,
                    lineNumber: lines.length + 1,
                    description: 'Automated Tax (10%)',
                    amount: taxAmount.toString(),
                    lineType: 'TAX'
                });

                currentAmount += taxAmount;

                await tx.update(schema.apInvoices)
                    .set({ invoiceAmount: currentAmount.toString() } as any)
                    .where(eq(schema.apInvoices.id, invoice.id));

                this.logger.log(`Added automated tax of ${taxAmount} to Invoice ${invoice.invoiceNumber}`);
            }

            const [updatedInvoice] = await tx.update(schema.apInvoices)
                .set({ invoiceStatus: 'Validated' } as any)
                .where(eq(schema.apInvoices.id, invoice.id))
                .returning();

            await this.glService.postJournal({
                source: 'Payables',
                category: 'Purchase Invoices',
                description: `Invoice ${updatedInvoice.invoiceNumber} Validation`,
                lines: [
                    { account: '5000-Expense', debit: Number(updatedInvoice.invoiceAmount) },
                    { account: '2000-AP-Liability', credit: Number(updatedInvoice.invoiceAmount) }
                ]
            });

            return updatedInvoice;
        });
    }

    async payInvoice(id: string, dto: any): Promise<any> {
        return this.db.transaction(async (tx) => {
            const invoice: any = await tx.query.apInvoices.findFirst({
                where: eq(schema.apInvoices.id, id),
                with: { payments: true }
            } as any);

            if (!invoice) throw new NotFoundException('Invoice not found');
            if (invoice.invoiceStatus !== 'Validated' && invoice.invoiceStatus !== 'Partially Paid') {
                throw new BadRequestException(`Cannot pay invoice in status ${invoice.invoiceStatus}`);
            }

            const [payment] = await tx.insert(schema.apPayments).values({
                paymentNumber: `PAY-${Date.now()}`,
                invoiceId: invoice.id,
                amount: dto.amount.toString(),
                paymentDate: new Date(),
                paymentMethodCode: dto.paymentMethod || 'CHECK',
                currencyCode: 'USD',
                supplierId: invoice.supplierId,
            } as any).returning();

            const payments: any[] = invoice.payments || [];
            const totalPaid = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0) + Number(dto.amount);
            let newStatus = 'Partially Paid';

            if (Math.abs(totalPaid) >= Math.abs(Number(invoice.invoiceAmount))) {
                newStatus = 'Paid';
            }

            await tx.update(schema.apInvoices)
                .set({ invoiceStatus: newStatus } as any)
                .where(eq(schema.apInvoices.id, invoice.id));

            return payment;
        });
    }
}
