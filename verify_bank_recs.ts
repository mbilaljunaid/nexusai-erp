
import { cashService } from "./server/services/cash";
import { financeService } from "./server/services/finance";
import { storage } from "./server/storage";
import { db } from "./server/db";
import { cashBankAccounts, cashStatementLines, cashTransactions, cashReconciliationRules } from "@shared/schema";

async function verifyBankRecs() {
    console.log("==================================================");
    console.log("🏦 NEXUS AI - BANK RECONCILIATION VERIFICATION");
    console.log("==================================================\n");

    try {
        // 1. Setup Master Data
        console.log("Step 1: Setting up Ledger and Bank Account...");
        const suffix = Date.now().toString().slice(-4);
        const ledger = await storage.createGlLedger({
            name: `Rec Test Ledger ${suffix}`,
            currency: "USD",
            coaStructureId: "PRIMARY",
            enabled: true
        });

        const bankAccount = await cashService.createBankAccount({
            name: "Test Ops Account",
            accountNumber: "9988776655",
            bankName: "Nexus Bank",
            currency: "USD",
            ledgerId: ledger.id,
            active: true
        });
        console.log(`✅ Bank Account Created: ${bankAccount.id}\n`);

        // 2. Setup Reconciliation Rules
        console.log("Step 2: Configuring Reconciliation Rules...");
        const rule1 = await cashService.createReconciliationRule({
            ledgerId: ledger.id,
            ruleName: "Exact Ref Match",
            priority: 1,
            matchingCriteria: { dateToleranceDays: 5, requireRefMatch: true },
            enabled: true
        });
        console.log("✅ Rule 1 Created: Exact Ref Match\n");

        // 3. Seed Internal Transactions (AP/AR/GL)
        console.log("Step 3: Seeding Internal Transactions...");
        const trx1 = await cashService.createTransaction({
            bankAccountId: bankAccount.id,
            amount: "1500.00",
            date: new Date(),
            reference: "VEN-POST-101",
            sourceModule: "AP"
        });
        const trx2 = await cashService.createTransaction({
            bankAccountId: bankAccount.id,
            amount: "2500.50",
            date: new Date(),
            reference: "CUS-PAY-202",
            sourceModule: "AR"
        });
        console.log("✅ 2 Internal Transactions Created.\n");

        // 4. Import Bank Statement
        console.log("Step 4: Importing Bank Statement...");
        const stmtLine1 = await storage.createCashStatementLine({
            bankAccountId: bankAccount.id,
            transactionDate: new Date(),
            amount: "1500.00",
            description: "Bank Transfer VEN-POST-101",
            referenceNumber: "VEN-POST-101"
        });
        const stmtLine2 = await storage.createCashStatementLine({
            bankAccountId: bankAccount.id,
            transactionDate: new Date(),
            amount: "2500.50",
            description: "Check Deposit CUS-PAY-202",
            referenceNumber: "CUS-PAY-202"
        });
        const stmtLine3 = await storage.createCashStatementLine({
            bankAccountId: bankAccount.id,
            transactionDate: new Date(),
            amount: "12.00",
            description: "Monthly Service Fee",
            referenceNumber: "FEE-JAN-2026"
        });
        console.log("✅ 3 Bank Statement Lines Imported.\n");

        // 5. Run Auto-Reconciliation
        console.log("Step 5: Executing Auto-Reconciliation Engine...");
        const result = await cashService.autoReconcile(bankAccount.id);
        console.log(`📊 Result: ${result.matched}/${result.processed} matched.`);
        console.log(`Matching Group ID: ${result.matchingGroupId}\n`);

        if (result.matched !== 2) {
            throw new Error(`Expected 2 matches, but got ${result.matched}. Engine failed to apply rules correctly.`);
        }
        console.log("✅ Auto-Matching accuracy verified.\n");

        // 6. Manual Posting of "Bank Only" Line (e.g. Service Fee)
        console.log("Step 6: Processing Bank-Only Lines (Fees)...");
        const feeLine = stmtLine3;
        const feeTrx = await cashService.createTransactionFromUnmatched(bankAccount.id, feeLine.id, {
            type: "FEE",
            glAccountId: 5000, // Expense account
            description: "Bank Service Charge"
        });
        console.log(`✅ Fee Transaction Created and Reconciled: ${feeTrx.id}\n`);

        console.log("==================================================");
        console.log("✨ CHUNK 11 VERIFICATION SUCCESSFUL ✨");
        console.log("==================================================");

    } catch (error) {
        console.error("\n❌ VERIFICATION FAILED:");
        console.error(error);
        process.exit(1);
    }
}

verifyBankRecs();
