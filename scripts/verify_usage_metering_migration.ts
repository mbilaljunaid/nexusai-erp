/**
 * Verification Script: Usage Metering Schema Deployment
 * 
 * This script verifies that the usage_metering tables were successfully
 * deployed to the PostgreSQL database.
 */

import { db } from "../server/db";
import { usageMeters, usageEvents, usageThresholds } from "../shared/schema/usage_metering";
import { sql } from "drizzle-orm";

async function verifyUsageMeteringSchema() {
    console.log("🔍 Verifying Usage Metering Schema Deployment\n");
    console.log("=".repeat(60));

    try {
        // 1. Verify usage_meters table
        console.log("\n1️⃣ Checking usage_meters table...");
        const meterCount = await db.select({ count: sql<number>`count(*)` }).from(usageMeters);
        console.log(`   ✅ Table exists. Current rows: ${meterCount[0]?.count || 0}`);

        // 2. Verify usage_events table
        console.log("\n2️⃣ Checking usage_events table...");
        const eventCount = await db.select({ count: sql<number>`count(*)` }).from(usageEvents);
        console.log(`   ✅ Table exists. Current rows: ${eventCount[0]?.count || 0}`);

        // 3. Verify usage_thresholds table
        console.log("\n3️⃣ Checking usage_thresholds table...");
        const thresholdCount = await db.select({ count: sql<number>`count(*)` }).from(usageThresholds);
        console.log(`   ✅ Table exists. Current rows: ${thresholdCount[0]?.count || 0}`);

        // 4. Test insert and delete (smoke test)
        console.log("\n4️⃣ Running smoke test (insert/delete)...");
        const [testMeter] = await db.insert(usageMeters).values({
            name: "TEST_METER",
            meterType: "Counter",
            unit: "requests",
            pricingModel: "per_unit",
            unitPrice: "0.01",
            isActive: true,
        }).returning();
        console.log(`   ✅ Insert successful. Test meter ID: ${testMeter.id}`);

        await db.delete(usageMeters).where(sql`id = ${testMeter.id}`);
        console.log(`   ✅ Delete successful. Test meter removed.`);

        // 5. Summary
        console.log("\n" + "=".repeat(60));
        console.log("\n✅ **VERIFICATION SUCCESSFUL**\n");
        console.log("All usage_metering tables are deployed and operational:");
        console.log("  • usage_meters");
        console.log("  • usage_events");
        console.log("  • usage_thresholds");
        console.log("\nDatabase migration completed successfully! 🎉\n");

        process.exit(0);
    } catch (error: any) {
        console.error("\n" + "=".repeat(60));
        console.error("\n❌ **VERIFICATION FAILED**\n");
        console.error("Error:", error.message);
        console.error("\nStack trace:", error.stack);
        console.error("\nPlease check:");
        console.error("  1. Database connection is active");
        console.error("  2. Migration was applied successfully");
        console.error("  3. Schema export in shared/schema/index.ts is correct\n");
        process.exit(1);
    }
}

// Run verification
verifyUsageMeteringSchema();
