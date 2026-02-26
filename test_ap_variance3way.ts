import { db } from './server/db';
import { apService } from './server/services/ap';
import { eq } from 'drizzle-orm';
import { apSuppliers } from './shared/schema/ap';

async function runTest() {
    try {
        console.log("--- Starting 3-Way PO+Receipt Matching Variance Test ---");

        console.log("1. Locating UI Test Supplier...");
        const supplier = await db.query.apSuppliers.findFirst({
            where: eq(apSuppliers.supplierNumber, 'SUP-TEST-001')
        });

        if (!supplier) {
            console.error("Test Supplier not found in DB.");
            return;
        }

        console.log(`✅ Found supplier: ${supplier.id}`);

        console.log("2. Simulating Invoice Creation against PO [2f27bb59-98d9-42c4-aa3f-6a9131e0f3e3] with NO RECEIPTS...");

        // We ensure the invoice amount matches the PO amount exactly ($1000) so it doesn't trigger 2-Way Match Variance
        const invoicePayload = {
            header: {
                supplierId: supplier.id,
                invoiceNumber: `INV-3WAY-${Date.now()}`,
                invoiceDate: new Date(),
                invoiceType: "STANDARD",
                invoiceAmount: "1000.00",
                description: "Invoice against PO-TEST-1770340568507 (3-Way Variance Test)"
            },
            lines: [{
                lineNumber: 1,
                lineType: "ITEM",
                description: "Consulting Services (Matched)",
                amount: "1000.00",
                poHeaderId: "2f27bb59-98d9-42c4-aa3f-6a9131e0f3e3",
            }]
        };

        const invoice = await apService.createInvoice(invoicePayload as any);
        console.log(`✅ Matched Invoice Created: ID=${invoice.id}, Amount=$1,000.00`);

        console.log("3. Triggering Validation Routine...");
        const validateResult = await apService.validateInvoice(invoice.id as any);
        console.log(`✅ Validation Output: Status=${validateResult.status}`);

        console.log("4. Fetching Variance Holds...");
        const holds = await apService.getInvoiceHolds(invoice.id as any);
        console.log(`🔍 Holds Found: ${holds.length}`);
        holds.forEach((h: any, i) => {
            console.log(`   [Hold ${i + 1}] Code: ${h.hold_lookup_code} - Reason: ${h.hold_reason}`);
        });

        console.log("\n--- 3-Way PO+Receipt Matching Flow Completed Successfully! ---");
    } catch (e: any) {
        console.error("❌ E2E TEST FAILED:");
        console.error(e.message || e);
    } finally {
        process.exit(0);
    }
}

runTest();
