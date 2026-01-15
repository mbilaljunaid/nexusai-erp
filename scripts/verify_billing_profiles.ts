
import "dotenv/config";
import { db } from "../server/db";
import { billingProfiles } from "@shared/schema/billing_enterprise";
import { arCustomers } from "@shared/schema/ar";
import { eq } from "drizzle-orm";

async function verifyBillingProfiles() {
    console.log("🔍 Starting Verification: Billing Profiles...");

    try {
        // 1. Get a Customer (or create one)
        let customer = await db.query.arCustomers.findFirst();
        if (!customer) {
            console.log("⚠️ No customers found. Creating a test customer...");
            [customer] = await db.insert(arCustomers).values({
                name: "Test Corp for Billing",
                accountNumber: "TC-999",
                status: "Active"
            }).returning();
        }
        console.log(`✅ Customer Found: ${customer.name} (${customer.id})`);

        // 2. Clear existing profiles for this customer to ensure clean slate
        await db.delete(billingProfiles).where(eq(billingProfiles.customerId, customer.id));

        // 3. Test Create (POST equivalent)
        console.log("👉 Testing Creation...");
        const [profile] = await db.insert(billingProfiles).values({
            customerId: customer.id,
            currency: "GBP",
            paymentTerms: "Net 60",
            taxExempt: true,
            taxExemptionNumber: "TE-123456",
            emailInvoices: true
        }).returning();

        if (!profile) throw new Error("Failed to create profile");
        console.log(`✅ Profile Created. ID: ${profile.id}, Terms: ${profile.paymentTerms}`);

        // 4. Test Fetch (GET equivalent)
        console.log("👉 Testing Fetch...");
        const fetchedProfile = await db.query.billingProfiles.findFirst({
            where: eq(billingProfiles.id, profile.id)
        });

        if (!fetchedProfile) throw new Error("Failed to fetch profile");
        if (fetchedProfile.currency !== "GBP") throw new Error(`Currency mismatch. Expected GBP, got ${fetchedProfile.currency}`);
        console.log(`✅ Profile Fetched correctly.`);

        // 5. Test Update (PATCH equivalent)
        console.log("👉 Testing Update...");
        const [updatedProfile] = await db.update(billingProfiles)
            .set({ paymentTerms: "Immediate" })
            .where(eq(billingProfiles.id, profile.id))
            .returning();

        if (updatedProfile.paymentTerms !== "Immediate") throw new Error("Update failed.");
        console.log(`✅ Profile Updated. New Terms: ${updatedProfile.paymentTerms}`);

        console.log("\n🎉 VERIFICATION SUCCESSFUL: Billing Profiles Backend is Solid.");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ VERIFICATION FAILED:", error);
        process.exit(1);
    }
}

verifyBillingProfiles();
