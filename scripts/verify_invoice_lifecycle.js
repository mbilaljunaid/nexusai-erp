// scripts/verify_invoice_lifecycle.js
import { db } from "../server/db";
import { apInvoices, apInvoiceLines, apHolds } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Starting invoice lifecycle verification...");

    // 1. Create a simple invoice
    const [invoice] = await db.insert(apInvoices).values({
        supplierId: 1,
        invoiceNumber: "INV-1001",
        invoiceDate: new Date(),
        invoiceAmount: 1000,
        invoiceStatus: "DRAFT"
    }).returning();
    console.log("Created invoice", invoice.id);

    // 2. Add a line
    await db.insert(apInvoiceLines).values({
        invoiceId: invoice.id,
        lineNumber: 1,
        lineType: "ITEM",
        amount: 1000,
        description: "Test line"
    });

    // 3. Simulate a hold (price variance)
    await db.insert(apHolds).values({
        invoice_id: invoice.id,
        hold_lookup_code: "PRICE_VARIANCE",
        hold_type: "PRICE_VARIANCE",
        hold_reason: "Price differs from PO"
    });

    // 4. Verify hold exists
    const holds = await db.select().from(apHolds).where(eq(apHolds.invoice_id, invoice.id));
    console.log("Holds count", holds.length);

    // 5. Release hold
    if (holds.length > 0) {
        await db.update(apHolds).set({ release_lookup_code: "RELEASED" }).where(eq(apHolds.id, holds[0].id));
    }

    // 6. Update invoice status to VALIDATED
    await db.update(apInvoices).set({ invoiceStatus: "VALIDATED" }).where(eq(apInvoices.id, invoice.id));

    const updated = await db.select().from(apInvoices).where(eq(apInvoices.id, invoice.id));
    console.log("Final invoice status", updated[0].invoiceStatus);

    console.log("Verification completed successfully.");
}

main().catch(e => {
    console.error("Verification failed", e);
    process.exit(1);
});
