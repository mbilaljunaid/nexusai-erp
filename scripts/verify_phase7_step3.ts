
import { db } from "../server/db";
import { supplierPortalService } from "../server/services/SupplierPortalService";
import { dbStorage } from "../server/storage-db"; // CRM Storage
import { hzParties } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyIntegration() {
    console.log("Starting MDM Phase 7 Step 3 Verification (Entity Integration)...");

    try {
        // ==========================================
        // 1. Verify Supplier Onboarding -> Party
        // ==========================================
        console.log("\n[1] Verifying Supplier Onboarding -> Party Linkage...");

        // Create request
        const request = await supplierPortalService.submitRegistration({
            companyName: "Integration Test Supplier " + Date.now(),
            taxId: "TAX-" + Date.now(),
            contactEmail: `supplier.${Date.now()}@test.com`,
            phone: "555-0100",
            businessClassification: "SMALL_BUSINESS",
            status: "PENDING"
        });
        console.log("Submitted Request:", request.id);

        // Approve request
        const supplier = await supplierPortalService.approveRegistration(request.id, "1");
        console.log("Approved Supplier:", supplier.id);

        if (!supplier.partyId) throw new Error("Supplier missing partyId link!");

        const [supplierParty] = await db.select().from(hzParties).where(eq(hzParties.id, supplier.partyId));
        if (!supplierParty) throw new Error("Linked Party not found in hz_parties!");
        console.log(`Success: Supplier ${supplier.name} linked to Party ${supplierParty.partyName} (${supplierParty.partyNumber})`);


        // ==========================================
        // 2. Verify CRM Account -> Party
        // ==========================================
        console.log("\n[2] Verifying CRM Account -> Party Linkage...");

        const account = await dbStorage.createAccount({
            name: "Integration Test Account " + Date.now(),
            industry: "Technology",
            ownerId: "1"
        });
        console.log("Created Account:", account.id);

        if (!account.partyId) throw new Error("Account missing partyId link!");

        const [accountParty] = await db.select().from(hzParties).where(eq(hzParties.id, account.partyId));
        if (!accountParty) throw new Error("Linked Party not found for Account!");
        console.log(`Success: Account ${account.name} linked to Party ${accountParty.partyName}`);


        // ==========================================
        // 3. Verify CRM Lead Conversion -> Party (Account & Contact)
        // ==========================================
        console.log("\n[3] Verifying Lead Conversion -> Party (Account/Contact)...");

        // Create Lead
        const lead = await dbStorage.createLead({
            company: "Integration Lead Co " + Date.now(),
            firstName: "Lead",
            lastName: "User " + Date.now(),
            last_name: "User " + Date.now(), // Try forcing snake_case
            name: "Lead User " + Date.now(),
            email: `lead.${Date.now()}@test.com`,
            leadSource: "Web",
            ownerId: "1"
        });
        console.log("Created Lead:", lead.id);

        // Convert Lead
        const conversion = await dbStorage.convertLead(lead.id, "1");
        console.log("Converted Lead to Account:", conversion.account.id, "and Contact:", conversion.contact.id);

        // Check Account Party
        if (!conversion.account.partyId) throw new Error("Converted Account missing partyId!");
        const [convAcctParty] = await db.select().from(hzParties).where(eq(hzParties.id, conversion.account.partyId));
        if (!convAcctParty) throw new Error("Converted Account Party not found!");

        // Check Contact Party
        if (!conversion.contact.partyId) throw new Error("Converted Contact missing partyId!");
        const [convContParty] = await db.select().from(hzParties).where(eq(hzParties.id, conversion.contact.partyId));
        if (!convContParty) throw new Error("Converted Contact Party not found!");

        console.log(`Success: Lead Conversion created linked Parties:\n - Account Party: ${convAcctParty.partyNumber}\n - Contact Party: ${convContParty.partyNumber}`);

        console.log("\n--- Verification SUCCESS ---");
        process.exit(0);
    } catch (e: any) {
        console.error("Verification FAILED:", e);
        process.exit(1);
    }
}

verifyIntegration();
