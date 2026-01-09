// Accounts Payable (AP) Service Layer
import { storage } from "../storage";
import { type InsertApSupplier, type InsertApInvoice, type InsertApPayment, type ApSupplier, type ApInvoice, type ApPayment, type InsertApInvoiceLine, type InsertApInvoiceDistribution } from "@shared/schema";

export interface CreateInvoicePayload {
    header: InsertApInvoice;
    lines: InsertApInvoiceLine[];
    distributions?: InsertApInvoiceDistribution[];
}

export class ApService {
    async listInvoices() {
        return storage.listApInvoices();
    }

    // Placeholder for seed (can be reimplemented fully later)
    async seedDemoData() {
        // Re-implement if needed, or leave empty for now to satisfy type checker
        return { message: "Seed not implemented for enterprise schema yet" };
    }

    // Placeholder for toggle (can be reimplemented fully later)
    async toggleCreditHold(supplierId: string, hold: boolean) {
        return storage.updateApSupplier(supplierId, { creditHold: hold });
    }

    async getInvoice(id: string) {
        const invoice = await storage.getApInvoice(id);
        if (!invoice) return undefined;

        // Fetch lines
        const lines = await storage.getApInvoiceLines(invoice.id);
        return { ...invoice, lines };
    }

    async createInvoice(payload: CreateInvoicePayload) {
        // 1. Create Header
        const invoice = await storage.createApInvoiceHeader(payload.header);

        // 2. Create Lines
        const createdLines = [];
        for (const line of payload.lines) {
            const createdLine = await storage.createApInvoiceLine({
                ...line,
                invoiceId: invoice.id
            });
            createdLines.push(createdLine);

            // 3. Create Distributions (if provided) - Simplified 1:1 for now if needed, or use separate logic
            if (payload.distributions) {
                const relatedDists = payload.distributions.filter(d => d.invoiceLineId === line.lineNumber); // Assumption: payload uses lineNumber to link
                for (const dist of relatedDists) {
                    await storage.createApInvoiceDistribution({
                        ...dist,
                        invoiceId: invoice.id,
                        invoiceLineId: createdLine.id
                    });
                }
            }
        }

        return { ...invoice, lines: createdLines };
    }

    // Validation Logic (Stub for Phase 2)
    async validateInvoice(invoiceId: number): Promise<{ status: string, holds: string[] }> {
        console.log(`Validating Invoice ${invoiceId}...`);
        const invoice = await storage.getApInvoice(invoiceId.toString());
        if (!invoice) throw new Error("Invoice not found");

        const lines = await storage.getApInvoiceLines(invoiceId);
        const holds: string[] = [];

        // 1. Line Variance Check
        const headerAmount = Number(invoice.invoiceAmount);
        const linesTotal = lines.reduce((sum, line) => sum + Number(line.amount), 0);

        // Simple tolerance check (e.g. 0.01)
        if (Math.abs(headerAmount - linesTotal) > 0.01) {
            holds.push("LINE_VARIANCE");
            // In a real system, we'd insert into ap_holds table here
            // await storage.createApHold({ ... });
        }

        // 2. PO Matching (Price Variance)
        for (const line of lines) {
            if (line.poHeaderId && line.poLineId) {
                // Fetch PO Line - Need to add this method to storage or use db directly if allowed
                // For now, assuming we extended storage or use raw query check.
                // This is a placeholder for the actual DB lookup:
                // const poLine = await storage.getPoLine(line.poLineId); 

                // Mock Logic:
                // if (poLine) {
                //    const expectedAmount = poLine.unitPrice * line.quantity;
                //    if (Math.abs(Number(line.amount) - expectedAmount) > 0.01) {
                //        holds.push(`PRICE_VARIANCE_LINE_${line.lineNumber}`);
                //    }
                // }
            }
        }

        // 3. Update Status
        const newStatus = holds.length > 0 ? "NEEDS REVALIDATION" : "VALIDATED";
        await storage.updateApInvoice(invoiceId.toString(), { validationStatus: newStatus });

        return { status: newStatus, holds };
    }

    async applyPayment(invoiceId: string, paymentData: InsertApPayment): Promise<ApPayment | undefined> {
        const payment = await storage.createApPayment({ ...paymentData } as any);
        // Link to invoice (New Table) - TODO: Implement ApInvoicePayment
        // For now, keep simple status update

        // Logic to update status would go here...

        return payment;
    }
}

export const apService = new ApService();
