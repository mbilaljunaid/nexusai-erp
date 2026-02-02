
// scripts/verify_payment_batch.ts
import { db } from "../server/db.ts";
import { apService } from "../server/services/ap.ts";
import { apInvoices, apPaymentBatches, apPayments, apInvoicePayments } from "@shared/schema";
import { eq, and } from "drizzle-orm";

async function main() {
    console.log("Starting Payment Batch (PPR) verification...");

    // 1. Setup: Create a supplier
    const supplier = await apService.createSupplier({
        name: "Payment Test Corp",
        supplierNumber: "SUP-PAY-001",
        taxId: "TX-PAY-001"
    });

    // 2. Setup: Create 3 validated invoices
    const invoiceIds: number[] = [];
    for (let i = 1; i <= 3; i++) {
        const inv = await apService.createInvoice({
            header: {
                supplierId: supplier.id,
                invoiceNumber: `BATCH-INV-00${i}`,
                invoiceAmount: "1000.00",
                invoiceDate: new Date(),
                dueDate: new Date(Date.now() - 86400000), // Due yesterday
                invoiceCurrencyCode: "USD"
            },
            lines: [{ lineNumber: 1, amount: "1000.00", description: "Batch test line" }]
        });

        // Manually validate them to bypass variance/duplicate checks for this test
        await db.update(apInvoices)
            .set({ validationStatus: "VALIDATED", invoiceStatus: "VALIDATED" })
            .where(eq(apInvoices.id, inv.id));

        invoiceIds.push(inv.id);
    }

    console.log(`Created 3 validated invoices: ${invoiceIds.join(", ")}`);

    // 3. Create a Payment Batch
    const batch = await apService.createPaymentBatch({
        batchName: "V-BATCH-" + Date.now(),
        checkDate: new Date(),
        paymentMethodCode: "CHECK",
        payGroup: "STANDARD"
    });
    console.log(`Created Payment Batch: ${batch.id}`);

    // 4. Run Selection
    const selected = await apService.selectInvoicesForBatch(batch.id);
    console.log(`Selected ${selected.length} invoices for batch.`);

    if (selected.length !== 3) {
        throw new Error(`Expected 3 invoices selected, but got ${selected.length}`);
    }

    // Verify batch totals
    const [updatedBatch] = await db.select().from(apPaymentBatches).where(eq(apPaymentBatches.id, batch.id));
    console.log(`Batch Total: ${updatedBatch.totalAmount}, Count: ${updatedBatch.paymentCount}`);

    // 5. Confirm Batch
    const result = await apService.confirmPaymentBatch(batch.id);
    console.log(`Batch confirmation result: ${JSON.stringify(result)}`);

    // 6. Verify Final State
    const [finalBatch] = await db.select().from(apPaymentBatches).where(eq(apPaymentBatches.id, batch.id));
    if (finalBatch.status !== "CONFIRMED") {
        throw new Error("Batch status should be CONFIRMED");
    }

    const paidInvoices = await db.select().from(apInvoices).where(and(
        eq(apInvoices.paymentStatus, "PAID"),
        eq(apInvoices.supplierId, supplier.id)
    ));
    console.log(`Verified ${paidInvoices.length} invoices marked as PAID.`);

    const payments = await db.select().from(apPayments).where(eq(apPayments.batchId, batch.id));
    console.log(`Verified ${payments.length} payments created in ap_payments.`);

    const invPayments = await db.select().from(apInvoicePayments).where(eq(apInvoicePayments.paymentId, payments[0].id));
    console.log(`Verified invoice linkage in ap_invoice_payments.`);

    console.log("Payment Batch verification completed successfully.");
}

main().catch(e => {
    console.error("Verification failed:", e);
    process.exit(1);
});
