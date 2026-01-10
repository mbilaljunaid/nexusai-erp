import { storage } from "../storage";
import {
    InsertArCustomer,
    ArCustomer,
    InsertArInvoice,
    ArInvoice,
    InsertArReceipt,
    ArReceipt
} from "@shared/schema";
import { financeService } from "./finance";

export class ArService {
    // Customers
    async listCustomers(): Promise<ArCustomer[]> {
        return await storage.listArCustomers();
    }

    async createCustomer(data: InsertArCustomer): Promise<ArCustomer> {
        return await storage.createArCustomer(data);
    }

    async getCustomer(id: string): Promise<ArCustomer | undefined> {
        return await storage.getArCustomer(id);
    }

    async updateCustomer(id: string, data: Partial<InsertArCustomer>): Promise<ArCustomer | undefined> {
        return await storage.updateArCustomer(id, data);
    }

    // Invoices
    async listInvoices(): Promise<ArInvoice[]> {
        return await storage.listArInvoices();
    }

    async createInvoice(data: InsertArInvoice): Promise<ArInvoice> {
        const invoice = await storage.createArInvoice(data);

        // Auto-post to GL (simplified)
        const ledgers = await financeService.listLedgers();
        const ledger = ledgers[0];
        if (ledger) {
            const periods = await financeService.listPeriods(ledger.id);
            const period = periods.find(p => p.status === "Open") || periods[0];

            if (period) {
                await financeService.createJournal({
                    ledgerId: ledger.id,
                    currencyCode: invoice.currency || ledger.currencyCode || "USD",
                    journalNumber: `AR-INV-${invoice.invoiceNumber}`,
                    description: `Sales Invoice: ${invoice.invoiceNumber}`,
                    source: "AR",
                    status: "Posted",
                    periodId: period.id
                }, [
                    { accountId: "RECEIVABLES_ACC", enteredDebit: String(invoice.totalAmount), enteredCredit: "0" },
                    { accountId: "REVENUE_ACC", enteredDebit: "0", enteredCredit: String(invoice.amount) }
                ]);
            }
        }

        return invoice;
    }

    async getInvoice(id: string): Promise<ArInvoice | undefined> {
        return await storage.getArInvoice(id);
    }

    // Receipts
    async listReceipts(): Promise<ArReceipt[]> {
        return await storage.listArReceipts();
    }

    async createReceipt(data: InsertArReceipt): Promise<ArReceipt> {
        const receipt = await storage.createArReceipt(data);

        // If receipt is applied to an invoice, update invoice status
        if (receipt.invoiceId) {
            const invoice = await storage.getArInvoice(receipt.invoiceId);
            if (invoice) {
                const newStatus = Number(receipt.amount) >= Number(invoice.totalAmount) ? "Paid" : "PartiallyPaid";
                await storage.updateArInvoiceStatus(invoice.id, newStatus);
            }
        }

        // Auto-post to GL (simplified)
        const ledgers = await financeService.listLedgers();
        const ledger = ledgers[0];
        if (ledger) {
            const periods = await financeService.listPeriods(ledger.id);
            const period = periods.find(p => p.status === "Open") || periods[0];

            if (period) {
                await financeService.createJournal({
                    ledgerId: ledger.id,
                    currencyCode: ledger.currencyCode || "USD",
                    journalNumber: `AR-RCPT-${receipt.id.slice(0, 8)}`,
                    description: `Customer Payment Receipt`,
                    source: "AR",
                    status: "Posted",
                    periodId: period.id
                }, [
                    { accountId: "CASH_ACC", enteredDebit: String(receipt.amount), enteredCredit: "0" },
                    { accountId: "RECEIVABLES_ACC", enteredDebit: "0", enteredCredit: String(receipt.amount) }
                ]);
            }
        }

        return receipt;
    }

    // Premium Features: Seeding
    async seedDemoData(): Promise<void> {
        // 1. Clear existing (optional - keeping it additive for now)

        // 2. Create rich customers
        const custs = [
            { name: "Globex Corporation", customerType: "Commercial", creditLimit: "50000", riskCategory: "Low", contactEmail: "finance@globex.com" },
            { name: "Initech LLC", customerType: "Commercial", creditLimit: "15000", riskCategory: "Medium", contactEmail: "ar@initech.co" },
            { name: "Soylent Corp", customerType: "Commercial", creditLimit: "100000", riskCategory: "Low", contactEmail: "billing@soylent.com" },
            { name: "Umbrella Corp", customerType: "Commercial", creditLimit: "5000", riskCategory: "High", creditHold: true, contactEmail: "restricted@umbrella.com" }
        ];

        for (const c of custs) {
            const created = await this.createCustomer(c as any) as ArCustomer;

            // 3. Create rich invoices per customer
            const invs = [
                { customerId: created.id, invoiceNumber: `INV-${created.name.slice(0, 3)}-001`, amount: "2500", taxAmount: "250", totalAmount: "2750", status: "Sent", dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
                { customerId: created.id, invoiceNumber: `INV-${created.name.slice(0, 3)}-002`, amount: "12000", taxAmount: "1200", totalAmount: "13200", status: "Overdue", dueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) }
            ];

            for (const inv of invs) {
                await this.createInvoice(inv as any);
            }
        }
    }

    async toggleCreditHold(id: string, hold: boolean): Promise<ArCustomer> {
        return await this.updateCustomer(id, { creditHold: hold }) as ArCustomer;
    }

    async getCustomerBalance(customerId: string) {
        const invoices = await storage.listArInvoices();
        const receipts = await storage.listArReceipts();

        const customerInvoices = invoices.filter(i => i.customerId === customerId && i.status !== "Cancelled");
        const customerReceipts = receipts.filter(r => r.customerId === customerId);

        const totalInvoiced = customerInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
        const totalPaid = customerReceipts.reduce((sum, r) => sum + Number(r.amount), 0);

        return {
            totalInvoiced,
            totalPaid,
            outstanding: totalInvoiced - totalPaid
        };
    }
}

export const arService = new ArService();
