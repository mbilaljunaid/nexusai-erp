import { apService } from "../server/services/ap";
import { db } from "../server/db";
import { apSuppliers, apInvoices, apPayments, apInvoicePayments, slaEventClasses } from "../shared/schema";
import { eq, sql } from "drizzle-orm";

async function verify() {
    console.log("Starting AP Payment Void Verification...");

    try {
        // 0. Ensure Event Class exists
        await db.execute(sql`
            INSERT INTO sla_event_classes (id, application_id, name, description)
            VALUES ('AP_PAYMENT_VOIDED', 'AP', 'Payables Payment Void', 'Voiding a payment')
            ON CONFLICT (id) DO NOTHING;
        `);

        // 1. Setup Data
        const [supplier] = await db.insert(apSuppliers).values({
            name: "Void Test Supplier",
            supplierNumber: "SUPP-VOID-" + Date.now()
        }).returning();

        const [invoice] = await db.insert(apInvoices).values({
            supplierId: supplier.id,
            invoiceNumber: "INV-VOID-" + Date.now(),
            invoiceAmount: "1000.00",
            invoiceCurrencyCode: "USD",
            invoiceType: "STANDARD",
            paymentStatus: "UNPAID",
            invoiceDate: new Date(),
            dueDate: new Date()
        }).returning();

        // 2. Pay Invoice
        console.log("- Paying Invoice...");
        const paymentData = {
            paymentDate: new Date(),
            amount: "1000.00",
            currencyCode: "USD",
            paymentMethodCode: "CHECK",
            supplierId: supplier.id,
            status: "NEGOTIABLE"
        };
        const payment = await apService.applyPayment(String(invoice.id), paymentData as any);
        if (!payment) throw new Error("Payment creation failed");

        const [paidInvoice] = await db.select().from(apInvoices).where(eq(apInvoices.id, invoice.id));
        console.log(`Invoice Payment Status after Payment: ${paidInvoice.paymentStatus}`);
        if (paidInvoice.paymentStatus !== "PAID") throw new Error("Invoice should be PAID");

        // 3. Void Payment
        console.log("- Voiding Payment...");
        await apService.voidPayment(payment.id, "test-user");

        // 4. Verify
        const [voidPayment] = await db.select().from(apPayments).where(eq(apPayments.id, payment.id));
        console.log(`Payment Status after Void: ${voidPayment.status}`);
        if (voidPayment.status !== "VOID") throw new Error("Payment should be VOID");

        const [revertedInvoice] = await db.select().from(apInvoices).where(eq(apInvoices.id, invoice.id));
        console.log(`Invoice Payment Status after Void: ${revertedInvoice.paymentStatus}`);
        if (revertedInvoice.paymentStatus !== "UNPAID") throw new Error("Invoice should be UNPAID");

        console.log("\nVERIFICATION SUCCESSFUL - Payment Void logic confirmed.");
    } catch (e) {
        console.error("\nVERIFICATION FAILED:", e);
        process.exit(1);
    }
}

verify();
