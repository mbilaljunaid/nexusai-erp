import PDFDocument from 'pdfkit';
import { arService } from './ar';
import { db } from '../db';
import { arInvoiceLines } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class PDFGenerator {
    /**
     * Generate invoice PDF
     */
    async generateInvoicePDF(invoiceId: string): Promise<Buffer> {
        const invoice = await arService.getInvoice(invoiceId);
        if (!invoice) throw new Error('Invoice not found');

        // Get line items directly from database
        const lineItems = await db.select().from(arInvoiceLines).where(eq(arInvoiceLines.invoiceId, invoiceId));
        const customer = await arService.getCustomer(invoice.customerId);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Company Header
            doc.fontSize(20)
                .font('Helvetica-Bold')
                .text('INVOICE', { align: 'center' });

            doc.fontSize(10)
                .font('Helvetica')
                .text(invoice.invoiceNumber, { align: 'center' })
                .moveDown();

            // Bill To section
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .text('Bill To:');

            doc.fontSize(10)
                .font('Helvetica')
                .text(customer?.name || 'Unknown Customer')
                .text(customer?.contactEmail || '')
                .moveDown();

            // Invoice Details
            const col1 = 50;
            const col2 = 300;

            doc.fontSize(10);
            doc.text(`Invoice Date:`, col1, doc.y);
            doc.text(new Date(invoice.createdAt || Date.now()).toLocaleDateString(), col2, doc.y);
            doc.moveDown(0.5);

            doc.text(`Due Date:`, col1, doc.y);
            doc.text(invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A', col2, doc.y);
            doc.moveDown(0.5);

            doc.text(`Status:`, col1, doc.y);
            doc.text(invoice.status || 'Open', col2, doc.y);
            doc.moveDown(2);

            // Line Items Table
            doc.fontSize(11).font('Helvetica-Bold');
            const tableTop = doc.y;
            const descX = 50;
            const qtyX = 300;
            const priceX = 370;
            const amountX = 450;

            doc.text('Description', descX, tableTop);
            doc.text('Qty', qtyX, tableTop);
            doc.text('Unit Price', priceX, tableTop);
            doc.text('Amount', amountX, tableTop);

            doc.moveTo(50, tableTop + 15)
                .lineTo(550, tableTop + 15)
                .stroke();

            doc.moveDown();
            doc.font('Helvetica').fontSize(10);

            let yPos = doc.y;
            lineItems.forEach((line: any, i: number) => {
                doc.text(line.description || `Line ${line.lineNumber}`, descX, yPos, { width: 240 });
                doc.text(String(line.quantity || 1), qtyX, yPos);
                doc.text(`$${Number(line.unitPrice || 0).toFixed(2)}`, priceX, yPos);
                doc.text(`$${Number(line.amount || 0).toFixed(2)}`, amountX, yPos);
                yPos += 25;
            });

            doc.moveDown(2);

            // Total
            doc.fontSize(12).font('Helvetica-Bold');
            doc.text(`Total Amount:`, 370, doc.y);
            doc.text(`$${Number(invoice.totalAmount).toFixed(2)}`, 450, doc.y);

            // Footer
            doc.fontSize(9)
                .font('Helvetica')
                .moveDown(3)
                .text('Thank you for your business!', { align: 'center' });

            doc.end();
        });
    }

    /**
     * Generate statement PDF with aging
     */
    async generateStatementPDF(customerId: string, period: string): Promise<Buffer> {
        const customer = await arService.getCustomer(customerId);
        if (!customer) throw new Error('Customer not found');

        const invoices = await arService.listInvoices();
        const myInvoices = invoices.filter((i: any) => i.customerId === customerId);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(20)
                .font('Helvetica-Bold')
                .text('ACCOUNT STATEMENT', { align: 'center' });

            doc.fontSize(10)
                .font('Helvetica')
                .text(`Period: ${period}`, { align: 'center' })
                .moveDown(2);

            // Customer Info
            doc.fontSize(12).font('Helvetica-Bold').text('Account:');
            doc.fontSize(10).font('Helvetica')
                .text(customer.name)
                .text(customer.contactEmail || '')
                .moveDown();

            // Aging Summary
            const current = myInvoices.filter((i: any) => this.calculateAge(i) <= 30 && i.status !== 'Paid').reduce((sum: number, i: any) => sum + Number(i.totalAmount), 0);
            const days30 = myInvoices.filter((i: any) => this.calculateAge(i) > 30 && this.calculateAge(i) <= 60 && i.status !== 'Paid').reduce((sum: number, i: any) => sum + Number(i.totalAmount), 0);
            const days60 = myInvoices.filter((i: any) => this.calculateAge(i) > 60 && this.calculateAge(i) <= 90 && i.status !== 'Paid').reduce((sum: number, i: any) => sum + Number(i.totalAmount), 0);
            const days90Plus = myInvoices.filter((i: any) => this.calculateAge(i) > 90 && i.status !== 'Paid').reduce((sum: number, i: any) => sum + Number(i.totalAmount), 0);

            doc.fontSize(11).font('Helvetica-Bold').text('Aging Summary');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Current (0-30 days): $${current.toFixed(2)}`);
            doc.text(`31-60 days: $${days30.toFixed(2)}`);
            doc.text(`61-90 days: $${days60.toFixed(2)}`);
            doc.text(`90+ days: $${days90Plus.toFixed(2)}`);
            doc.moveDown();

            const total = current + days30 + days60 + days90Plus;
            doc.fontSize(12).font('Helvetica-Bold')
                .text(`Total Outstanding: $${total.toFixed(2)}`);

            doc.moveDown(2);

            // Invoice List
            doc.fontSize(11).font('Helvetica-Bold').text('Invoice Details');
            doc.fontSize(9).font('Helvetica');

            myInvoices.slice(0, 20).forEach((inv: any) => {
                doc.text(`${inv.invoiceNumber} - ${new Date(inv.createdAt || Date.now()).toLocaleDateString()} - $${Number(inv.totalAmount).toFixed(2)} - ${inv.status}`);
            });

            doc.end();
        });
    }

    private calculateAge(invoice: any): number {
        if (!invoice.dueDate) return 0;
        const dueDate = new Date(invoice.dueDate);
        const today = new Date();
        const diff = today.getTime() - dueDate.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
}

export const pdfGenerator = new PDFGenerator();
