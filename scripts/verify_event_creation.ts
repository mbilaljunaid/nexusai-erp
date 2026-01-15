
import 'dotenv/config';
import { db } from "../server/db";
import { billingEvents, billingProfiles } from "@shared/schema/billing_enterprise";
import { billingService } from "../server/modules/billing/BillingService";

async function verifyCreationFlow() {
    console.log("🔍 Verifying Manual Event Creation Flow...");

    // 1. Ensure a customer profile exists (needed for the dropdown)
    const [existingProfile] = await db.select().from(billingProfiles).limit(1);
    let customerId = existingProfile?.customerId;

    if (!customerId) {
        console.log("   ⚠️ No profiles found, creating one for test...");
        customerId = "TEST-MANUAL-USER";
        await db.insert(billingProfiles).values({
            id: `prof-${Date.now()}`,
            customerId: customerId,
            customerName: "Manual Test User",
            currency: "USD",
            paymentTerms: "Net 30",
            taxExempt: false,
            autoEmailInvoice: false
        });
    }

    // 2. Simulate Frontend Payload
    const payload = {
        customerId: customerId,
        amount: "150.00",
        eventDate: new Date(),
        description: "Manual Event from Test Script",
        sourceSystem: "Manual",
        sourceTransactionId: `MAN-TEST-${Date.now()}`,
        currency: "USD",
        status: "Pending" // Frontend sends this, or service defaults? Controller usually handles validation.
    };

    console.log("   📤 Sending Payload:", payload);

    // 3. call service just like controller would
    try {
        const result = await billingService.processEvent(payload);
        console.log("   ✅ Event Created Successfully:", result);
    } catch (e: any) {
        console.error("   ❌ Creation Failed:", e.message);
        process.exit(1);
    }

    process.exit(0);
}

verifyCreationFlow().catch(console.error);
