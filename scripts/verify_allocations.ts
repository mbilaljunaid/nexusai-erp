
import { db } from "../db";
import { allocationService } from "../server/services/allocations";
import { intercompanyService } from "../server/modules/intercompany/intercompany.service";
import { icOrgs, icBatches, icHeaders, icLines } from "../shared/schema/intercompany";
import { eq } from "drizzle-orm";

// Mock Data
const SOURCE_ORG = "ALL-SRC-" + Date.now();
const TARGET_ORG_1 = "ALL-TGT1-" + Date.now();
const TARGET_ORG_2 = "ALL-TGT2-" + Date.now();

async function main() {
    console.log("🔍 Starting Allocations Verification...");

    // 1. Setup Orgs
    console.log("1. Creating Test Orgs...");
    await db.insert(icOrgs).values([
        { id: SOURCE_ORG, orgName: "Allocation Source", legalEntityId: "LE-1", ledgerId: "US-GAAP", companySegment: "900" },
        { id: TARGET_ORG_1, orgName: "Target 1", legalEntityId: "LE-2", ledgerId: "UK-IFRS", companySegment: "901" },
        { id: TARGET_ORG_2, orgName: "Target 2", legalEntityId: "LE-3", ledgerId: "EU-GAAP", companySegment: "902" }
    ]).onConflictDoNothing();

    // 2. Create Allocation Rule
    console.log("2. Creating Allocation Rule (50/50 Split)...");
    const rule = await allocationService.createRule({
        name: "Test Allocation " + Date.now(),
        sourceOrgId: SOURCE_ORG,
        allocationMethod: "PERCENTAGE",
        lines: [
            { targetOrgId: TARGET_ORG_1, percentage: "50.00" },
            { targetOrgId: TARGET_ORG_2, percentage: "50.00" }
        ]
    });
    console.log(`✅ Rule Created: ${rule.id}`);

    // 3. Run Allocation
    console.log("3. Running Allocation Batch ($1000)...");
    const batch = await allocationService.runAllocation(rule.id, 1000, "USD", "test-user");
    console.log(`✅ Batch Generated: ${batch.id}`);

    // 4. Validate Batch
    const headers = await db.select().from(icHeaders).where(eq(icHeaders.batchId, batch.id));
    console.log(`Found ${headers.length} Transactions (Should be 2)`);

    if (headers.length !== 2) throw new Error("Incorrect number of transactions generated");

    const t1 = headers.find(h => h.receiverOrgId === TARGET_ORG_1);
    const t2 = headers.find(h => h.receiverOrgId === TARGET_ORG_2);

    if (Number(t1?.amount) !== 500) throw new Error(`Target 1 Amount Incorrect: ${t1?.amount}`);
    if (Number(t2?.amount) !== 500) throw new Error(`Target 2 Amount Incorrect: ${t2?.amount}`);

    console.log("✅ Amounts Verified ($500 / $500)");

    console.log("🎉 Allocations Functionality Verified!");
    process.exit(0);
}

main().catch(err => {
    console.error("❌ Verification Failed:", err);
    process.exit(1);
});
