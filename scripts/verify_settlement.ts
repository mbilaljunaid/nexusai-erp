import "dotenv/config";
import { db } from "../server/db";
import { icOrgs, icBatches, icHeaders, icLines, icTransactionTypes, icTransferPricingRules } from "@shared/schema/intercompany";
import { nettingService } from "../server/services/netting";
import { cashBankAccounts, cashTransactions } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import crypto from "crypto";

async function verifySettlementIntegration() {
    console.log("=== Verifying Intercompany Settlement Integration (Cash) ===");

    // 1. Setup Data: Orgs, Bank Accounts
    console.log("--> Setting up test data (Orgs, Bank Accounts)...");

    // Create/Find Ledgers
    const ledgerUSD = "001"; // Assumption

    // Create Orgs
    const orgProvider = "IC-PROV-TEST";
    const orgReceiver = "IC-RECV-TEST";

    // Ensure Orgs exist or mock them
    // For this verification, we assume valid IDs are needed. 
    // We'll check if they exist or insert dummy ones if allowable by schema.
    // Assuming simple insert for test.

    /* 
    // In a real verification, we'd insert these properly.
    // Due to FKs, we might need to rely on existing ones or complex setup.
    // Let's rely on finding existing and creating bank account for them.
    */

    // Let's create dummy bank accounts for existing Org's ledger
    // We need to know an Org ID.
    const orgs = await db.select().from(icOrgs).limit(2);
    if (orgs.length < 2) {
        console.error("Not enough IC Orgs found to test.");
        return;
    }

    const org1 = orgs[0];
    const org2 = orgs[1];

    console.log(`Using Org1: ${org1.id} (Ledger: ${org1.ledgerId})`);
    console.log(`Using Org2: ${org2.id} (Ledger: ${org2.ledgerId})`);

    // Create Bank Accounts for them
    const createBankAccount = async (ledgerId: string, name: string) => {
        const [acct] = await db.insert(cashBankAccounts).values({
            name: `${name} Bank`,
            accountNumber: `TEST-${nanoid(5)}`,
            bankName: "Test Bank",
            currency: "USD",
            ledgerId: ledgerId,
            status: "Active"
        } as any).returning();
        return acct;
    };

    const acct1 = await createBankAccount(org1.ledgerId, org1.id);
    const acct2 = await createBankAccount(org2.ledgerId, org2.id);

    console.log(`Created Acct1: ${acct1.id} for Ledger ${org1.ledgerId}`);
    console.log(`Created Acct2: ${acct2.id} for Ledger ${org2.ledgerId}`);

    // 2. Create IC Transactions (Unsettled)
    console.log("--> Creating Unsettled IC Transactions...");
    const batchId = crypto.randomUUID(); // Must be proper UUID

    await db.insert(icBatches).values({
        id: batchId,
        initiatorOrgId: org1.id,
        status: "COMPLETE", // Needs to be approved
        glDate: new Date().toISOString(),
        currencyCode: "USD"
    } as any);

    // Header: Org1 -> Org2 ($1000)
    await db.insert(icHeaders).values({
        batchId: batchId,
        providerOrgId: org1.id,
        receiverOrgId: org2.id,
        amount: "1000.00",
        currencyCode: "USD",
        status: "APPROVED",
        settlementStatus: "Unsettled"
    } as any);

    // Header: Org2 -> Org1 ($200)
    await db.insert(icHeaders).values({
        batchId: batchId,
        providerOrgId: org2.id,
        receiverOrgId: org1.id, // Org2 provides to Org1
        amount: "200.00",
        currencyCode: "USD",
        status: "APPROVED",
        settlementStatus: "Unsettled"
    } as any);

    // 3. Create Netting Batch
    console.log("--> Creating Netting Batch...");
    const nettingBatch = await nettingService.createIcNettingBatch(org1.id, org2.id, "USD");
    console.log(`Netting Batch Created: ${nettingBatch.id}. Net Amount: ${nettingBatch.netAmount}`);

    // Net Amount should be:
    // Org1 Receives: 1000 (Provider)
    // Org1 Pays: 200 (Receiver)
    // Net: Org2 Pays Org1 (1000-200 = 800)
    // Code logic: totalPay2to1 = 1000; totalPay1to2 = 200.
    // netAmount = 1000 - 200 = 800.
    // If > 0: Org2 pays Org1.

    if (Number(nettingBatch.netAmount) !== 800) {
        console.error(`Expected Net Amount 800, got ${nettingBatch.netAmount}`);
    }

    // 4. Settle Batch (Trigger Cash Integration)
    console.log("--> Settling Batch...");
    const result = await nettingService.settleIcNettingBatch(nettingBatch.id);
    console.log("Settlement Result:", result);

    // 5. Verify Cash Transactions
    console.log("--> Verifying Cash Transactions...");

    // Use returned accounts from settlement result
    const payerAcctId = (result as any).payerAccountId;
    const payeeAcctId = (result as any).payeeAccountId;

    if (!payerAcctId || !payeeAcctId) {
        console.error("❌ Payer or Payee Account ID missing in result", result);
        process.exit(1);
    }

    const txPayer = await db.select().from(cashTransactions)
        .where(and(eq(cashTransactions.bankAccountId, payerAcctId), eq(cashTransactions.sourceId, nettingBatch.id)));

    const txPayee = await db.select().from(cashTransactions)
        .where(and(eq(cashTransactions.bankAccountId, payeeAcctId), eq(cashTransactions.sourceId, nettingBatch.id)));

    if (txPayer.length > 0 && Math.abs(Number(txPayer[0].amount)) === 800) {
        console.log("✅ Payer Transaction Correct: -800 (or 800 outflow)");
    } else {
        console.error("❌ Payer Transaction Incorrect or Missing", txPayer);
    }

    if (txPayee.length > 0 && Number(txPayee[0].amount) === 800) {
        console.log("✅ Payee Transaction Correct: 800");
    } else {
        console.error("❌ Payee Transaction Incorrect or Missing", txPayee);
    }

    // Cleanup?
    console.log("Verification Complete.");
    process.exit(0);
}

verifySettlementIntegration().catch(console.error);
