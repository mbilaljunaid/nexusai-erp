
import "dotenv/config";
import { db } from "../server/db";
import { arDunningRuns, arCollectorTasks, arInvoices, arCustomers, arCustomerAccounts, arCustomerSites, arDunningTemplates } from "@shared/schema";
import { arService } from "../server/services/ar";
import { eq, desc } from "drizzle-orm";

async function verifyArPerformance() {
    console.log("=== AR LEVEL-15 PERFORMANCE VERIFICATION ===");

    // 1. Setup Data: Single Overdue Invoice
    console.log("\n[1] Setting up Overdue Data...");
    // Ensure we have a template
    const [template] = await db.insert(arDunningTemplates).values({
        name: "Standard Overdue",
        daysOverdueMin: 1,
        daysOverdueMax: 30,
        severity: "Medium",
        subject: "Overdue Notice", // Added missing field
        letterTemplate: "Please pay.",
        active: true
    }).returning(); // Might fail if exists, but we ignore or assume fresh db for test logic or just proceed

    // Create Invoice (Backdated)
    const [customer] = await db.insert(arCustomers).values({ name: "Perf Test Client" }).returning();
    const [account] = await db.insert(arCustomerAccounts).values({ customerId: customer.id, accountName: "Perf Acc", accountNumber: `P-${Date.now()}` }).returning();
    const [site] = await db.insert(arCustomerSites).values({ accountId: account.id, siteName: "Site 1", address: "123" }).returning();

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 10); // 10 days overdue

    const invoice = await arService.createInvoice({
        customerId: customer.id,
        accountId: account.id,
        siteId: site.id,
        invoiceNumber: `INV-OVERDUE-${Date.now()}`,
        amount: "5000",
        totalAmount: "5000",
        dueDate: dueDate
    });
    // Force status to Sent
    await db.update(arInvoices).set({ status: "Sent" }).where(eq(arInvoices.id, invoice.id));

    // 2. Trigger Async Dunning Run
    console.log("\n[2] Triggering Dunning Run (Async)...");
    const start = Date.now();
    const { run } = await arService.createDunningRun();
    const duration = Date.now() - start;

    console.log(`API Call Duration: ${duration}ms (Expect < 100ms)`);
    if (duration > 500) console.error("❌ API too slow (Sync implementation?)");
    else console.log("✅ API returned immediately");

    console.log(`Run ID: ${run.id}, Initial Status: ${run.status}`);

    // 3. Poll for Completion
    console.log("\n[3] Polling for Worker Completion...");
    let attempts = 0;
    while (attempts < 10) {
        const [updatedRun] = await db.select().from(arDunningRuns).where(eq(arDunningRuns.id, run.id));
        if (updatedRun.status === "Completed") {
            console.log(`✅ Run Completed! Processed: ${updatedRun.totalInvoicesProcessed}, Letters: ${updatedRun.totalLettersGenerated}`);

            // Verify Task functionality
            const tasks = await arService.listCollectorTasks();
            const myTask = tasks.find(t => t.invoiceId === invoice.id);
            if (myTask) console.log("✅ Collections Task Created");
            else console.error("❌ Task missing");

            // Verify Invoice Status update
            const [finalInv] = await db.select().from(arInvoices).where(eq(arInvoices.id, invoice.id));
            if (finalInv.status === "Overdue") console.log("✅ Invoice Status updated to Overdue");
            else console.error(`❌ Invoice Status is ${finalInv.status} (Expected Overdue)`);

            process.exit(0);
        }
        if (updatedRun.status === "Failed") {
            console.error("❌ Run Failed");
            process.exit(1);
        }
        await new Promise(r => setTimeout(r, 500));
        attempts++;
        process.stdout.write(".");
    }
    console.error("\n❌ Timeout waiting for worker");
    process.exit(1);
}

verifyArPerformance().catch(console.error);
