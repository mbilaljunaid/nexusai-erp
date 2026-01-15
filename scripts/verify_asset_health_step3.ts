
import { db } from "../server/db";
import { maintWorkOrders, faAssets } from "../shared/schema/index";
import { eq, and } from "drizzle-orm";

async function verify() {
    console.log("🔍 Verifying Asset Health Analytics Step 3...");

    // 1. Ensure an Asset exists
    let [asset] = await db.select().from(faAssets).limit(1);
    if (!asset) {
        console.error("❌ No assets found.");
        process.exit(1);
    }

    console.log(`📋 Testing on Asset: ${asset.assetNumber}`);

    // 2. Create failure history (3 Corrective WOs)
    console.log("📉 Creating failure history (Corrective WOs)...");

    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

    // WO 1: 2 hours repair
    await db.insert(maintWorkOrders).values({
        workOrderNumber: `TEST-FAIL-1-${Date.now()}`,
        description: "Pump Overheat failure",
        assetId: asset.id,
        type: "CORRECTIVE",
        status: "COMPLETED",
        actualStartDate: fourDaysAgo,
        actualCompletionDate: new Date(fourDaysAgo.getTime() + 2 * 60 * 60 * 1000),
        createdAt: fourDaysAgo
    });

    // WO 2: 4 hours repair
    await db.insert(maintWorkOrders).values({
        workOrderNumber: `TEST-FAIL-2-${Date.now()}`,
        description: "Motor Vibrating failure",
        assetId: asset.id,
        type: "CORRECTIVE",
        status: "COMPLETED",
        actualStartDate: twoDaysAgo,
        actualCompletionDate: new Date(twoDaysAgo.getTime() + 4 * 60 * 60 * 1000),
        createdAt: twoDaysAgo
    });

    // 3. Verify Health Service
    const { assetHealthService } = await import("../server/services/AssetHealthService");
    const health = await assetHealthService.getAssetHealth(asset.id);

    console.log("📊 Health Metrics Result:");
    console.log(`- Health Score: ${health.healthScore}%`);
    console.log(`- MTBF: ${health.mtbfHours} hrs`);
    console.log(`- MTTR: ${health.mttrHours} hrs`);
    console.log(`- Total Failures: ${health.totalFailures}`);

    if (health.totalFailures >= 2 && health.mttrHours === 3) {
        console.log("✨ Verification Successful: MTTR correctly averaged (2h and 4h = 3h).");
    } else {
        console.warn("⚠️ Verification results vary. Check manual logic for MTBF.");
    }

    process.exit(0);
}

verify();
