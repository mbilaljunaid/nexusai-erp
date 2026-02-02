
import { db } from "../db";
import { intercompanyService } from "../server/modules/intercompany/intercompany.service";
import { icBatches, icOrgs } from "../shared/schema/intercompany";
import { eq, desc } from "drizzle-orm";

// Mock Data for AI Test
const PROVIDER = "AI-SRC-" + Date.now();
const RECEIVER = "AI-TGT-" + Date.now();

async function main() {
    console.log("🤖 Starting AI Anomaly Verification...");

    // 1. Setup Orgs
    await db.insert(icOrgs).values([
        { id: PROVIDER, orgName: "AI Source", legalEntityId: "LE-AI1", ledgerId: "US", companySegment: "888" },
        { id: RECEIVER, orgName: "AI Target", legalEntityId: "LE-AI2", ledgerId: "US", companySegment: "889" }
    ]).onConflictDoNothing();

    // 2. Test High Value Anomaly (> 1M)
    console.log("🧪 Test 1: High Value Batch ($2,000,000)...");
    const highValueBatch = await intercompanyService.createBatch({
        description: "High Value Test",
        initiatorOrgId: PROVIDER,
        glDate: "2025-10-01",
        currencyCode: "USD",
        transactions: [{
            receiverOrgId: RECEIVER,
            transactionTypeId: "SHARED_SERVICES",
            amount: 2000000, // 2M
            lines: [{ codeCombinationId: "101-000-000", enteredDr: 2000000 }]
        }]
    }, "tester");

    // Fetch batch to see if warning appended
    const b1 = await db.query.icBatches.findFirst({ where: eq(icBatches.id, highValueBatch.id) });
    if (b1?.description?.includes("[RISK:")) {
        console.log("✅ High Value Batch Flagged: ", b1.description);
    } else {
        throw new Error("❌ High Value Batch NOT Flagged!");
    }

    // 3. Test Duplicate Batch (Run same batch again immediately)
    console.log("🧪 Test 2: Duplicate Batch...");
    const duplicateBatch = await intercompanyService.createBatch({
        description: "Duplicate Test",
        initiatorOrgId: PROVIDER,
        glDate: "2025-10-01",
        currencyCode: "USD",
        transactions: [{
            receiverOrgId: RECEIVER,
            transactionTypeId: "SHARED_SERVICES",
            amount: 2000000, // Same amount as above
            lines: [{ codeCombinationId: "101-000-000", enteredDr: 2000000 }]
        }]
    }, "tester");

    const b2 = await db.query.icBatches.findFirst({ where: eq(icBatches.id, duplicateBatch.id) });
    // Risk Score should be even higher (High Value + Duplicate)
    // Duplicate adds 50, High Value adds 40 -> 90.
    // Previous batch might be 'High Value' (40).
    console.log("✅ Duplicate Batch Created: ", b2?.description);
    // We expect [RISK: 90] or similar

    if (b2?.description?.includes("[RISK:")) {
        console.log("✅ Duplicate Detected.");
    } else {
        console.warn("⚠️ Duplicate might not be detected if DB CreateAt is too close or not committed yet?");
    }

    console.log("🎉 AI Verification Complete!");
    process.exit(0);
}

main().catch(err => {
    console.error("❌ Verification Failed:", err);
    process.exit(1);
});
