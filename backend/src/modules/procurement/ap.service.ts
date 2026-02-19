
import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema/index';
import { eq, and, inArray } from 'drizzle-orm';
import { ProcurementGlIntegrationService } from './gl-integration.service';
import { TaxEngineService } from '../erp/tax-engine.service';

@Injectable()
export class ApService {
    private readonly logger = new Logger(ApService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private readonly glService: ProcurementGlIntegrationService,
        private readonly taxEngine: TaxEngineService,
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
            const hasTaxLine = lines.some((l: any) => l.lineType === 'TAX');
            let currentAmount = Number(invoice.invoiceAmount);

            // ── LIVE TAX CALCULATION via TaxEngineService ────────────────────
            if (!hasTaxLine && currentAmount > 0) {
                const taxCalc = this.taxEngine.calculateTax({
                    id: invoice.id,
                    date: new Date(),
                    amount: currentAmount,
                    type: 'purchase',
                    shipFromCountry: 'US',
                    shipToCountry: 'US',
                });

                if (taxCalc.taxAmount > 0) {
                    await tx.insert(schema.apInvoiceLines).values({
                        invoiceId: invoice.id,
                        lineNumber: lines.length + 1,
                        description: `Tax (${(taxCalc.taxRate * 100).toFixed(2)}%) — ${taxCalc.isReverseCharge ? 'Reverse Charge' : 'Standard'}`,
                        amount: taxCalc.taxAmount.toString(),
                        lineType: 'TAX'
                    } as any);

                    currentAmount += taxCalc.taxAmount;

                    await tx.update(schema.apInvoices)
                        .set({
                            invoiceAmount: currentAmount.toString(),
                            taxAmount: taxCalc.taxAmount.toString()
                        } as any)
                        .where(eq(schema.apInvoices.id, invoice.id));

                    this.logger.log(`Tax ${taxCalc.taxAmount} (${(taxCalc.taxRate * 100).toFixed(1)}%) applied to Invoice ${invoice.invoiceNumber}`);
                }
            }

            // ── WHT DISTRIBUTION LINES ───────────────────────────────────────
            const supplier: any = await tx.query.apSuppliers.findFirst({
                where: eq(schema.apSuppliers.id, invoice.supplierId)
            } as any);

            let whtAmount = 0;
            if (supplier?.allowWithholdingTax && supplier?.withholdingTaxGroupId) {
                const whtRates: any[] = await tx.query.apWhtRates.findMany({
                    where: eq(schema.apWhtRates.groupId, supplier.withholdingTaxGroupId)
                } as any);

                for (const rate of whtRates) {
                    const rateWht = currentAmount * (Number(rate.ratePercent) / 100);
                    whtAmount += rateWht;

                    // Negative distribution line: Dr AP Liability / Cr WHT Liability
                    await tx.insert(schema.apInvoiceDistributions).values({
                        invoiceId: invoice.id,
                        invoiceLineId: lines[0]?.id || invoice.id,
                        distLineNumber: lines.length + 10,
                        amount: (-rateWht).toString(),
                        distCodeCombinationId: '2100-WHT-Liability',
                        accountingDate: new Date(),
                        description: `WHT: ${rate.taxRateName} @ ${rate.ratePercent}%`,
                        reversalFlag: false,
                    } as any);
                    this.logger.log(`WHT distribution created: ${rate.taxRateName} = ${rateWht}`);
                }

                if (whtAmount > 0) {
                    await tx.update(schema.apInvoices)
                        .set({ withholdingTaxAmount: whtAmount.toString() } as any)
                        .where(eq(schema.apInvoices.id, invoice.id));
                }
            }

            const [updatedInvoice] = await tx.update(schema.apInvoices)
                .set({ invoiceStatus: 'Validated', validationStatus: 'VALIDATED' } as any)
                .where(eq(schema.apInvoices.id, invoice.id))
                .returning();

            const netPayable = currentAmount - whtAmount;
            await this.glService.postJournal({
                source: 'Payables',
                category: 'Purchase Invoices',
                description: `Invoice ${updatedInvoice.invoiceNumber} Validation`,
                lines: [
                    { account: '5000-Expense', debit: currentAmount },
                    { account: '2000-AP-Liability', credit: netPayable },
                    ...(whtAmount > 0 ? [{ account: '2100-WHT-Liability', credit: whtAmount }] : [])
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

            // ── DYNAMIC BANK ACCOUNT (IBAN/BIC from supplier site) ──────────
            let bankIban: string | null = null;
            let bankSwift: string | null = null;
            if (invoice.supplierSiteId) {
                const site: any = await tx.query.apSupplierSites.findFirst({
                    where: eq(schema.apSupplierSites.id, invoice.supplierSiteId)
                } as any);
                bankIban = site?.iban ?? null;
                bankSwift = site?.swiftCode ?? null;
            }

            const [payment] = await tx.insert(schema.apPayments).values({
                paymentNumber: `PAY-${Date.now()}`,
                supplierId: invoice.supplierId,
                amount: dto.amount.toString(),
                paymentDate: new Date(),
                paymentMethodCode: dto.paymentMethod || 'CHECK',
                currencyCode: invoice.paymentCurrencyCode || 'USD',
                bankAccountId: dto.bankAccountId ?? null,
            } as any).returning();

            // Link payment to invoice
            await tx.insert(schema.apInvoicePayments).values({
                paymentId: payment.id,
                invoiceId: invoice.id,
                amount: dto.amount.toString(),
                accountingDate: new Date(),
            } as any);

            const payments: any[] = invoice.payments || [];
            const totalPaid = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0) + Number(dto.amount);
            const netPayable = Number(invoice.invoiceAmount) - Number(invoice.withholdingTaxAmount || 0);
            const newStatus = Math.abs(totalPaid) >= Math.abs(netPayable) ? 'Paid' : 'Partially Paid';

            await tx.update(schema.apInvoices)
                .set({ invoiceStatus: newStatus, paymentStatus: newStatus === 'Paid' ? 'PAID' : 'PARTIAL' } as any)
                .where(eq(schema.apInvoices.id, invoice.id));

            // GL: Debit AP Liability / Credit Cash
            await this.glService.postJournal({
                source: 'Payables',
                category: 'Payment',
                description: `Payment ${payment.paymentNumber} for Invoice ${invoice.invoiceNumber}`,
                lines: [
                    { account: '2000-AP-Liability', debit: Number(dto.amount) },
                    { account: '1010-Cash', credit: Number(dto.amount) }
                ]
            });

            this.logger.log(`Payment ${payment.paymentNumber} created for Invoice ${invoice.invoiceNumber}. IBAN: ${bankIban ?? 'N/A'}, SWIFT: ${bankSwift ?? 'N/A'}`);
            return { ...payment, bankIban, bankSwift };
        });
    }

