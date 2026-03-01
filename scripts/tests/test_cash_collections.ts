import "dotenv/config";
import { db } from "../../server/db";
import { arService } from "../../server/services/ar";
import { arPromisesToPay, arReceipts, arRemittanceBatches, arInvoices, arReceiptApplications, arDisputes } from "../../shared/schema/ar";
import { eq, sql } from "drizzle-orm";

async function main() {
    console.log("==========================================");
    console.log("🚀 STARTING Cash & Collections (Phase 5) Verification");
    console.log("==========================================\n");

    try {
        console.log("📅 0. Ensuring Open GL Period...");
        const ledgerId = "PRIMARY";
        const today = new Date();
        const periodName = `${today.toLocaleString('en-US', { month: 'short' })}-${today.getFullYear()}`;
        const fiscalYear = today.getFullYear();

        const existingPeriod = await db.execute(sql`SELECT id FROM gl_periods WHERE ledger_id = ${ledgerId} AND period_name = ${periodName}`);
        if (existingPeriod.length > 0) {
            await db.execute(sql`UPDATE gl_periods SET status = 'Open' WHERE ledger_id = ${ledgerId} AND period_name = ${periodName}`);
        } else {
            await db.execute(sql`
                INSERT INTO gl_periods (id, ledger_id, period_name, status, start_date, end_date, fiscal_year)
                VALUES (gen_random_uuid(), ${ledgerId}, ${periodName}, 'Open', date_trunc('month', CURRENT_DATE), (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day'), ${fiscalYear})
            `);
        }
        // Ensure SLA period statuses are open for AR, AP, GL for tests
        await db.execute(sql`
            INSERT INTO sla_period_statuses (id, ledger_id, application_id, period_name, status)
            VALUES 
                (gen_random_uuid(), ${ledgerId}, 'AR', ${periodName}, 'Open'),
                (gen_random_uuid(), ${ledgerId}, 'AP', ${periodName}, 'Open'),
                (gen_random_uuid(), ${ledgerId}, 'GL', ${periodName}, 'Open')
            ON CONFLICT (ledger_id, application_id, period_name) 
            DO UPDATE SET status = 'Open'
        `);

        console.log(`✅ GL Period '${periodName}' is open.\n`);

        console.log("📦 1. Setting up Test Data...");
        const customer = await arService.createCustomer({
            partyType: "ORGANIZATION",
            name: "Phase 5 Collections Corp",
            accountNumber: `P5-${Date.now()}`,
            status: "Active"
        });

        const account = await arService.createAccount({
            customerId: customer.id,
            accountNumber: `ACC-P5-${Date.now()}`,
            accountName: "Main",
            creditLimit: "50000"
        });

        const site = await arService.createSite({
            accountId: account.id,
            siteName: "Billing",
            address: "123 Way",
            isBillTo: true
        });

        const invOptions = {
            customerId: customer.id,
            accountId: account.id,
            siteId: site.id,
            currency: "USD",
            status: "Sent",
            transactionClass: "INV",
            taxAmount: "0"
        };

        const inv1 = await arService.createInvoice({ ...invOptions, invoiceNumber: `INV-P5-1-${Date.now()}`, amount: "1000", totalAmount: "1000", dueDate: new Date() });
        const inv2 = await arService.createInvoice({ ...invOptions, invoiceNumber: `INV-P5-2-${Date.now()}`, amount: "500", totalAmount: "500", dueDate: new Date() });
        const inv3 = await arService.createInvoice({ ...invOptions, invoiceNumber: `INV-P5-3-${Date.now()}`, amount: "200", totalAmount: "200", dueDate: new Date() });

        console.log(`✅ Test Data created (Customer: ${customer.id})\n`);

        console.log("💸 2. Testing Receipt Application with Discounts...");
        const receipt1 = await arService.createReceipt({
            customerId: customer.id,
            accountId: account.id,
            amount: "980",
            status: "Unapplied",
            receiptDate: new Date(),
            currency: "USD"
        });

        // Apply $980 to $1000 invoice, taking $20 earned discount to fully clear it
        const app = await arService.applyReceipt(receipt1.id, inv1.id, 980, { earnedDiscountAmount: 20 });

        if (Number(app.amountApplied) !== 980 || Number(app.earnedDiscountAmount) !== 20) throw new Error(`Discount applied incorrectly: applied=${app.amountApplied}, earnedDiscount=${app.earnedDiscountAmount}`);

        const updatedInv1 = await arService.getInvoice(inv1.id);
        if (updatedInv1?.status !== "Paid") throw new Error(`Invoice status not Paid! Actual: ${updatedInv1?.status}`);
        console.log("✅ Passed Receipt Applications with Discounts\n");


        console.log("🏦 3. Testing Remittance Batches...");
        const batch = await arService.createRemittanceBatch({
            name: `REM-BATCH-${Date.now()}`,
            batchDate: new Date(),
            bankAccountId: "BANK-X",
            totalAmount: "980"
        }, [receipt1.id]);

        if (!batch.id) throw new Error("Batch creation failed");

        const clearBatch = await arService.clearRemittanceBatch(batch.id);
        if (clearBatch.status !== "Cleared") throw new Error("Batch clear failed");

        const checkRec = await db.select().from(arReceipts).where(eq(arReceipts.id, receipt1.id));
        if (checkRec[0].status !== "Cleared") throw new Error("Receipt status not updated to Cleared");
        console.log("✅ Passed Remittance Batches\n");


        console.log("🤝 4. Testing Promises to Pay (PTP)...");
        let pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1); // Yesterday

        const ptp1 = await arService.createPromiseToPay({
            customerId: customer.id,
            accountId: account.id,
            invoiceId: inv2.id,
            promisedAmount: "500",
            promisedDate: pastDate,
            status: "Open"
        });

        // Satisfy the PTP by applying a new receipt fully
        const receipt2 = await arService.createReceipt({
            customerId: customer.id,
            accountId: account.id,
            amount: "500",
            status: "Unapplied",
            receiptDate: new Date(),
            currency: "USD"
        });
        await arService.applyReceipt(receipt2.id, inv2.id, 500);

        const ev = await arService.evaluatePromisesToPay();
        if (ev.kept !== 1) throw new Error("Kept count mismatch. Missing evaluation for Paid invoice.");

        const ptps = await arService.listPromisesToPay(customer.id);
        const keptPtp = ptps.find(p => p.id === ptp1.id);
        if (keptPtp?.status !== "Kept") throw new Error("PTP status was not updated to Kept!");
        console.log("✅ Passed Promises to Pay\n");

        console.log("⚖️  5. Testing Dispute Management...");
        // 5a. Create a dispute (directly simulating DB entry since there's no creation service method yet outside standard inserts)
        const [dispute] = await db.insert(arDisputes).values({
            invoiceId: inv3.id,
            customerId: customer.id,
            disputeReason: "Incorrect Charge",
            disputedAmount: "50",
            status: "Open"
        }).returning();

        // 5b. Resolve it and generate Credit Memo
        const resolved = await arService.resolveDispute(dispute.id, "Approved", 50, "TEST_ADMIN");
        if (resolved.status !== "Resolved") throw new Error("Dispute not resolved");

        const inv3Updated = await arService.getInvoice(inv3.id);
        // The CM application creates an adjustment reducing the balance. The invoice originally had amount 200.
        // Adjustments are fetched to verify.
        const adjustments = await arService.listAdjustments(inv3.id);
        const cmAdj = adjustments.find(a => a.adjustmentType === "Credit Memo Application");
        if (!cmAdj || Number(cmAdj.amount) !== -50) throw new Error("Credit Memo not applied to Dispute target invoice correctly");

        console.log("✅ Passed Dispute Management\n");


        console.log("==========================================");
        console.log("🎉 ALL Cash & Collections Phase 5 Tests Passed!");
        console.log("==========================================");

    } catch (err: any) {
        console.error("\n❌ TEST FAILED:", err.message);
        console.error(err);
    } finally {
        process.exit(0);
    }
}

main();
