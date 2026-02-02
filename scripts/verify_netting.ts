
import { db } from "../server/db";
import { icOrgs, icBatches, icHeaders, icLines, icTransactionTypes } from "../shared/schema/intercompany";
import { icNettingBatches } from "../shared/schema/netting"; // Corrected
import { nettingService } from "../server/services/netting";
import { nanoid } from "nanoid";
import { eq, sql } from "drizzle-orm";

async function verifyNetting() {
    console.log("🚀 Starting Intercompany Netting Verification...");

    const currency = "USD";
    const org1Id = "NET-ORG-A-" + nanoid(4);
    const org2Id = "NET-ORG-B-" + nanoid(4);

    // 1. Seed Orgs
    console.log(`Step 1: Seeding Orgs ${org1Id} and ${org2Id}`);
    await db.insert(icOrgs).values([
        { id: org1Id, orgName: "Netting Entity A", ledgerId: "led-1", currencyCode: currency, legalEntityId: nanoid(), companySegment: "101" },
        { id: org2Id, orgName: "Netting Entity B", ledgerId: "led-1", currencyCode: currency, legalEntityId: nanoid(), companySegment: "102" }
    ] as any);

    // Schema Drift Fix (Ensure column exists)
    try {
        await db.execute(sql`ALTER TABLE ic_transaction_types ADD COLUMN IF NOT EXISTS default_markup numeric(5,2) DEFAULT 0`);
        await db.execute(sql`ALTER TABLE ic_headers ADD COLUMN IF NOT EXISTS settlement_status text DEFAULT 'Unsettled'`);
    } catch (e) {
        console.log("Schema fix warning:", e);
    }

    // Seed Transaction Type
    await db.insert(icTransactionTypes).values({
        id: "SharedServices", typeName: "Shared Services", requiresApproval: true
    } as any).onConflictDoNothing();

    // 2. Create Transactions (Unsettled)
    const batchId1 = crypto.randomUUID();
    const batchId2 = crypto.randomUUID();

    // Insert Parent Batches to satisfy FK
    await db.insert(icBatches).values([
        { id: batchId1, status: "APPROVED", glDate: new Date().toISOString(), currencyCode: currency },
        { id: batchId2, status: "APPROVED", glDate: new Date().toISOString(), currencyCode: currency }
    ] as any);

    console.log("Step 2: Creating Seed Transactions...");

    // Header 1: Provider A, Receiver B. Amount 1000.
    const [h1] = await db.insert(icHeaders).values({
        batchId: batchId1,
        transactionTypeId: "SharedServices", // Ensure this exists or is not FK (It is FK! Need to seed Transaction Type too?)
        // transactionTypeId is FK to icTransactionTypes.id (text). "SharedServices" might not exist.
        // Let's seed Transaction Type too just in case.
        providerOrgId: org1Id,
        receiverOrgId: org2Id,
        amount: "1000",
        currencyCode: currency,
        status: "APPROVED"
    } as any).returning();
    console.log(`   - Created Header 1 (A->B): ${h1.id}, Amount: 1000`);

    // Header 2: Provider B, Receiver A. Amount 300.
    // Provider B charges Receiver A. So A pays B 300.
    const [h2] = await db.insert(icHeaders).values({
        batchId: batchId2,
        transactionTypeId: "SharedServices",
        providerOrgId: org2Id,
        receiverOrgId: org1Id,
        amount: "300",
        currencyCode: currency,
        status: "APPROVED"
    } as any).returning();
    console.log(`   - Created Header 2 (B->A): ${h2.id}, Amount: 300 (Receivable for B, Payable for A)`);

    // Expected Net:
    // A Receives 1000 from B.
    // A Pays 300 to B.
    // Net: A Receives 700 from B. (Or B Pays A 700).

    // 3. Create Netting Batch
    console.log("Step 3: Creating Netting Batch...");
    const batch = await nettingService.createIcNettingBatch(org1Id, org2Id, currency);

    console.log("   - Batch Created:", batch.id);
    console.log("   - Total Payables (A owes B):", batch.totalPayables); // Should be 300
    console.log("   - Total Receivables (B owes A):", batch.totalReceivables); // Should be 1000
    console.log("   - Net Amount:", batch.netAmount); // Should be 700 (Positive means B pays A)

    if (Number(batch.totalPayables) !== 300) throw new Error("Incorrect Total Payables");
    if (Number(batch.totalReceivables) !== 1000) throw new Error("Incorrect Total Receivables");
    if (Number(batch.netAmount) !== 700) throw new Error("Incorrect Net Amount");

    // 4. Settle Batch
    console.log("Step 4: Settling Batch...");
    await nettingService.settleIcNettingBatch(batch.id);

    // 5. Verify Status Updates
    console.log("Step 5: Verifying Status Updates...");
    const updatedBatch = await db.select().from(icNettingBatches).where(eq(icNettingBatches.id, batch.id));
    if (updatedBatch[0].status !== "Settled") throw new Error("Batch Status not updated");
    console.log("   - Batch Status: Settled");

    const updatedH1 = await db.select().from(icHeaders).where(eq(icHeaders.id, h1.id));
    if (updatedH1[0].settlementStatus !== "Settled") throw new Error("Header 1 Status not updated");

    const updatedH2 = await db.select().from(icHeaders).where(eq(icHeaders.id, h2.id));
    if (updatedH2[0].settlementStatus !== "Settled") throw new Error("Header 2 Status not updated");

    console.log("✅ Verification Successful: Netting Logic Correct.");
    process.exit(0);
}

verifyNetting().catch(e => {
    console.error(e);
    process.exit(1);
});
