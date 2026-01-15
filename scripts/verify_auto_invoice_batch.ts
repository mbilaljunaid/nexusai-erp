
import "dotenv/config";
import { db } from "../server/db";
import { billingEvents, billingBatches, billingProfiles } from "@shared/schema/billing_enterprise";
import { arInvoices, arInvoiceLines, arCustomers } from "@shared/schema/ar";
import { billingService } from "../server/modules/billing/BillingService";
import { eq, inArray } from "drizzle-orm";

async function verifyAutoInvoiceBatch() {
    console.log("🚀 Starting Auto-Invoice Batch Verification...");

    try {
        // 1. Setup Test Data
        const cust1Name = "Batch Tester A";
        const cust2Name = "Batch Tester B";

        console.log("👉 Creating Test Customers...");
        const [cust1] = await db.insert(arCustomers).values({ name: cust1Name, accountNumber: "BT-001", status: "Active" }).returning();
        const [cust2] = await db.insert(arCustomers).values({ name: cust2Name, accountNumber: "BT-002", status: "Active" }).returning();

        // Ensure profiles exist
        await db.insert(billingProfiles).values([
            { customerId: cust1.id, currency: "USD", paymentTerms: "Net 30" },
            { customerId: cust2.id, currency: "EUR", paymentTerms: "Immediate" }
        ]);

        console.log("👉 Creating 10 Pending Events (5 each)...");
        const events = [];
        for (let i = 0; i < 5; i++) {
            events.push({
                customerId: cust1.id,
                amount: "100.00",
                description: `Srv A - Item ${i}`,
                eventDate: new Date(),
                status: "Pending",
                sourceSystem: "Test",
                sourceTransactionId: `t1-${i}`
            });
            events.push({
                customerId: cust2.id,
                amount: "200.00",
                description: `Srv B - Item ${i}`,
                eventDate: new Date(),
                status: "Pending",
                sourceSystem: "Test",
                sourceTransactionId: `t2-${i}`
            });
        }
        const createdEvents = await db.insert(billingEvents).values(events).returning();
        console.log(`✅ Created ${createdEvents.length} events.`);

        // 2. Run Auto-Invoice
        console.log("👉 Running Auto-Invoice Engine (Batched)...");
        const startTime = Date.now();
        const result = await billingService.runAutoInvoice("BenchmarkBot");
        const duration = Date.now() - startTime;

        console.log(`⏱️ Execution Time: ${duration}ms`);
        console.log(`📊 Result: Batch ${result.batchId}, Created ${result.count} Invoices.`);

        // 3. Verify Output
        if (result.count !== 2) throw new Error(`Expected 2 invoices, got ${result.count}`);

        const invoices = await db.select().from(arInvoices).where(inArray(arInvoices.id, result.invoiceIds));
        const lines = await db.select().from(arInvoiceLines).where(inArray(arInvoiceLines.invoiceId, result.invoiceIds));

        console.log(`✅ Invoices Found in DB: ${invoices.length}`);
        console.log(`✅ Lines Found in DB: ${lines.length} (Expected 10)`);

        if (lines.length !== 10) throw new Error("Line count mismatch!");

        // 4. Verify Linkage
        const updatedEvents = await db.select().from(billingEvents).where(inArray(billingEvents.id, createdEvents.map(e => e.id)));
        const unlinked = updatedEvents.filter(e => !e.invoiceId || e.status !== "Invoiced");

        if (unlinked.length > 0) throw new Error(`Found ${unlinked.length} events not correctly linked/updated.`);
        console.log("✅ All events correctly linked to invoices.");

        console.log("\n🎉 BATCH PROCESSING VERIFIED SUCCESSFUL.");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ VERIFICATION FAILED:", error);
        process.exit(1);
    }
}

verifyAutoInvoiceBatch();
