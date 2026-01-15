
import { db } from "../server/db";
import { subscriptionContracts, subscriptionProducts, subscriptionActions } from "@shared/schema/billing_subscription";
import { subscriptionService } from "../server/modules/billing/SubscriptionService";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

async function verifySubscriptions() {
    console.log("🔍 Starting Subscription Lifecycle Verification...");

    try {
        // 1. Test Creation
        console.log("\n1. Testing Subscription Creation...");
        const contractNumber = `SUB-TEST-${Date.now()}`;
        const newSub = await subscriptionService.createSubscription({
            contractNumber: contractNumber,
            customerId: "cust_lifecycle_test",
            startDate: new Date(),
            endDate: null, // Should default to +1 year
            totalTcv: "12000",
            totalMrr: "1000",
            products: [
                { itemId: "item_saas", itemName: "SaaS Enterprise", quantity: "10", unitPrice: "100", amount: "1000" }
            ]
        });

        if (newSub?.status === "Active" && newSub.products.length === 1) {
            console.log("✅ Subscription Created Successfully:", newSub.id);
        } else {
            console.error("❌ Creation Failed", newSub);
            process.exit(1);
        }

        // 2. Test Amendment (Quantity Increase)
        console.log("\n2. Testing Amendment (Upsell)...");
        const product = newSub.products[0];
        const newQty = 15; // +5
        const newAmt = 1500;

        const amendedSub = await subscriptionService.amendSubscription(newSub.id, {
            reason: "Growth",
            mrrDelta: 500,
            products: [
                { id: product.id, quantity: newQty, amount: newAmt }
            ]
        });

        if (Number(amendedSub?.totalMrr) === 1500 && Number(amendedSub.products[0].quantity) === 15) {
            console.log("✅ Amendment Successful (MRR Updated)");
        } else {
            console.error("❌ Amendment Failed", { mrr: amendedSub?.totalMrr, qty: amendedSub?.products[0].quantity });
            process.exit(1);
        }

        // 3. Test Renewal
        console.log("\n3. Testing Renewal...");
        const oldEndDate = new Date(amendedSub?.endDate!);
        const renewedSub = await subscriptionService.renewSubscription(newSub.id);
        const newEndDate = new Date(renewedSub?.endDate!);

        if (newEndDate.getFullYear() === oldEndDate.getFullYear() + 1) {
            console.log("✅ Renewal Successful (Date Extended)");
        } else {
            console.error("❌ Renewal Failed", { old: oldEndDate, new: newEndDate });
            process.exit(1);
        }

        // 4. Test Termination
        console.log("\n4. Testing Termination...");
        await subscriptionService.terminateSubscription(newSub.id, "Customer Churn");
        const finalSub = await subscriptionService.getSubscription(newSub.id);

        if (finalSub?.status === "Cancelled") {
            console.log("✅ Termination Successful");
        } else {
            console.error("❌ Termination Failed");
            process.exit(1);
        }

        // 5. Check History Log
        console.log("\n5. Verifying Audit Trail...");
        const actions = await db.select().from(subscriptionActions).where(eq(subscriptionActions.subscriptionId, newSub.id));
        console.log(`   - Found ${actions.length} actions logged.`);
        if (actions.length >= 4) { // New, Amend, Renew, Terminate
            console.log("✅ Audit Trail Verified");
        } else {
            console.error("❌ Audit Trail Incomplete");
            process.exit(1);
        }

        console.log("\n🎉 Subscription System Verified!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifySubscriptions();
