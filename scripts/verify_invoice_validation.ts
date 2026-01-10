
import { db } from "../server/db";
import { apService } from "../server/services/ap";
import { apInvoices, apInvoiceLines, apHolds } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyValidation() {
    console.log("Verifying Invoice Validation Logic...");

    // 1. Create a Test Invoice with Variance
    const invData = {
        invoiceNumber: `TEST-VAL-${Date.now()}`,
        supplierId: 1,
        invoiceAmount: "100.00", // Header = 100
        invoiceDate: new Date(),
        invoiceCurrencyCode: "USD",
        description: "Test Variance Invoice"
    };

    const invoice = await apService.createInvoice(invData);
    console.log(`Created Invoice ${invoice.id}, Amount: ${invoice.invoiceAmount}`);

    // Create Line with Amount 90 (Variance of 10)
    await db.insert(apInvoiceLines).values({
        invoiceId: invoice.id,
        lineNumber: 1,
        amount: "90.00",
        lineType: "ITEM"
    });

    // 2. Run Validation
    console.log("Running Validate...");
    const result = await apService.validateInvoice(invoice.id);
    console.log("Validation Result:", result);

    if (result.status !== "NEEDS REVALIDATION") {
        console.error("FAILED: Expected NEEDS REVALIDATION, got", result.status);
        process.exit(1);
    }
    if (!result.holds.includes("LINE_VARIANCE")) {
        console.error("FAILED: Expected LINE_VARIANCE hold");
        process.exit(1);
    }

    // 3. Fix Variance
    console.log("Fixing Variance (Updating Line to 100)...");
    await db.update(apInvoiceLines).set({ amount: "100.00" }).where(eq(apInvoiceLines.invoiceId, invoice.id));

    // 4. Run Validation Again
    console.log("Running Validate again...");
    const result2 = await apService.validateInvoice(invoice.id);
    console.log("Validation Result 2:", result2);

    if (result2.status !== "VALIDATED") {
        console.error("FAILED: Expected VALIDATED, got", result2.status);
        process.exit(1);
    }

    console.log("SUCCESS: Validation Logic verified.");
    process.exit(0);
}

verifyValidation().catch(e => {
    console.error(e);
    process.exit(1);
});
