import "dotenv/config";
import { db } from "../server/db";
import { leads, accounts, contacts, opportunities } from "@shared/schema";
import { leadService } from "../server/services/LeadService";
import { eq } from "drizzle-orm";

async function verifyLeadConversion() {
    console.log("🔍 Verifying Lead Conversion Engine...");

    // 1. Create a Test Lead
    console.log("1️⃣ Creating Test Lead...");
    const [testLead] = await db.insert(leads).values({
        firstName: "Test",
        lastName: "Lead-" + Date.now(),
        name: "Test Lead-" + Date.now(),
        company: "Acme Corp " + Date.now(),
        email: `test.${Date.now()}@acme.com`,
        status: "New",
        industry: "Technology"
    }).returning();

    console.log(`   ✅ Created Lead: ${testLead.id} (${testLead.company})`);

    // 2. Run Conversion
    console.log("2️⃣ Executing Conversion Service...");
    try {
        const result = await leadService.convertLead(testLead.id);
        console.log("   ✅ Conversion Successful!");
        console.log(`      -> Account: ${result.account.id} (${result.account.name})`);
        console.log(`      -> Contact: ${result.contact.id} (${result.contact.firstName} ${result.contact.lastName})`);
        console.log(`      -> Opportunity: ${result.opportunity.id} (${result.opportunity.name})`);

        // 3. Verify Database State
        console.log("3️⃣ Verifying Database State...");

        // Verify Lead is converted
        const [updatedLead] = await db.select().from(leads).where(eq(leads.id, testLead.id));
        if (updatedLead.isConverted !== 1) throw new Error("Lead isConverted flag is NOT set!");
        if (!updatedLead.convertedAccountId) throw new Error("Lead missing convertedAccountId!");

        console.log("   ✅ Lead status verified (Converted Flag Set).");

        console.log("🎉 SUCCESS: Lead Conversion Engine is functioning correctly.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Conversion Failed:", error);
        process.exit(1);
    }
}

verifyLeadConversion();
