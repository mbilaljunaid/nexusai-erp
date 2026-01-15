
import { db } from "../server/db";
import {
    treasuryNettingBatches, treasuryNettingLines, treasuryInternalAccounts,
    apInvoices, apSuppliers, arInvoices, arCustomers
} from "../shared/schema/index";
import { nettingService } from "../server/services/NettingService";
import { eq } from "drizzle-orm";

async function verifyPhase4() {
    console.log("🚀 Starting Treasury Phase 4 Verification (In-House Banking & Netting)...");

    try {
        // 1. Setup Data: Create 2 Subsidiary Entities (Simulated as Internal Accounts)
        console.log("Seeding Internal Entities...");
        const [subA] = await db.insert(treasuryInternalAccounts).values({
            entityName: "US-East Subsidiary",
            currency: "USD",
            balance: "1000000"
        }).returning();

        const [subB] = await db.insert(treasuryInternalAccounts).values({
            entityName: "EU-West Subsidiary",
            currency: "USD", // Keeping USD for simplicity in this cycle
            balance: "500000"
        }).returning();

        // 2. Setup Intercompany Relationships (as Supplier/Customer)
        console.log("Seeding Intercompany Partners...");

        // Sub B acts as a Supplier to Sub A (Sub A owes Sub B)
        const [suppliersubB] = await db.insert(apSuppliers).values({
            name: "EU-West Subsidiary (Intercompany)",
            status: "ACTIVE",
            currency: "USD"
        }).returning();

        // Sub A acts as a Customer to Sub B (Sub B has receivable from Sub A)
        // For simplicity, we'll just create a Payable on Sub A's books. 
        // In a full multi-org setup, we'd have mirrored transactions.
        // Here, we simulate we are "HQ" or "Netting Center" seeing everyone's open items.
        // Let's assume we are netting "Open Payables" across the group.

        // 3. Create Transactions
        console.log("Creating Intercompany Invoices...");

        // Invoice 1: Sub A owes Supplier (Sub B) $50,000
        const [inv1] = await db.insert(apInvoices).values({
            invoiceNumber: `INV-IC-${Date.now()}-1`,
            supplierId: suppliersubB.id,
            invoiceDate: new Date(),
            dueDate: new Date(), // Due today
            invoiceAmount: "50000.00",
            invoiceCurrencyCode: "USD",
            status: "APPROVED" // Ready for payment/netting
        }).returning();

        // Invoice 2: Some External Noise (Should potentially be ignored if we filtered strictly, 
        // but current logic picks all due approved. checking if it picks up)
        const [inv2] = await db.insert(apInvoices).values({
            invoiceNumber: `INV-EXT-${Date.now()}-2`,
            supplierId: suppliersubB.id, // Re-using supplier for simplicity, pretending it's external for test
            invoiceDate: new Date(),
            dueDate: new Date(),
            invoiceAmount: "120.00",
            invoiceCurrencyCode: "USD",
            status: "APPROVED"
        }).returning();

        // 4. Run Netting Engine
        console.log("Running Netting Engine...");
        const batch = await nettingService.createNettingBatch(new Date());

        console.log(`✅ Batch Created: ${batch.batchNumber} (ID: ${batch.id})`);

        // 5. Verify Lines
        const lines = await db.select().from(treasuryNettingLines).where(eq(treasuryNettingLines.batchId, batch.id));
        console.log(`Found ${lines.length} eligible netting lines.`);

        const nettedInv1 = lines.find(l => l.sourceId === String(inv1.id));

        if (nettedInv1) {
            console.log(`✅ Invoice ${inv1.invoiceNumber} ($50,000) included in batch.`);
        } else {
            console.error("❌ Failed to include eligible intercompany invoice.");
            process.exit(1);
        }

        // 6. Check Positions
        const positions = await nettingService.getNetPositions(batch.id);
        console.log("Net Positions:", positions);

        // We expect Supplier (Entity ID) to be receiving? 
        // Wait, logic says: Payable -> Amount is Negative. 
        // So Entity (Supplier) ID in line means "We owe THIS entity".
        // So Position for this Entity should be PAYING (if we adhere to "Net amount > 0 is Receiving").
        // Net amount is -50000. So PAYING.

        // 7. Settle
        console.log("Settling Batch...");
        await nettingService.settleBatch(batch.id);

        const [updatedBatch] = await db.select().from(treasuryNettingBatches).where(eq(treasuryNettingBatches.id, batch.id));
        if (updatedBatch.status === 'SETTLED') {
            console.log("✅ Batch Status Updated to SETTLED.");
        } else {
            console.error("❌ Batch Status Mismatch.");
            process.exit(1);
        }

        console.log("🎉 Treasury Phase 4 Verification Passed!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyPhase4();
