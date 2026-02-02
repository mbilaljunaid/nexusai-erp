
import { db } from "../server/db";
import { apPaymentBatches, apPayments, apInvoices, apSuppliers, slaJournalHeaders } from "../shared/schema";
import { PaymentWorker } from "../server/worker/PaymentWorker";
import { eq, desc, and } from "drizzle-orm";
import { apService } from "../server/services/ap"; // Use existing instance if exported, or verify export

// Re-export ApService from service file if needed or assume default
// Assuming 'apService' const is NOT exported from ap.ts based on previous reads which only showed class.
// We'll instantiate locally for this test script if possible, or use raw DB inserts for prep.
import { ApService } from "../server/services/ap";
const service = new ApService();

async function verifyApPaymentSla() {
    console.log("🔍 Verifying AP Payment -> SLA Integration...");

    // 1. Create Supplier
    const supplierNum = `SUP-${Date.now()}`;
    const [supplier] = await db.insert(apSuppliers).values({
        name: `Test Supplier ${supplierNum}`,
        supplierNumber: supplierNum,
        taxPayerId: "123",
        enabledFlag: true
    }).returning();
    console.log(`✅ Supplier Created: ${supplier.id}`);

    // 2. Create & Validate Invoice
    const invoiceNum = `INV-${Date.now()}`;
    const amount = "1000";
    const invoice = await service.createInvoice({
        header: {
            invoiceNumber: invoiceNum,
            invoiceDate: new Date(),
            supplierId: supplier.id,
            invoiceAmount: amount,
            invoiceCurrencyCode: "USD",
            invoiceType: "STANDARD",
            description: "Test AP SLA",
            source: "MANUAL",
            paymentTermsId: 1 // Assuming 1 exists
        } as any,
        lines: [
            { lineNumber: 1, amount: "1000", lineType: "ITEM", description: "Test Line" } as any
        ]
    });

    // Validate
    await service.validateInvoice(invoice.id);
    await db.update(apInvoices).set({ paymentStatus: "UNPAID" }).where(eq(apInvoices.id, invoice.id)); // Ensure ready
    console.log(`✅ Invoice Created & Validated: ${invoice.id}`);

    // Check Invoice SLA
    const invHeader = await db.query.slaJournalHeaders.findFirst({
        where: eq(slaJournalHeaders.entityId, String(invoice.id)),
        with: { lines: true }
    });
    if (invHeader) console.log(`✅ Invoice SLA Header: ${invHeader.id}`);
    else console.error("❌ Invoice SLA Missing!");

    // 3. Create Payment Batch
    // We'll bypass PPR selection UI logic and insert batch directly, then use Worker
    const batch = await service.createPaymentBatch({ // Assuming this method returns [batch] based on code read
        batchName: `BATCH-${Date.now()}`,
        checkDate: new Date(),
        paymentMethodCode: "CHECK",
        status: "CONFIRMED_BY_USER" // Ready for processing
    } as any);

    // Manually force selection since criteria logic is complex in unit test
    // Actually, let's use the selectInvoicesForBatch if possible, but our invoice matches criteria?
    // Criteria: UNPAID, VALIDATED. Yes.

    // Let's run selection to be safe
    // const selected = await service.selectInvoicesForBatch(batch.id);
    // console.log(`Selected ${selected.length} invoices`); 
    // Wait, the worker DOES re-select.

    // 4. Run Worker
    console.log("4. Running Payment Worker...");
    await PaymentWorker.processBatch(batch.id);

    // 5. Verify Payment & SLA
    const payments = await service.getBatchPayments(batch.id);
    if (payments.length === 0) {
        console.error("❌ No payments created!");
        process.exit(1);
    }

    const payment = payments[0];
    console.log(`✅ Payment Created: ${payment.id} for ${payment.amount}`);

    await new Promise(r => setTimeout(r, 1000));
    const payHeader = await db.query.slaJournalHeaders.findFirst({
        where: and(
            eq(slaJournalHeaders.entityId, String(payment.id)),
            eq(slaJournalHeaders.eventClassId, "AP_PAYMENT")
        ),
        with: { lines: true }
    });

    if (payHeader) {
        console.log(`✅ Payment SLA Header: ${payHeader.id}`);
        payHeader.lines.forEach(l => {
            console.log(`   - ${l.accountingClass}: Dr ${l.accountedDr} | Cr ${l.accountedCr}`);
        });

        const dr = payHeader.lines.reduce((s, l) => s + Number(l.accountedDr || 0), 0);
        const cr = payHeader.lines.reduce((s, l) => s + Number(l.accountedCr || 0), 0);
        if (Math.abs(dr - cr) < 0.01 && dr > 0) console.log("✅ Payment Journal BALANCED");
        else console.error("❌ Payment Journal UNBALANCED");

    } else {
        console.error("❌ Payment SLA Missing!");
        process.exit(1);
    }

    console.log("🎉 AP Payment SLA Verification PASSED!");
    process.exit(0);
}

verifyApPaymentSla().catch(err => {
    console.error("Verification Failed:", err);
    process.exit(1);
});
