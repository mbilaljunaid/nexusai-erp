/**
 * Invoice GL Service — P0.8: GL Integration (SLA Engine) for Billing Events
 *
 * Fired on billing lifecycle events:
 *  - createAndPost: creates AR invoice + posts GL journal (Dr AR / Cr Revenue)
 *  - postPayment:   posts cash receipt journal (Dr Cash / Cr AR)
 *  - postCreditMemo: reverses the original GL entries (Dr Revenue / Cr AR)
 *
 * Uses arInvoices.glStatus to track posting state (Pending → Created → Posted).
 */
import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema/index';
import { eq } from 'drizzle-orm';

// Default GL account codes — these should come from revenueGlAccounts in production
const GL_ACCOUNTS = {
    AR_RECEIVABLE: '1200-AR-CONTROL',
    REVENUE: '4000-REVENUE',
    CASH: '1000-CASH',
    CREDIT_MEMO: '4001-REVENUE-CM',
};

@Injectable()
export class InvoiceGlService {
    private readonly logger = new Logger(InvoiceGlService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    /**
     * P0.8-A: Post the initial AR invoice journal.
     *   Dr Accounts Receivable (totalAmount)
     *   Cr Revenue            (amount excl. tax)
     *   Cr Tax Liability      (taxAmount, if > 0)
     */
    async postInvoiceToGL(invoiceId: string): Promise<any> {
        const invoice: any = await this.db.query.arInvoices.findFirst({
            where: eq(schema.arInvoices.id, invoiceId)
        } as any);
        if (!invoice) throw new NotFoundException(`AR Invoice ${invoiceId} not found`);
        if (invoice.glStatus === 'Posted') {
            return { message: 'Invoice already posted to GL', invoiceId };
        }

        const totalAmount = Number(invoice.totalAmount);
        const taxAmount = Number(invoice.taxAmount || 0);
        const revenueAmount = totalAmount - taxAmount;

        const glDate = new Date();
        const periodName = this._getPeriodName(glDate);

        return this.db.transaction(async (tx) => {
            // 1. Create journal header
            const [journal] = await tx.insert(schema.glJournals).values({
                journalNumber: `AR-INV-${invoice.invoiceNumber}-${Date.now()}`,
                ledgerId: 'PRIMARY',
                source: 'AR',
                status: 'Posted',
                description: `AR Invoice: ${invoice.invoiceNumber}`,
                currencyCode: invoice.currency || 'USD',
                createdBy: 'system-ar-billing',
            } as any).returning();

            // 2a. Debit: Accounts Receivable
            await tx.insert(schema.glJournalLines).values({
                journalId: journal.id,
                accountId: invoice.glAccountId || GL_ACCOUNTS.AR_RECEIVABLE,
                currencyCode: invoice.currency || 'USD',
                enteredDebit: totalAmount.toString(),
                enteredCredit: '0',
                debit: totalAmount.toString(),
                credit: '0',
                description: `AR: ${invoice.invoiceNumber}`,
            } as any);

            // 2b. Credit: Revenue
            await tx.insert(schema.glJournalLines).values({
                journalId: journal.id,
                accountId: GL_ACCOUNTS.REVENUE,
                currencyCode: invoice.currency || 'USD',
                enteredDebit: '0',
                enteredCredit: revenueAmount.toString(),
                debit: '0',
                credit: revenueAmount.toString(),
                description: `Revenue: ${invoice.invoiceNumber}`,
            } as any);

            // 2c. Credit: Tax Liability (if applicable)
            if (taxAmount > 0) {
                await tx.insert(schema.glJournalLines).values({
                    journalId: journal.id,
                    accountId: '2300-TAX-LIAB',
                    currencyCode: invoice.currency || 'USD',
                    enteredDebit: '0',
                    enteredCredit: taxAmount.toString(),
                    debit: '0',
                    credit: taxAmount.toString(),
                    description: `Tax: ${invoice.invoiceNumber}`,
                } as any);
            }

            // 3. Update arInvoices.glStatus
            await tx.update(schema.arInvoices)
                .set({ glStatus: 'Posted', glDate, glPostedDate: glDate } as any)
                .where(eq(schema.arInvoices.id, invoiceId));

            this.logger.log(`GL posted for invoice ${invoice.invoiceNumber} — journal ${journal.id}`);
            return {
                invoiceId,
                invoiceNumber: invoice.invoiceNumber,
                journalId: journal.id,
                totalPosted: totalAmount,
                periodName,
            };
        });
    }

    /**
     * P0.8-B: Post the cash receipt journal when an AR invoice is paid.
     *   Dr Cash / Bank Account (amount)
     *   Cr Accounts Receivable (amount)
     */
    async postPaymentToGL(invoiceId: string, amountPaid: number): Promise<any> {
        const invoice: any = await this.db.query.arInvoices.findFirst({
            where: eq(schema.arInvoices.id, invoiceId)
        } as any);
        if (!invoice) throw new NotFoundException(`AR Invoice ${invoiceId} not found`);

        const glDate = new Date();

        return this.db.transaction(async (tx) => {
            const [journal] = await tx.insert(schema.glJournals).values({
                journalNumber: `AR-PMT-${invoice.invoiceNumber}-${Date.now()}`,
                ledgerId: 'PRIMARY',
                source: 'AR',
                status: 'Posted',
                description: `Payment Receipt: ${invoice.invoiceNumber}`,
                currencyCode: invoice.currency || 'USD',
                createdBy: 'system-ar-billing',
            } as any).returning();

            // Dr Cash
            await tx.insert(schema.glJournalLines).values({
                journalId: journal.id,
                accountId: GL_ACCOUNTS.CASH,
                currencyCode: invoice.currency || 'USD',
                enteredDebit: amountPaid.toString(),
                enteredCredit: '0',
                debit: amountPaid.toString(),
                credit: '0',
                description: `Cash Rcpt: ${invoice.invoiceNumber}`,
            } as any);

            // Cr AR
            await tx.insert(schema.glJournalLines).values({
                journalId: journal.id,
                accountId: invoice.glAccountId || GL_ACCOUNTS.AR_RECEIVABLE,
                currencyCode: invoice.currency || 'USD',
                enteredDebit: '0',
                enteredCredit: amountPaid.toString(),
                debit: '0',
                credit: amountPaid.toString(),
                description: `Clear AR: ${invoice.invoiceNumber}`,
            } as any);

            this.logger.log(`Payment GL posted for invoice ${invoice.invoiceNumber} amt=${amountPaid}`);
            return { invoiceId, journalId: journal.id, amountPosted: amountPaid };
        });
    }

    /**
     * P0.8-C: Post a Credit Memo reversal journal.
     *   Dr Revenue            (reversalAmount)
     *   Cr Accounts Receivable (reversalAmount)
     */
    async postCreditMemoToGL(invoiceId: string, creditMemoAmount: number, reason: string): Promise<any> {
        const invoice: any = await this.db.query.arInvoices.findFirst({
            where: eq(schema.arInvoices.id, invoiceId)
        } as any);
        if (!invoice) throw new NotFoundException(`AR Invoice ${invoiceId} not found`);

        return this.db.transaction(async (tx) => {
            const [journal] = await tx.insert(schema.glJournals).values({
                journalNumber: `AR-CM-${invoice.invoiceNumber}-${Date.now()}`,
                ledgerId: 'PRIMARY',
                source: 'AR',
                status: 'Posted',
                description: `Credit Memo: ${invoice.invoiceNumber} — ${reason}`,
                currencyCode: invoice.currency || 'USD',
                createdBy: 'system-ar-billing',
            } as any).returning();

            // Dr Revenue (Reversal)
            await tx.insert(schema.glJournalLines).values({
                journalId: journal.id,
                accountId: GL_ACCOUNTS.CREDIT_MEMO,
                currencyCode: invoice.currency || 'USD',
                enteredDebit: creditMemoAmount.toString(),
                enteredCredit: '0',
                debit: creditMemoAmount.toString(),
                credit: '0',
                description: `Revenue reversal: ${reason}`,
            } as any);

            // Cr AR
            await tx.insert(schema.glJournalLines).values({
                journalId: journal.id,
                accountId: invoice.glAccountId || GL_ACCOUNTS.AR_RECEIVABLE,
                currencyCode: invoice.currency || 'USD',
                enteredDebit: '0',
                enteredCredit: creditMemoAmount.toString(),
                debit: '0',
                credit: creditMemoAmount.toString(),
                description: `Reduce AR: ${reason}`,
            } as any);

            this.logger.log(`Credit Memo GL posted for invoice ${invoice.invoiceNumber} amt=${creditMemoAmount}`);
            return { invoiceId, journalId: journal.id, creditMemoAmount };
        });
    }

    private _getPeriodName(date: Date): string {
        const month = date.toLocaleString('default', { month: 'short' });
        return `${month}-${date.getFullYear().toString().slice(2)}`;
    }
}
