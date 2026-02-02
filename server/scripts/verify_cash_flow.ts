
import { storage } from "../storage";
import { cashService } from "../services/cash";
import { randomUUID } from "crypto";

async function verifyCashFlow() {
    console.log("Starting Cash Management Verification...");

    // 1. Create Bank Account
    console.log("\n1. Creating Bank Account...");
    const account = await cashService.createBankAccount({
        name: "Verification Checking",
        accountNumber: "VER-123456",
        bankName: "First Verification Bank",
        currency: "USD",
        currentBalance: "100000",
        glAccountId: 1010
    });
    console.log("Created Account:", account.name, account.id);

    // 2. Import Statement Lines (External)
    console.log("\n2. Importing Statement Lines...");
    const lines = [
        {
            bankAccountId: account.id,
            date: "2024-06-01",
            amount: 5000,
            description: "Customer Payment INV-100",
            referenceNumber: "REF-001"
        },
        {
            bankAccountId: account.id,
            date: "2024-06-02",
            amount: -1200,
            description: "Vendor Payment BILL-500",
            referenceNumber: "REF-002"
        },
        {
            bankAccountId: account.id,
            date: "2024-06-03",
            amount: -50,
            description: "Bank Fee",
            referenceNumber: "REF-003"
        }
    ];

    // Note: cashService.importBankStatement expects InsertCashStatementLine[] which has 'amount' as number (from schema) but 'date' needs to be correct type? 
    // Schema for insert is usually string for dates or date obj. Let's assume schema handles string.
    // Actually insertCashStatementLineSchema expects string or date? Let's check schema.
    // In `cash.ts`: `date: z.string()` (probably, based on pattern). 
    // Wait, I saw `transactionDate: timestamp("transaction_date")` in table.
    // Drizzle Zod schema usually expects Date or string that parses to Date.

    // Let's manually insert via storage to be safe or mock API call.
    // `cashService.importBankStatement` calls `storage.createCashStatementLine`.
    // `InsertCashStatementLine` expects `transactionDate`. `lines` above use `date`. I need to fix keys.

    const formattedLines = lines.map(l => ({
        bankAccountId: l.bankAccountId,
        transactionDate: new Date(l.date),
        amount: l.amount,
        description: l.description,
        referenceNumber: l.referenceNumber,
        reconciled: false
    }));

    const imported = await cashService.importBankStatement(String(account.id), formattedLines as any);
    console.log(`Imported ${imported.length} statement lines.`);

    // 3. Create System Transactions (Internal)
    console.log("\n3. Creating System Transactions...");
    // Create matching transactions for first two lines
    await storage.createCashTransaction({
        bankAccountId: account.id,
        transactionDate: new Date("2024-06-01"),
        amount: "5000",
        reference: "INV-100",
        status: "Unreconciled",
        sourceModule: "AR",
        sourceId: 1001
    });

    await storage.createCashTransaction({
        bankAccountId: account.id,
        transactionDate: new Date("2024-06-02"),
        amount: "-1200",
        reference: "BILL-500",
        status: "Unreconciled",
        sourceModule: "AP",
        sourceId: 2001
    });

    // Non-matching transaction
    await storage.createCashTransaction({
        bankAccountId: account.id,
        transactionDate: new Date("2024-06-05"),
        amount: "-500", // No match in statement
        reference: "BILL-501",
        status: "Unreconciled",
        sourceModule: "AP",
        sourceId: 2002
    });

    const transactions = await storage.listCashTransactions(String(account.id));
    console.log(`Created ${transactions.length} system transactions.`);

    // 4. Run Auto-Reconciliation
    console.log("\n4. Running Auto-Reconciliation...");
    const result = await cashService.autoReconcile(String(account.id));
    console.log("Reconciliation Result:", result);

    if (result.matched === 2) {
        console.log("\nSUCCESS: Verification Passed! Correctly matched 2 transactions.");
    } else {
        console.error(`\nFAILURE: Expected 2 matches, got ${result.matched}`);
        process.exit(1);
    }
}

verifyCashFlow().catch(console.error);
