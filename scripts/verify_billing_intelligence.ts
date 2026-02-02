import { db } from "../server/db";
import { billingEvents, billingAnomalies } from "@shared/schema/billing_enterprise";
import { billingService } from "../server/modules/billing/BillingService";
import { eq, sql } from "drizzle-orm";

async function verifyBillingIntelligence() {
    console.log("🧠 Starting Billing Intelligence Verification...");

    // 0. Inject Schema (Safe DDL for testing environment)
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS billing_anomalies (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            target_type varchar NOT NULL, 
            target_id varchar NOT NULL,
            anomaly_type varchar NOT NULL, 
            severity varchar NOT NULL, 
            confidence numeric, 
            description text,
            status varchar DEFAULT 'PENDING',
            created_at timestamp DEFAULT now()
        );
    `);

    // 1. Seed Anomalous Events
    console.log("1. Seeding Anomalous Events...");
    const [highValueEvent] = await db.insert(billingEvents).values({
        sourceSystem: "Projects",
        sourceTransactionId: "PROJ-BIG-DEAL",
        customerId: "cus_whale",
        eventDate: new Date(),
        amount: "50000.00", // > 10k threshold
        description: "Massive unrecognized payment",
        status: "Pending"
    }).returning();

    const [dupEvent1] = await db.insert(billingEvents).values({
        sourceSystem: "Orders",
        sourceTransactionId: "ORD-DUP-1",
        customerId: "cus_dup_victim",
        eventDate: new Date(),
        amount: "500.00",
        description: "Subscription Monthly",
        status: "Pending"
    }).returning();

    const [dupEvent2] = await db.insert(billingEvents).values({
        sourceSystem: "Orders",
        sourceTransactionId: "ORD-DUP-2", // Different ID, but duplicate content
        customerId: "cus_dup_victim",
        eventDate: new Date(), // Same day
        amount: "500.00",
        description: "Subscription Monthly",
        status: "Pending"
    }).returning();

    console.log(`✅ Seeded High Value Event: ${highValueEvent.id}`);
    console.log(`✅ Seeded Duplicate Candidates: ${dupEvent1.id}, ${dupEvent2.id}`);

    // 2. Run AI Detection
    console.log("2. Running AI Detection Agent...");
    const result = await billingService.detectAnomalies();
    console.log("✅ Scan Result:", result);

    // 3. Verify Specific Anomalies
    const anomalies = await db.select().from(billingAnomalies);

    // Check High Value
    const highValueAnomaly = anomalies.find(a => a.targetId === highValueEvent.id && a.anomalyType === "HIGH_VALUE");
    if (!highValueAnomaly) {
        console.error("❌ Failed to detect High Value anomaly!");
        process.exit(1);
    }
    console.log(`✅ Verified 'HIGH_VALUE' anomaly detected for amount $${highValueEvent.amount}.`);

    // Check Duplicate
    // Note: The logic flags the *second* event as duplicate of the first
    const duplicateAnomaly = anomalies.find(a => a.targetId === dupEvent2.id && a.anomalyType === "DUPLICATE_SUSPECT");
    if (!duplicateAnomaly) {
        console.error("❌ Failed to detect Duplicate anomaly!");
        process.exit(1);
    }
    console.log(`✅ Verified 'DUPLICATE_SUSPECT' anomaly detected for customer ${dupEvent2.customerId}.`);

    console.log("🎉 Intelligence Verification Successful!");
    process.exit(0);
}

verifyBillingIntelligence().catch(error => {
    console.error(error);
    process.exit(1);
});
