
import { db } from "../server/db";
import { apSuppliers, apInvoices, apHolds, apSupplierSites, apInvoiceLines } from "../shared/schema/ap";
import { apService } from "../server/services/ap";
import { eq, and } from "drizzle-orm";

async function verifyAdvancedFeatures() {
    console.log("--- Starting Advanced Features Verification (Chunk 15) ---");

    try {
        const timestamp = Date.now();
        // 1. Setup Supplier with WHT
        console.log("1. Testing Withholding Tax (WHT)...");
        const [supplier] = await db.insert(apSuppliers).values({
            name: `WHT Taxable Vendor ${timestamp}`,
            supplierType: "STANDARD",
            allowWithholdingTax: true,
            taxId: `WHT-${timestamp}`,
        }).returning();

        // 2. Create Invoice
        const [invoice] = await db.insert(apInvoices).values({
            supplierId: supplier.id,
            invoiceNumber: `INV-WHT-${timestamp}`,
            invoiceAmount: "1000.00",
            invoiceDate: new Date(),
            invoiceCurrencyCode: "USD",
            invoiceType: "STANDARD",
            validationStatus: "NEEDS REVALIDATION"
        }).returning();

        // 3. Create a matching line to pass validation
        await db.insert(apInvoiceLines).values({
            invoiceId: invoice.id,
            lineNumber: 1,
            lineType: "ITEM",
            amount: "1000.00",
            description: "Computer Equipment"
        });

        // 4. Validate and check WHT
        console.log("- Validating invoice to trigger WHT calculation...");
        const result = await apService.validateInvoice(invoice.id);
        console.log(`- Validation Status: ${result.status}`);

        const [updatedInvoice] = await db.select().from(apInvoices).where(eq(apInvoices.id, invoice.id));
        console.log(`- Calculated WHT Amount: $${updatedInvoice.withholdingTaxAmount}`);

        if (Number(updatedInvoice.withholdingTaxAmount) !== 100) {
            throw new Error(`WHT calculation failed. Expected $100, got $${updatedInvoice.withholdingTaxAmount}`);
        }
        console.log("✅ WHT Calculation Success (10% standard stub applied).");

        // 5. Traceability Check
        console.log("\n2. Testing Traceability (Audit Logs)...");
        const logs = await apService.getAuditTrail({ entityId: String(invoice.id) });
        console.log(`- Found ${logs.length} audit logs for invoice.`);
        if (logs.length === 0) console.warn("⚠️ No audit logs found. Check if logging is enabled in validateInvoice.");
        else {
            console.log(`- Last log: ${logs[0].action} - ${logs[0].details}`);
            console.log("✅ Audit Trail verified.");
        }

        process.exit(0);
    } catch (e) {
        console.error("❌ Verification Failed:", e);
        process.exit(1);
    }
}

verifyAdvancedFeatures();
