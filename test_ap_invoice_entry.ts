import { db } from './server/db';
import { apService } from './server/services/ap';
import { eq } from 'drizzle-orm';
import { apSuppliers, apInvoices } from './shared/schema/ap';

async function runTest() {
    try {
        console.log("Locating UI Test Supplier...");
        const supplier = await db.query.apSuppliers.findFirst({
            where: eq(apSuppliers.supplierNumber, 'SUP-TEST-001')
        });

        if (!supplier) {
            console.error("Test Supplier not found in DB.");
            return;
        }

        console.log(`Found supplier: ${supplier.id}`);

        const payload = {
            header: {
                supplierId: supplier.id,
                invoiceNumber: "INV-E2E-TEST",
                invoiceDate: new Date("2026-02-26T00:00:00.000Z"),
                dueDate: new Date("2026-03-26T00:00:00.000Z"),
                description: "Automated Integration Test",
                invoiceType: "STANDARD",
                invoiceCurrencyCode: "USD",
                paymentCurrencyCode: "USD",
                invoiceAmount: "7500.00",
                validationStatus: "NEVER VALIDATED",
                approvalStatus: "REQUIRED",
                paymentStatus: "UNPAID",
                accountingStatus: "UNACCOUNTED",
                invoiceStatus: "DRAFT",
                paymentMethod: "ELECTRONIC"
            },
            lines: [{
                lineNumber: 1,
                lineType: "ITEM",
                description: "Consulting Services",
                amount: "7500.00"
            }]
        };

        console.log("Simulating API call to create invoice module...");
        const invoice = await apService.createInvoice(payload as any);
        console.log("Invoice created raw response: ", JSON.stringify(invoice, null, 2));

        if (!invoice || !invoice.id) {
            throw new Error("Invoice ID missing from creation response.");
        }

        console.log(`✅ SUCCESS: Invoice Header Created: ID=${invoice.id}`);

        console.log("Simulating Action: Validate Invoice...");
        const validateResult = await apService.validateInvoice(invoice.id);
        console.log(`✅ SUCCESS: Validation Result: Status=${validateResult.status}, Message=${validateResult.message}`);
        
        console.log("Checking Holds...");
        const holds = await apService.getInvoiceHolds(invoice.id);
        console.log(`✅ SUCCESS: Found ${holds.length} active holds.`);

        console.log("\n--- E2E Flow Completed Successfully! ---");
    } catch (e: any) {
        console.error("❌ E2E TEST FAILED:");
        console.error(e.message || e);
    } finally {
        process.exit(0);
    }
}

runTest();
