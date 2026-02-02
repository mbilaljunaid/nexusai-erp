
import { db } from "../server/db";
import { cashBankAccounts, cashTransactions, cashStatementLines, cashReconciliationRules } from "@shared/schema";
import { cashService } from "../server/services/cash";
import { eq } from "drizzle-orm";

async function verifySmartMatch() {
    console.log("🛠️ Starting Smart Match Verification...");

    const testId = Date.now().toString();
    const accountId = "test-smartmatch-" + testId;

    // 1. Setup Data
    await db.insert(cashBankAccounts).values({
        id: accountId,
        name: "Smart Match Test " + testId,
        bankName: "AI Bank",
        accountNumber: "SM-001",
        currency: "USD",
        currentBalance: "1000",
        active: true,
        ledgerId: "PRIMARY" // Important for rule lookup
    });

    // Transaction $100.00
    const [txn] = await db.insert(cashTransactions).values({
        bankAccountId: accountId,
        amount: "100.00",
        sourceModule: "GL",
        sourceId: "MANUAL",
        status: "Unreconciled",
        reference: "INV-100"
    }).returning();

    // Statement Line $99.95 (Difference 0.05)
    const [line] = await db.insert(cashStatementLines).values({
        bankAccountId: accountId,
        amount: "99.95",
        transactionDate: new Date(),
        referenceNumber: "INV-100",
        description: "Payment",
        reconciled: false
    }).returning();

    // 2. Create Rule with Tolerance 0.10
    await db.insert(cashReconciliationRules).values({
        ledgerId: "PRIMARY",
        ruleName: "Small Diff Rule " + testId,
        priority: 1,
        matchingCriteria: {
            amountTolerance: 0.10,
            requireRefMatch: true
        },
        enabled: true
    });

    // 3. Run Auto Reconcile
    console.log("🔄 Running Auto Reconcile...");
    const result = await cashService.autoReconcile(accountId, "test-runner");

    console.log("📊 Result:", result);

    if (result.matched === 1) {
        console.log("✅ SUCCESS: Matched with tolerance.");
    } else {
        console.error("❌ Failed: Did not match.");
        process.exit(1);
    }

    process.exit(0);
}

verifySmartMatch().catch(console.error);
