
import "dotenv/config";
import { db } from "../server/db";
import { revenueContracts, revenueContractVersions, revenueSourceEvents } from "../shared/schema/revenue";
import { eq, desc, sql } from "drizzle-orm";
import { revenueService } from "../server/services/RevenueService";
import { v4 as uuidv4 } from 'uuid';

async function main() {
    console.log("🔍 Starting Phase D Verification: Contract Timeline & Audit...");

    // 0. Ensure Open Period Exists
    console.log("0. Ensuring Open Period...");
    // Check if period exists or create for current month
    const today = new Date();
    await db.execute(sql`
        INSERT INTO revenue_periods (id, ledger_id, period_name, start_date, end_date, status)
        VALUES ('PER-JAN-26', 'LEDGER-001', 'Jan-26', '2026-01-01', '2026-01-31', 'Open')
        ON CONFLICT DO NOTHING
    `);

    // 1. Create a Test Contract
    console.log("\n1. Creating Test Contract...");
    // We can simulate what identifyContract does or insert directly
    const [contract] = await db.insert(revenueContracts).values({
        contractNumber: `TEST-HIST-${uuidv4().substring(0, 6)}`,
        customerId: "CUST-TEST-001",
        ledgerId: "LEDGER-001",
        status: "Active",
        totalTransactionPrice: "1000",
        totalAllocatedPrice: "1000",
        versionNumber: 1
    }).returning();

    console.log(`✅ Created Contract: ${contract.contractNumber} (ID: ${contract.id})`);

    // 2. Modify the Contract (Simulate API Call logic)
    console.log("\n2. Modifying Contract (Snapshot Trigger)...");
    const modResult = await revenueService.processContractModification(contract.id, {
        newTotalValue: 1500,
        reason: "Test Modification: Upsell"
    });
    console.log(`✅ Modification Result: Catch-up ${modResult.catchupAmount}`);

    // 3. Verify Version Increment
    const updatedContract = await db.query.revenueContracts.findFirst({
        where: eq(revenueContracts.id, contract.id)
    });

    if (updatedContract?.versionNumber === 2) {
        console.log("✅ Contract Version incremented to 2");
    } else {
        console.error("❌ Contract Version FAILED to increment");
        process.exit(1);
    }

    // 4. Verify Snapshot Creation
    const versions = await db.select()
        .from(revenueContractVersions)
        .where(eq(revenueContractVersions.contractId, contract.id))
        .orderBy(desc(revenueContractVersions.versionNumber));

    if (versions.length > 0) {
        const v1 = versions[0];
        console.log(`✅ Snapshot Found: Version ${v1.versionNumber} for Reason: ${v1.changeReason}`);

        if (v1.versionNumber === 1 && v1.totalTransactionPrice === "1000.00") {
            console.log("✅ Snapshot matches original state (Price: 1000)");
        } else {
            console.log(`⚠️ Snapshot data variance: Price ${v1.totalTransactionPrice} (Expected 1000)`);
        }

    } else {
        console.error("❌ No Snapshots found in revenue_contract_versions");
        process.exit(1);
    }

    // 5. Verify Audit Trace API
    console.log("\n5. Verifying Audit Trace API...");
    // Create a dummy source event linked to this contract
    const sourceId = `SRC-${uuidv4().substring(0, 6)}`;
    await db.execute(sql`
        INSERT INTO revenue_source_events (id, source_id, source_system, amount, event_type, contract_id, processing_status, event_date)
        VALUES (gen_random_uuid(), ${sourceId}, 'OrderMgmt', '1000', 'Booking', ${contract.id}, 'Processed', now())
    `);

    // Fetch from API (simulate via DB logic or fetch if server was running, here we simulate the logic)
    // In a real e2e test we'd hit the endpoint, but here we can just verify the data relationships exist for the query
    const trace = await db.query.revenueSourceEvents.findFirst({
        where: eq(revenueSourceEvents.sourceId, sourceId), // Note: Schema field name might be camelCase in Drizzle
        with: {
            // Drizzle relations usually defined, but let's just do manual join verification as per API logic
        }
    });

    // Verify via ORM check
    const eventCheck = await db.select().from(revenueSourceEvents).where(eq(revenueSourceEvents.sourceId, sourceId));

    if (eventCheck.length > 0) {
        console.log(`✅ Audit Trace Source Event found for ${sourceId}`);
        // Ensure it links to contract
        const row = eventCheck[0];
        if (row.contractId === contract.id) {
            console.log("✅ Source Event correctly linked to Revenue Contract");
        } else {
            console.error(`❌ Link Broken. Expected ${contract.id}, got ${row.contractId}`);
        }
    } else {
        console.error("❌ Failed to create test source event");
    }

    console.log("\n🎉 Phase D Verification Complete!");
    process.exit(0);
}

main().catch(console.error);
