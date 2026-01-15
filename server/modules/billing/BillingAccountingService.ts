import { db } from "../../db";
import { billingEvents, type BillingEvent } from "@shared/schema/billing_enterprise";
import { arInvoices, type ArInvoice } from "@shared/schema/ar";
import { eq } from "drizzle-orm";
import { exchangeRateService } from "../finance/ExchangeRateService";

/**
 * BillingAccountingService (SLA Engine Wrapper)

/**
 * BillingAccountingService (SLA Engine Wrapper)
 * Responsible for deriving accounting entries (Dr/Cr) from Billing Activities.
 */
export class BillingAccountingService {

    /**
     * Create Accounting for a single Billing Event
     * Typically called when Event is finalized or Invoiced.
     */
    async createEventAccounting(eventId: string) {
        const [event] = await db.select().from(billingEvents).where(eq(billingEvents.id, eventId));
        if (!event) throw new Error(`Event ${eventId} not found`);

        // SLA Logic:
        // Debit: Unbilled Receivables (Asset)
        // Credit: Revenue (Income)

        // Multi-Currency Conversion
        const functionalAmount = await exchangeRateService.convert(Number(event.amount), event.currency || "USD");

        // Mock GL Entry Creation
        const accountingEntries = [
            {
                account: "1210-00-000", // Unbilled AR
                type: "DEBIT",
                amount: event.amount, // Entered
                accountedAmount: functionalAmount, // Functional (USD)
                currency: event.currency || "USD",
                description: `Unbilled Revenue for ${event.description}`
            },
            {
                account: event.glAccount || "4000-00-000", // Revenue
                type: "CREDIT",
                amount: event.amount,
                accountedAmount: functionalAmount,
                currency: event.currency || "USD",
                description: `Revenue Recognition for ${event.description}`
            }
        ];

        // Store these (Simulated)
        // await glService.postBatch(accountingEntries);

        // Update Event Status
        await db.update(billingEvents)
            .set({
                glStatus: "Created",
                glDate: new Date(),
                glImportRef: `SLA-${Date.now()}`
            })
            .where(eq(billingEvents.id, eventId));

        return accountingEntries;
    }

    /**
     * Create Accounting for a Final ArInvoice
     * Debit: Accounts Receivable
     * Credit: Unbilled Receivables (if previously recognized) OR Revenue
     * Credit: Tax Payable
     */
    async createInvoiceAccounting(invoiceId: string) {
        const [invoice] = await db.select().from(arInvoices).where(eq(arInvoices.id, invoiceId));
        if (!invoice) throw new Error(`Invoice ${invoiceId} not found`);

        const total = Number(invoice.totalAmount);
        const tax = Number(invoice.taxAmount || 0);
        const revenue = Number(invoice.amount);
        const currency = invoice.currency || "USD";

        // Multi-Currency Conversion
        const functionalTotal = await exchangeRateService.convert(total, currency);
        const functionalRevenue = await exchangeRateService.convert(revenue, currency);
        const functionalTax = await exchangeRateService.convert(tax, currency);

        // SLA Logic:
        // Debit: 1200 AR (Total)
        // Credit: 4000 Revenue (Revenue)
        // Credit: 2000 Tax Payable (Tax)

        const entries = [
            { account: "1200-00-000", type: "DEBIT", amount: total, accountedAmount: functionalTotal, desc: "AR Trade" },
            { account: "4000-00-000", type: "CREDIT", amount: revenue, accountedAmount: functionalRevenue, desc: "Revenue" },
            { account: "2000-00-000", type: "CREDIT", amount: tax, accountedAmount: functionalTax, desc: "Tax Liability" }
        ];

        // Simulate Posting
        await db.update(arInvoices)
            .set({
                glStatus: "Posted",
                glDate: new Date(),
                glPostedDate: new Date()
            })
            .where(eq(arInvoices.id, invoiceId));

        return entries;
    }
}

export const billingAccountingService = new BillingAccountingService();
