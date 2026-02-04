
import "dotenv/config";
import { db } from "../server/db";
import { hrPersons, hrPolicyAcknowledgements } from "../shared/schema";
import { PolicyAcknowledgementService } from "../server/modules/hr/services/PolicyAcknowledgementService";
import { eq } from "drizzle-orm";

async function verifyGdprRights() {
    console.log("🔍 Verifying GDPR Rights (Step 1: Consent)...");
    const tenantId = "test_tenant_gdpr_" + Date.now();

    try {
        // 1. Create a Person
        console.log("   - Creating Test Person...");
        const p1 = await db.insert(hrPersons).values({
            tenantId, firstName: "Privacy", lastName: "Tester", personNumber: "GDPR001", email: "privacy@test.com"
        }).returning();
        const personId = p1[0].id;

        // 2. Check Pending Policies
        console.log("🧪 Test 1: Check Pending Policies");
        const pendingBefore = await PolicyAcknowledgementService.getPendingPolicies(personId, tenantId);
        if (pendingBefore.length > 0) {
            console.log(`   ✅ Success: User has ${pendingBefore.length} pending policies.`);
        } else {
            console.error("   ❌ Failed: Expected pending policies.");
            process.exit(1);
        }

        // 3. Acknowledge a Policy
        console.log("🧪 Test 2: Acknowledge 'Global Data Privacy Policy'");
        const ack = await PolicyAcknowledgementService.acknowledgePolicy({
            tenantId,
            personId,
            policyCode: "GDPR_PRIVACY",
            consentVersion: "v2026.1",
            ipAddress: "127.0.0.1",
            userAgent: "Test Script"
        });

        if (ack && ack[0].id) {
            console.log("   ✅ Success: Acknowledgement recorded.");
        } else {
            console.error("   ❌ Failed: Acknowledgement not recorded.");
            process.exit(1);
        }

        // 4. Verify Signed Status
        console.log("🧪 Test 3: Verify Policy is Signed");
        const pendingAfter = await PolicyAcknowledgementService.getPendingPolicies(personId, tenantId);
        const signed = await PolicyAcknowledgementService.hasSigned(personId, "GDPR_PRIVACY", "v2026.1", tenantId);

        if (signed && pendingAfter.length === pendingBefore.length - 1) {
            console.log("   ✅ Success: Policy marked as signed, removed from pending.");
        } else {
            console.error(`   ❌ Failed: Status mismatch. Signed=${signed}, PendingCount=${pendingAfter.length}`);
            process.exit(1);
        }

        // 5. Verify Right to Erasure
        console.log("🧪 Test 4: Verify Right to Erasure (Scrub)");

        // Import service dynamically or add import to top
        const { AnonymizationService } = await import("../server/modules/hr/services/AnonymizationService");

        await AnonymizationService.scrubPerson(personId, tenantId);

        const [scrubbedPerson] = await db.select().from(hrPersons).where(eq(hrPersons.id, personId));

        if (scrubbedPerson.firstName === "ANONYMIZED" && scrubbedPerson.nationalId === "REDACTED" && !scrubbedPerson.dateOfBirth) {
            console.log("   ✅ Success: Person PII scrubbed.");
        } else {
            console.error("   ❌ Failed: Person PII NOT scrubbed.", scrubbedPerson);
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
        process.exit(1);
    } finally {
        await db.delete(hrPolicyAcknowledgements).where(eq(hrPolicyAcknowledgements.tenantId, tenantId));
        await db.delete(hrPersons).where(eq(hrPersons.tenantId, tenantId));
        process.exit(0);
    }
}

verifyGdprRights();
