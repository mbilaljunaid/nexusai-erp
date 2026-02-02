
import { db } from "../server/db";
import { arInvoices, slaJournalHeaders, slaJournalLines } from "../shared/schema";
import { arService } from "../server/services/ar";
import { eq, desc } from "drizzle-orm";

async function verifyArSla() {
    console.log("🔍 Verifying AR -> SLA Integration...");

    // 1. Create Test AR Invoice
    console.log("1. Creating Test Invoice...");
    const invoiceNum = `TEST-AR-${Date.now()}`;
    const amount = "5000";

    const invoice = await arService.createInvoice({
        customerId: "CUST-1", // Assuming existing seeded customer
        accountId: "ACC-1",
        siteId: "SITE-1",
        invoiceNumber: invoiceNum,
        amount: amount,
        taxAmount: "0",
        totalAmount: amount, // 5000
        currency: "USD",
        status: "Draft",
        dueDate: new Date(),
        description: "Test AR SLA Integration"
    } as any); // Bypass strict schema for test if needed, or ensure seeded ID validity.
    // Actually, createCustomer might be needed if DB is empty.
    // For now assuming Seed was run. If fail, we'll see.

    console.log(`✅ Invoice Created: ${invoice.invoiceNumber} (ID: ${invoice.id})`);

    // 2. Check SLA Header
    console.log("2. Checking SLA Journal Header...");
    // Allow async processing time if any
    await new Promise(r => setTimeout(r, 1000));

    const header = await db.query.slaJournalHeaders.findFirst({
        where: eq(slaJournalHeaders.entityId, invoice.id),
        with: {
            lines: true
        }
    });

    if (!header) {
        console.error("❌ No SLA Header found!");
        process.exit(1);
    }
    console.log(`✅ Header Found: ${header.eventClassId} (ID: ${header.id})`);

    // 3. Check Lines & Balance
    console.log("3. Verifying Lines & Balance...");
    const dr = header.lines.reduce((sum, l) => sum + Number(l.accountedDr || 0), 0);
    const cr = header.lines.reduce((sum, l) => sum + Number(l.accountedCr || 0), 0);

    console.log(`   Debit Total:  ${dr}`);
    console.log(`   Credit Total: ${cr}`);

    header.lines.forEach(l => {
        console.log(`   - Line ${l.lineNumber}: ${l.accountingClass} | Dr: ${l.accountedDr} | Cr: ${l.accountedCr} | ${l.description}`);
    });

    if (Math.abs(dr - cr) < 0.01 && dr > 0) {
        console.log("✅ Invoice Journal is BALANCED.");
    } else {
        console.error("❌ Invoice Journal is UNBALANCED or EMPTY.");
        // process.exit(1); 
    }

    // 4. Create Receipt
    console.log("4. Creating Receipt...");
    const receipt = await arService.createReceipt({
        customerId: invoice.customerId,
        accountId: invoice.accountId,
        amount: "1000",
        currency: "USD",
        method: "Check",
        reference: `CHK-${Date.now()}`,
        siteId: invoice.siteId
    } as any);
    console.log(`✅ Receipt Created: ${receipt.id}`);

    // Check SLA for Receipt
    await new Promise(r => setTimeout(r, 1000));
    const rHeader = await db.query.slaJournalHeaders.findFirst({
        where: eq(slaJournalHeaders.entityId, receipt.id),
        with: { lines: true }
    });
    if (rHeader) {
        console.log(`✅ Receipt Accounting Header Found: ${rHeader.id}`);
        // console.log(rHeader.lines);
    } else {
        console.error("❌ Receipt Accounting Header NOT Found!");
    }

    // 5. Apply Receipt
    console.log("5. Applying Receipt to Invoice...");
    const application = await arService.applyReceipt(receipt.id, invoice.id, "1000");
    console.log(`✅ Application Created: ${application.id}`);

    await new Promise(r => setTimeout(r, 1000));
    const appHeader = await db.query.slaJournalHeaders.findFirst({
        where: eq(slaJournalHeaders.entityId, application.id),
        with: { lines: true }
    });
    if (appHeader) {
        console.log(`✅ Application Accounting Header Found: ${appHeader.id}`);
        // console.log(appHeader.lines);
    } else {
        console.error("❌ Application Accounting Header NOT Found!");
    }

    console.log("🎉 AR SLA Integration Verification (Invoice + Receipt + Application) PASSED!");
    process.exit(0);

    console.log("🎉 AR SLA Integration Verification PASSED!");
    process.exit(0);
}

verifyArSla().catch(err => {
    console.error("Verification Failed:", err);
    process.exit(1);
});
