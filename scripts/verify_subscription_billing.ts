
import { db } from "../server/db";
import { subscriptionContracts, subscriptionProducts, billingEvents } from "@shared/schema";
import { subscriptionService } from "../server/modules/billing/SubscriptionService";
import { eq, desc } from "drizzle-orm";

async function verifySubscriptionBilling() {
    console.log("🔍 Verification: Deep Integration (Subscription -> Billing)...");

    try {
        // 1. Setup Data: Create an Active Subscription
        console.log("\n1. Seeding Active Subscription...");
        const contractNumber = `BILL-TEST-${Date.now()}`;
        const sub = await subscriptionService.createSubscription({
            contractNumber: contractNumber,
            customerId: "cust_bill_test",
            startDate: new Date(),
            totalTcv: "24000",
            totalMrr: "2000",
            products: [
                { itemId: "item_cloud", itemName: "Cloud Hosting", quantity: "1", unitPrice: "2000", amount: "2000" }
            ]
        });
        console.log(`   - Created Sub: ${sub?.contractNumber}`);

        // 2. Trigger Billing Cycle
        console.log("\n2. Running Billing Cycle...");
        const result = await subscriptionService.generateBillingEvents();
        console.log(`   - Generated ${result.count} events.`);

        // 3. Verify Billing Event
        console.log("\n3. Verifying Billing Event...");
        const events = await db.select().from(billingEvents)
            .where(eq(billingEvents.sourceTransactionId, sub!.products[0].id))
            .orderBy(desc(billingEvents.createdAt));

        if (events.length > 0) {
            const e = events[0];
            console.log(`   - Found Event: ${e.id}`);
            console.log(`   - Amount: ${e.amount}`);
            console.log(`   - Desc: ${e.description}`);

            if (Number(e.amount) === 2000 && e.sourceSystem === "Contracts") {
                console.log("✅ Billing Event Verification Successful");
            } else {
                console.error("❌ Data Mismatch", e);
                process.exit(1);
            }
        } else {
            console.error("❌ No Billing Event Found! Deep Integration Failed.");
            process.exit(1);
        }

        console.log("\n🎉 Deep Integration Verified!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifySubscriptionBilling();
