import { db } from "../server/db";
import { billingRules, billingEvents } from "@shared/schema/billing_enterprise";
import { billingService } from "../server/modules/billing/BillingService";
import { eq, sql } from "drizzle-orm";

async function verifyBillingRules() {
    console.log("⚙️ Starting Billing Rules Verification...");

    // 1. Create a Recurring Rule
    console.log("1. Creating Recurring Rule...");
    const rule = await billingService.createRule({
        name: "Test Monthly Subscription",
        ruleType: "RECURRING",
        frequency: "MONTHLY",
        isActive: true,
        milestonePercentage: "0" // Needed for Drizzle insert if not null
    });
    console.log(`✅ Rule Created: ${rule.id} | Type: ${rule.ruleType}`);

    // 2. Run Recurring Engine
    console.log("2. Running Recurring Engine...");
    const result = await billingService.generateRecurringEvents();
    console.log(`✅ Engine Result: Processed ${result.processingCount} rules, Generated ${result.eventsGenerated} events.`);

    if (result.eventsGenerated === 0) {
        console.error("❌ Failed to generate recurring event!");
        // Only fail if we expected it (idempotency might block if re-running)
        const check = await db.select().from(billingEvents).where(eq(billingEvents.ruleId, rule.id));
        if (check.length > 0) {
            console.log("⚠️ Event already existed (Idempotency working).");
        } else {
            process.exit(1);
        }
    }

    // 3. Verify Event Created
    const events = await db.select().from(billingEvents).where(eq(billingEvents.ruleId, rule.id));
    const generatedEvent = events[0];

    if (!generatedEvent) {
        console.error("❌ Event record not found in DB!");
        process.exit(1);
    }

    console.log(`✅ Recurring Event Verified: ${generatedEvent.description} | Date: ${generatedEvent.eventDate}`);

    // 4. Test Idempotency (Run again, should be 0)
    console.log("4. Testing Idempotency...");
    const result2 = await billingService.generateRecurringEvents();
    if (result2.eventsGenerated === 0) {
        console.log("✅ Idempotency Verified (No duplicate events for same month).");
    } else {
        console.error("❌ Idempotency FAILED! Duplicate events generated.");
        process.exit(1);
    }

    console.log("🎉 Rules Verification Successful!");
    process.exit(0);
}

verifyBillingRules().catch(console.error);
