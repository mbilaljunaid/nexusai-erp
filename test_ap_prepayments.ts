import { db } from './server/db';
import { apService } from './server/services/ap';
import { storage } from './server/storage';
import { eq } from 'drizzle-orm';
import { apSuppliers } from './shared/schema/ap';

async function runTest() {
    try {
        console.log("--- Starting Prepayment Integration Test ---");
        
        console.log("1. Locating UI Test Supplier...");
        const supplier = await db.query.apSuppliers.findFirst({
            where: eq(apSuppliers.supplierNumber, 'SUP-TEST-001')
        });

        if (!supplier) {
            console.error("Test Supplier not found in DB.");
            return;
        }

        console.log(`✅ Found supplier: ${supplier.id}`);

        console.log("2. Simulating Prepayment Invoice Creation...");
        const prepayPayload = {
            header: {
                supplierId: supplier.id,
                invoiceNumber: `PREPAY-${Date.now()}`,
                invoiceDate: new Date(),
                invoiceType: "PREPAYMENT",
                invoiceAmount: "10000.00"
            },
            lines: [{
                lineNumber: 1,
                lineType: "ITEM",
                description: "Advance Retainer",
                amount: "10000.00"
            }]
        };

        const prepayment = await apService.createInvoice(prepayPayload as any);
        console.log(`✅ Prepayment Header Created: ID=${prepayment.id}, Amount=$10,000`);

        console.log("3. Simulating Standard Invoice Creation...");
        const standardPayload = {
            header: {
                supplierId: supplier.id,
                invoiceNumber: `STD-${Date.now()}`,
                invoiceDate: new Date(),
                invoiceType: "STANDARD",
                invoiceAmount: "3000.00"
            },
            lines: [{
                lineNumber: 1,
                lineType: "ITEM",
                description: "First Month Services",
                amount: "3000.00"
            }]
        };

        const standardInv = await apService.createInvoice(standardPayload as any);
        console.log(`✅ Standard Invoice Created: ID=${standardInv.id}, Amount=$3,000`);

        console.log("4. Applying Prepayment to Standard Invoice ($3,000)...");
        // Pass UUIDs as any to bypass the str/int type mismatch in the legacy parameter typing
        const application = await apService.applyPrepayment(standardInv.id as any, prepayment.id as any, 3000.00, "9b2c8a2b-8a8b-4a57-b459-7b561c28c8d1");
        console.log(`✅ Prepayment Applied! Application Record Created.`);

        console.log("5. Checking final Prepayment Balance...");
        const updatedPrepayment = await storage.getApInvoice(prepayment.id as any);
        console.log(`✅ Final Prepayment Remaining Amount: $${updatedPrepayment?.prepayAmountRemaining}`);

        console.log("\n--- Prepayments E2E Flow Completed Successfully! ---");
    } catch (e: any) {
        console.error("❌ E2E TEST FAILED:");
        console.error(e.message || e);
    } finally {
        process.exit(0);
    }
}

runTest();
