import { apService } from "../server/services/ap";
import { db } from "../server/db";
import { apSuppliers, apInvoices, apInvoiceLines } from "../shared/schema";
import { eq, and } from "drizzle-orm";

async function verify() {
    console.log("Starting AP Prepayment Verification...");

    try {
        // 1. Setup Data
        console.log("- Creating test supplier...");
        const [supplier] = await db.insert(apSuppliers).values({
            name: "Prepay Test Supplier",
            supplierNumber: "SUPP-PRE-" + Date.now()
        }).returning();

        // 2. Create Prepayment Invoice
        console.log("- Creating Prepayment Invoice ($1000)...");
        const prepayInvoice = await apService.createInvoice({
            header: {
                supplierId: supplier.id,
                invoiceNumber: "PRE-" + Date.now(),
                invoiceAmount: "1000.00",
                invoiceCurrencyCode: "USD",
                invoiceType: "PREPAYMENT",
                invoiceDate: new Date(),
                dueDate: new Date()
            },
            lines: [{ lineNumber: 1, lineType: "ITEM", amount: "1000.00", description: "Advance" }]
        });

        // Simulating the prepayment being PAID (which allows application)
        console.log("- Marking Prepayment as PAID...");
        await db.update(apInvoices)
            .set({
                paymentStatus: "PAID",
                prepayAmountRemaining: "1000.00"
            })
            .where(eq(apInvoices.id, prepayInvoice.id));

        // 3. Create Standard Invoice
        console.log("- Creating Standard Invoice ($500)...");
        const stdInvoice = await apService.createInvoice({
            header: {
                supplierId: supplier.id,
                invoiceNumber: "STD-" + Date.now(),
                invoiceAmount: "500.00",
                invoiceCurrencyCode: "USD",
                invoiceType: "STANDARD",
                invoiceDate: new Date(),
                dueDate: new Date()
            },
            lines: [{ lineNumber: 1, lineType: "ITEM", amount: "500.00", description: "Services" }]
        });

        // 4. Test listAvailablePrepayments
        console.log("- Checking available prepayments...");
        const available = await apService.listAvailablePrepayments(supplier.id);
        console.log(`Found ${available.length} available prepayments`);
        if (available.length === 0) throw new Error("Prepayment not listed as available");

        // 5. Apply Prepayment
        console.log("- Applying $200 from Prepayment to Standard Invoice...");
        await apService.applyPrepayment(stdInvoice.id, prepayInvoice.id, 200, "test-user");

        // 6. Verify Balances
        console.log("- Verifying balances...");
        const [updatedPrepay] = await db.select().from(apInvoices).where(eq(apInvoices.id, prepayInvoice.id));
        console.log(`Remaining Prepayment Balance: $${updatedPrepay.prepayAmountRemaining}`);
        if (Number(updatedPrepay.prepayAmountRemaining) !== 800) throw new Error("Balance mismatch on Prepayment");

        const [updatedStd] = await db.select().from(apInvoices).where(eq(apInvoices.id, stdInvoice.id));
        console.log(`Standard Invoice Payment Status: ${updatedStd.paymentStatus}`);
        if (updatedStd.paymentStatus !== "PARTIAL") throw new Error("Status should be PARTIAL");

        // 7. Apply remaining balance to fully pay invoice
        console.log("- Applying remaining $300 to fully pay Standard Invoice...");
        await apService.applyPrepayment(stdInvoice.id, prepayInvoice.id, 300, "test-user");

        const [finalStd] = await db.select().from(apInvoices).where(eq(apInvoices.id, stdInvoice.id));
        console.log(`Final Standard Invoice Payment Status: ${finalStd.paymentStatus}`);
        if (finalStd.paymentStatus !== "PAID") throw new Error("Status should be PAID");

        console.log("\nVERIFICATION SUCCESSFUL!");
    } catch (e) {
        console.error("\nVERIFICATION FAILED:", e);
        process.exit(1);
    }
}

verify();
