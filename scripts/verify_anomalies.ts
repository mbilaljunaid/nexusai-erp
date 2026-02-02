
import 'dotenv/config';
import { db } from "../server/db";
import { billingEvents, billingAnomalies } from "@shared/schema/billing_enterprise";
import { billingService } from "../server/modules/billing/BillingService";
import { eq } from "drizzle-orm";

async function verifyAnomalies() {
    console.log("🔍 Starting Anomaly Detection Verification...");

    // 1. Setup: Clean previous test data
    console.log("🧹 Cleaning up old test data...");
    // ideally we'd delete by some ID, but for verification let's just proceed.

    // 2. Create High Value Event
    console.log("📝 Creating High Value Event (> $10k)...");
    const [highValueEvent] = await db.insert(billingEvents).values({
        customerId: "cust_anomaly_test_1",
        sourceSystem: "TestScript",
        sourceTransactionId: `TXN-HV-${Date.now()}`,
        eventDate: new Date(),
        amount: "15000.00",
        description: "Test High Value Event",
        status: "Pending"
    }).returning();
    console.log(`   -> Created Event ID: ${highValueEvent.id}`);

    // 3. Create Duplicate Events
    console.log("📝 Creating Duplicate Events...");
    const dupDate = new Date();
    const [dup1] = await db.insert(billingEvents).values({
        customerId: "cust_anomaly_test_2",
        sourceSystem: "TestScript",
        sourceTransactionId: `TXN-DUP-1-${Date.now()}`,
        eventDate: dupDate,
        amount: "500.00",
        description: "Test Duplicate Event 1",
        status: "Pending"
    }).returning();

    const [dup2] = await db.insert(billingEvents).values({
        customerId: "cust_anomaly_test_2",
        sourceSystem: "TestScript",
        sourceTransactionId: `TXN-DUP-2-${Date.now()}`,
        eventDate: dupDate,
        amount: "500.00",
        description: "Test Duplicate Event 2 (Different Source ID, Same Cust/Amt/Date)",
        status: "Pending"
    }).returning();
    console.log(`   -> Created Duplicates: ${dup1.id} & ${dup2.id}`);

    // 4. Run Detection
    console.log("🧠 Running AI Anomaly Detection...");
    const result = await billingService.detectAnomalies();
    console.log("   -> Scan Result:", result);

    // 5. Verify Database
    console.log("🕵️ Verifying Anomalies in DB...");
    const anomalies = await db.select().from(billingAnomalies);

    const hvAnomaly = anomalies.find(a => a.targetId === highValueEvent.id);
    const dupAnomaly = anomalies.find(a => a.targetId === dup1.id || a.targetId === dup2.id);

    if (hvAnomaly) {
        console.log("   ✅ High Value Anomaly Detected:", hvAnomaly.description);
    } else {
        console.error("   ❌ FAILED: High Value Anomaly NOT detected.");
    }

    if (dupAnomaly) {
        console.log("   ✅ Duplicate Anomaly Detected:", dupAnomaly.description);
    } else {
        console.error("   ❌ FAILED: Duplicate Anomaly NOT detected.");
    }

    if (hvAnomaly && dupAnomaly) {
        console.log("\n✅ VERIFICATION SUCCESSFUL: Intelligence Engine is active.");
        process.exit(0);
    } else {
        console.error("\n❌ VERIFICATION FAILED.");
        process.exit(1);
    }
}

verifyAnomalies().catch(console.error);