    // ── ASYNC PAYMENT BATCH (PPR-style) ────────────────────────────────────
    async createPaymentBatch(dto: { batchName: string; invoiceIds: string[]; checkDate?: string; paymentMethod?: string; bankAccountId?: string }): Promise<any> {
        const [batch] = await this.db.insert(schema.apPaymentBatches).values({
            batchName: dto.batchName,
            checkDate: dto.checkDate ? new Date(dto.checkDate) : new Date(),
            paymentMethodCode: dto.paymentMethod || 'CHECK',
            bankAccountId: dto.bankAccountId ?? null,
            status: 'NEW',
        } as any).returning();

        this.logger.log(`Payment Batch ${batch.id} created with ${dto.invoiceIds.length} invoices — processing asynchronously`);

        // Process asynchronously to avoid request timeouts
        setImmediate(() => this._processBatchAsync(batch.id, dto.invoiceIds));

        return { batchId: batch.id, status: 'NEW', invoiceCount: dto.invoiceIds.length, message: 'Batch queued for async processing' };
    }

    private async _processBatchAsync(batchId: string, invoiceIds: string[]): Promise<void> {
        let successCount = 0;
        let failCount = 0;
        let totalAmount = 0;

        for (const invoiceId of invoiceIds) {
            try {
                const invoice: any = await this.db.query.apInvoices.findFirst({
                    where: eq(schema.apInvoices.id, invoiceId)
                } as any);

                if (!invoice || (invoice.invoiceStatus !== 'Validated' && invoice.invoiceStatus !== 'Partially Paid')) {
                    this.logger.warn(`Skipping invoice ${invoiceId}: status=${invoice?.invoiceStatus}`);
                    failCount++;
                    continue;
                }

                const payAmount = Number(invoice.invoiceAmount) - Number(invoice.withholdingTaxAmount || 0);
                await this.payInvoice(invoiceId, { amount: payAmount, paymentMethod: 'CHECK', bankAccountId: null });
                totalAmount += payAmount;
                successCount++;
            } catch (err: any) {
                this.logger.error(`Batch ${batchId}: Failed to pay invoice ${invoiceId}: ${err.message}`);
                failCount++;
            }
        }

        await this.db.update(schema.apPaymentBatches)
            .set({
                status: failCount === 0 ? 'CONFIRMED' : 'PARTIAL',
                totalAmount: totalAmount.toString(),
                paymentCount: successCount,
            } as any)
            .where(eq(schema.apPaymentBatches.id, batchId));

        this.logger.log(`Batch ${batchId} complete: ${successCount} paid, ${failCount} failed, total=${totalAmount}`);
    }

    async getPaymentBatch(batchId: string): Promise<any> {
        const batch = await this.db.query.apPaymentBatches.findFirst({
            where: eq(schema.apPaymentBatches.id, batchId)
        } as any);
        if (!batch) throw new NotFoundException(`Payment Batch ${batchId} not found`);
        return batch;
    }
}
