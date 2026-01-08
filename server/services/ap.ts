// Accounts Payable (AP) Service Layer
import { storage } from "../storage";
import { type InsertApSupplier, type InsertApInvoice, type InsertApPayment, type ApSupplier, type ApInvoice, type ApPayment } from "@shared/schema";

export class ApService {
    // Seed demo data for AP module
    async seedDemoData() {
        // Example suppliers
        const suppliers = [
            { name: "Acme Supplies", creditHold: false, riskCategory: "Low", address: "123 Main St", contactEmail: "contact@acme.com" },
            { name: "Global Widgets", creditHold: true, riskCategory: "High", address: "456 Market Ave", contactEmail: "info@globalwidgets.com" }
        ];
        for (const s of suppliers) {
            await storage.createApSupplier(s as any);
        }
        // Example invoices
        const invoices = [
            { supplierId: "1", invoiceNumber: "INV-1001", amount: 5000, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
            { supplierId: "2", invoiceNumber: "INV-2001", amount: 12000, dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) }
        ];
        for (const i of invoices) {
            await storage.createApInvoice(i as any);
        }
        // Example payments
        const payments = [
            { invoiceId: "1", amount: 2500, paymentMethod: "BankTransfer" },
            { invoiceId: "2", amount: 12000, paymentMethod: "CreditCard" }
        ];
        for (const p of payments) {
            await storage.createApPayment(p as any);
        }
        return { suppliers, invoices, payments };
    }

    // Toggle credit hold for a supplier
    async toggleCreditHold(supplierId: string, hold: boolean): Promise<ApSupplier | undefined> {
        const supplier = await storage.getApSupplier(supplierId);
        if (!supplier) return undefined;
        return await storage.updateApSupplier(supplierId, { creditHold: hold } as Partial<InsertApSupplier>);
    }

    // Apply a payment to an invoice and update status
    async applyPayment(invoiceId: string, paymentData: InsertApPayment): Promise<ApPayment | undefined> {
        const payment = await storage.createApPayment({ ...paymentData, invoiceId } as any);
        // Simple status logic: if total paid >= invoice amount, mark as Paid
        const invoice = await storage.getApInvoice(invoiceId);
        if (invoice) {
            const payments = await storage.listApPayments();
            const totalPaid = payments
                .filter(p => p.invoiceId === invoiceId)
                .reduce((sum, p) => sum + Number(p.amount), 0);
            if (totalPaid >= Number(invoice.amount)) {
                await storage.updateApInvoice(invoiceId, { status: "Paid" } as Partial<InsertApInvoice>);
            }
        }
        return payment;
    }
}

export const apService = new ApService();
