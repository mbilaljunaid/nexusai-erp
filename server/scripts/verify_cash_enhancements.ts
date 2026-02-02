
import { storage } from "../storage";
import { cashService } from "../services/cash";
import { InsertCashStatementLine, InsertCashTransaction } from "@shared/schema";

async function verifyCashEnhancements() {
    console.log("Starting Cash Management Enhancements Verification...");

    // 1. Setup: Create Bank Account
    const account = await cashService.createBankAccount({
        name: "Chase AI Check",
        accountNumber: "99887766",
        bankName: "Chase",
        currency: "USD",
        currentBalance: "5000"
    });
    const accountId = String(account.id);
    console.log(`Created Account: ${account.name} (ID: ${accountId})`);

    // 2. Test Fuzzy Matching
    console.log("\n--- Testing AI Fuzzy Matching ---");
    // Create Transaction: $100.00, Date: 2024-05-01, Desc: "Stripe Payout 123"
    await storage.createCashTransaction({
        bankAccountId: account.id,
        amount: "100",
        transactionDate: new Date("2024-05-01"),
        reference: "Stripe Payout 123",
        status: "Unreconciled",
        sourceModule: "AR",
        sourceId: 999
    });

    // Create Statement Line: $100.00, Date: 2024-05-03 (2 days diff), Desc: "STRIPE TRANSFER" (Fuzzy match)
    await storage.createCashStatementLine({
        bankAccountId: account.id,
        amount: "100",
        transactionDate: new Date("2024-05-03"),
        description: "STRIPE TRANSFER",
        reconciled: false
    });

    // Run Auto-Reconcile
    const matchResult = await cashService.autoReconcile(accountId);
    console.log("Reconciliation Result:", matchResult);

    // Check for proposed matches
    if ((matchResult as any).proposedMatches?.length > 0) {
        const match = (matchResult as any).proposedMatches[0];
        console.log(`SUCCESS: Found AI Match! Confidence: ${match.confidence}`);
        if (match.confidence >= 70) console.log("   -> Confidence is high (Expected > 70 for 2-day diff + substring match)");
    } else {
        console.error("FAILURE: AI Fuzzy Match failed to find the transaction.");
    }


    // 3. Test Create Transaction from Statement
    console.log("\n--- Testing Create Transaction from Statement ---");
    // Create Unmatched Line: Bank Fee $15
    const feeLine = await storage.createCashStatementLine({
        bankAccountId: account.id,
        amount: "-15",
        transactionDate: new Date("2024-05-05"),
        description: "MONTHLY SERVICE FEE",
        reconciled: false
    });

    console.log(`Created Unmatched Line: ${feeLine.description} (ID: ${feeLine.id})`);

    // Call Service to Create Transaction
    const createdTrx = await cashService.createTransactionFromUnmatched(
        accountId,
        String(feeLine.id),
        { type: "FEE", glAccountId: 60001, description: "Bank Fee May" }
    );

    console.log(`Created Transaction: ID ${createdTrx.id}, Amount ${createdTrx.amount}, Status: ${createdTrx.status}`);

    if (createdTrx.status === "Reconciled" && Number(createdTrx.amount) === -15) {
        console.log("SUCCESS: Transaction created and reconciled successfully.");
    } else {
        console.error("FAILURE: Transaction creation or status update failed.");
    }
}

verifyCashEnhancements().catch(console.error);
