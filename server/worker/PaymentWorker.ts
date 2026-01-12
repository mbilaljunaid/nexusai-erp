import { db } from "../db";
import { apPaymentBatches, apInvoices, apPayments, apInvoicePayments, glLedgers, apHolds, apSupplierSites, apSuppliers } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { slaService } from "../services/SlaService";

export class PaymentWorker {
    static async processBatch(batchId: number) {
        console.log(`[Worker] Starting async processing for Payment Batch ${batchId}...`);

        try {
            await db.transaction(async (tx) => {
                const [batch] = await tx.select().from(apPaymentBatches).where(eq(apPaymentBatches.id, batchId)).limit(1);
                if (!batch) throw new Error("Batch not found");

                // 1. Select Invoices (Re-implementing logic to avoid circular dependency with ApService)
                // Filter: Unpaid, Validated, Due or CheckDate, No Holds
                const selectionCriteria = [
                    eq(apInvoices.paymentStatus, "UNPAID"),
                    eq(apInvoices.validationStatus, "VALIDATED"),
                    sql`(${apInvoices.dueDate} <= ${batch.checkDate} OR ${apInvoices.dueDate} IS NULL)`
                ];

                const invoicesWithHolds = tx.select({ id: apHolds.invoice_id })
                    .from(apHolds)
                    .where(sql`${apHolds.release_lookup_code} IS NULL`);

                const selectedInvoices = await tx.select()
                    .from(apInvoices)
                    .where(and(
                        ...selectionCriteria,
                        sql`${apInvoices.id} NOT IN (${invoicesWithHolds})`
                    ));

                if (selectedInvoices.length === 0) {
                    throw new Error("No eligible invoices found for this batch.");
                }

                console.log(`[Worker] Selected ${selectedInvoices.length} invoices for payment.`);

                // Update Batch Totals (Snapshot)
                const total = selectedInvoices.reduce((sum: number, inv: any) => sum + Number(inv.invoiceAmount), 0);
                await tx.update(apPaymentBatches)
                    .set({
                        totalAmount: total.toString(),
                        paymentCount: selectedInvoices.length,
                        // status remains PROCESSING until done
                    })
                    .where(eq(apPaymentBatches.id, batchId));

                // 2. Process Payments
                const [ledger] = await tx.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
                const ledgerId = ledger?.id || "PRIMARY";
                const CHUNK_SIZE = 100; // Chunking for memory safety

                for (let i = 0; i < selectedInvoices.length; i += CHUNK_SIZE) {
                    const chunk = selectedInvoices.slice(i, i + CHUNK_SIZE);

                    for (const invoice of chunk) {
                        // Create Payment
                        const [payment] = await tx.insert(apPayments).values({
                            paymentDate: batch.checkDate,
                            amount: invoice.invoiceAmount,
                            currencyCode: invoice.invoiceCurrencyCode,
                            paymentMethodCode: batch.paymentMethodCode || "CHECK",
                            supplierId: invoice.supplierId,
                            batchId: batchId,
                            status: "NEGOTIABLE"
                        }).returning();

                        // Link to Invoice
                        await tx.insert(apInvoicePayments).values({
                            paymentId: payment.id,
                            invoiceId: invoice.id,
                            amount: invoice.invoiceAmount,
                            accountingDate: batch.checkDate
                        });

                        // Update Invoice Status
                        await tx.update(apInvoices)
                            .set({ paymentStatus: "PAID", invoiceStatus: "PAID" })
                            .where(eq(apInvoices.id, invoice.id));

                        // Trigger SLA (Can be awaited here or pushed to another queue)
                        // We await it to ensure accounting integrity before confirming batch success
                        await slaService.createAccounting({
                            eventClass: "AP_PAYMENT_CREATED",
                            entityId: String(invoice.id),
                            entityTable: "ap_invoices",
                            description: `Payment for Invoice ${invoice.invoiceNumber}`,
                            amount: Number(invoice.invoiceAmount),
                            currency: invoice.invoiceCurrencyCode,
                            date: batch.checkDate,
                            ledgerId,
                            sourceData: { supplierId: invoice.supplierId, withholdingAmount: invoice.withholdingTaxAmount }
                        });
                    }
                    // Optional: yield to event loop if heavy
                    await new Promise(resolve => setTimeout(resolve, 10));
                }

                // 3. Complete Batch
                await tx.update(apPaymentBatches)
                    .set({ status: "CONFIRMED" })
                    .where(eq(apPaymentBatches.id, batchId));

                console.log(`[Worker] Batch ${batchId} processing completed successfully.`);
            });
        } catch (err: any) {
            console.error(`[Worker] Batch ${batchId} failed:`, err);
            await db.update(apPaymentBatches)
                .set({ status: "ERROR" }) // Add ERROR status handling in UI
                .where(eq(apPaymentBatches.id, batchId));
        }
    }
}
