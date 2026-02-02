import { arService } from "../server/services/ar";
import { storage } from "../server/storage";
import { db } from "../server/db";
import { slaJournalHeaders, slaJournalLines } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { slaEventClasses } from "@shared/schema";

async function verifyArSla() {
    console.log("🚀 Starting AR SLA Verification...");

    try {
        // 0. Ensure Event Classes exist
        await db.insert(slaEventClasses).values([
            { id: "AR_INVOICE_CREATED", name: "AR Invoice Created", description: "Triggered when a sales invoice is created", subledger: "AR", applicationId: "AR" },
            { id: "AR_RECEIPT_APPLIED", name: "AR Receipt Applied", description: "Triggered when a customer payment is applied", subledger: "AR", applicationId: "AR" }
        ]).onConflictDoNothing();
        console.log("✅ AR SLA Event Classes ensured");
        // 1. Create a fresh customer structure
        const customer = await arService.createCustomer({
            name: "SLA Test Corp",
            customerType: "Commercial"
        });

        const account = await arService.createAccount({
            customerId: customer.id,
            accountName: "SLA Test Account",
            accountNumber: "ACC-SLA-" + Date.now(),
            ledgerId: "PRIMARY"
        });

        const site = await arService.createSite({
            accountId: account.id,
            siteName: "SLA Bill-To",
            address: "123 SLA St",
            isBillTo: true
        });

        // 2. Create Invoice
        console.log("📝 Creating Invoice...");
        const invoice = await arService.createInvoice({
            customerId: customer.id,
            accountId: account.id,
            siteId: site.id,
            invoiceNumber: "INV-SLA-" + Date.now(),
            amount: "1000.00",
            taxAmount: "50.00",
            totalAmount: "1050.00",
            currency: "USD",
            dueDate: new Date(),
            status: "Sent"
        });

        // 3. Verify Invoice Accounting
        const invJournals = await db.select().from(slaJournalHeaders).where(and(
            eq(slaJournalHeaders.entityId, invoice.id),
            eq(slaJournalHeaders.entityTable, "ar_invoices")
        ));

        if (invJournals.length === 0) throw new Error("❌ Invoice SLA Journal not found");
        console.log(`✅ Invoice SLA Journal created: ${invJournals[0].id}`);

        const invLines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, invJournals[0].id));
        const drTotal = invLines.reduce((sum, l) => sum + Number(l.enteredDr || 0), 0);
        const crTotal = invLines.reduce((sum, l) => sum + Number(l.enteredCr || 0), 0);

        if (drTotal !== 1050 || crTotal !== 1050) {
            throw new Error(`❌ Invoice SLA Lines imbalanced or incorrect. DR: ${drTotal}, CR: ${crTotal}`);
        }
        console.log("✅ Invoice SLA Lines verified (Debit: Receivable, Credit: Revenue)");

        // 4. Create Receipt
        console.log("💰 Creating Receipt...");
        const receipt = await arService.createReceipt({
            customerId: customer.id,
            accountId: account.id,
            invoiceId: invoice.id,
            amount: "1050.00",
            receiptDate: new Date(),
            paymentMethod: "CHECK"
        });

        // 5. Verify Receipt Accounting
        const rcptJournals = await db.select().from(slaJournalHeaders).where(and(
            eq(slaJournalHeaders.entityId, receipt.id),
            eq(slaJournalHeaders.entityTable, "ar_receipts")
        ));

        if (rcptJournals.length === 0) throw new Error("❌ Receipt SLA Journal not found");
        console.log(`✅ Receipt SLA Journal created: ${rcptJournals[0].id}`);

        const rcptLines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, rcptJournals[0].id));
        const rDrTotal = rcptLines.reduce((sum, l) => sum + Number(l.enteredDr || 0), 0);
        const rCrTotal = rcptLines.reduce((sum, l) => sum + Number(l.enteredCr || 0), 0);

        if (rDrTotal !== 1050 || rCrTotal !== 1050) {
            throw new Error(`❌ Receipt SLA Lines imbalanced or incorrect. DR: ${rDrTotal}, CR: ${rCrTotal}`);
        }
        console.log("✅ Receipt SLA Lines verified (Debit: Cash, Credit: Receivable)");

        console.log("✨ AR SLA Integration Verification PASSED!");
    } catch (e: any) {
        console.error("❌ Verification FAILED:", e.message);
        process.exit(1);
    }
}

verifyArSla();
