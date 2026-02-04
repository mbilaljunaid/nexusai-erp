
import "dotenv/config";
import { db } from "../server/db";
import { hrPersons, hrWorkRelationships, hrAssignments, hrAor, hrOrganizations } from "../shared/schema";
import { PersonService } from "../server/modules/hr/services/PersonService";
import { eq } from "drizzle-orm";

async function verifyPIIMasking() {
    console.log("🔍 Verifying PII Masking Engine (@MaskPII)...");
    const tenantId = "test_tenant_pii_" + Date.now();
    const actorId = "system";

    try {
        // 1. Setup Organizations
        console.log("   - Seeding Organizations...");
        const orgAId = "org_A_" + Date.now();
        const orgBId = "org_B_" + Date.now();
        await db.insert(hrOrganizations).values([
            { id: orgAId, tenantId, name: "Sales Dept", classificationCode: "DEPARTMENT", status: "A" },
            { id: orgBId, tenantId, name: "IT Dept", classificationCode: "DEPARTMENT", status: "A" }
        ]);

        // 2. Setup Context User (The Manager)
        console.log("   - Seeding User (Restricted Manager)...");
        const userId = "user_manager_" + Date.now();
        // We simulate a user by just having an ID (in real app, they are in users table, but AOR links via personId usually)
        // AOR service checks hr_aor.person_id. So we need to ensure this user 'exists' conceptually or at least has AORs.
        // The service doesn't require the user to exist in hrPersons to check AORs, just the ID match in hrAor table.

        // Assign AOR: Scope = DEPARTMENT, Value = Org A (Sales)
        await db.insert(hrAor).values({
            id: "aor_" + Date.now(),
            tenantId,
            personId: userId, // The "User"
            name: "Sales Manager AOR",
            scopeType: "DEPARTMENT",
            scopeValueId: orgAId,
            isActive: true
        });

        // 3. Setup Person A (Inside Scope)
        console.log("   - Seeding Person A (In Scope - Sales)...");
        const personA = await PersonService.hireWorker({
            person: { firstName: "Alice", lastName: "Authorized", personNumber: "AUTH001", nationalId: "999-99-9999", dateOfBirth: "1990-01-01", email: "alice@test.com" },
            workRelationship: { legalEmployerId: "le1", dateStart: "2023-01-01" },
            assignment: { departmentId: orgAId, assignmentStatus: "ACTIVE", primaryAssignmentFlag: true }
        }, tenantId, actorId);

        // 4. Setup Person B (Outside Scope)
        console.log("   - Seeding Person B (Out Scope - IT)...");
        const personB = await PersonService.hireWorker({
            person: { firstName: "Bob", lastName: "Blocked", personNumber: "BLOCK001", nationalId: "111-11-1111", dateOfBirth: "1985-05-05", email: "bob@test.com" },
            workRelationship: { legalEmployerId: "le1", dateStart: "2023-01-01" },
            assignment: { departmentId: orgBId, assignmentStatus: "ACTIVE", primaryAssignmentFlag: true }
        }, tenantId, actorId);

        // ==========================================
        // TEST 1: Authorized Access
        // ==========================================
        console.log("\n🧪 Test 1: Authorized Access (In Scope)");
        const resultA = await PersonService.getPersonProfile(personA.person.id, tenantId, userId);

        if (resultA?.person.nationalId === "999-99-9999") {
            console.log("   ✅ Success: PII is visible for authorized scope.");
        } else {
            console.error(`   ❌ Failed: Expected '999-99-9999', got '${resultA?.person.nationalId}'`);
            process.exit(1);
        }

        // ==========================================
        // TEST 2: Unauthorized Access (Masking)
        // ==========================================
        console.log("\n🧪 Test 2: Unauthorized Access (Out Scope)");
        const resultB = await PersonService.getPersonProfile(personB.person.id, tenantId, userId);

        // Should return the record, but masked
        if (!resultB) {
            console.error("   ❌ Failed: Record not returned at all (expected masked return).");
            process.exit(1);
        }

        if (resultB.person.nationalId?.includes("***")) {
            console.log(`   ✅ Success: PII is masked: ${resultB.person.nationalId}`);
        } else {
            console.error(`   ❌ Failed: Expected '***...', got '${resultB.person.nationalId}'`);
            process.exit(1);
        }

        // ==========================================
        // TEST 3: Search Filtering (Bonus)
        // ==========================================
        console.log("\n🧪 Test 3: Search Filtering");
        const searchRes = await PersonService.searchPersons(tenantId, undefined, 1, 10, userId);
        // Should only find Alice
        const foundNames = searchRes.data.map((p: any) => p.firstName);
        console.log(`   - Found: ${foundNames.join(", ")}`);

        if (foundNames.includes("Alice") && !foundNames.includes("Bob")) {
            console.log("   ✅ Success: Search filtered out-of-scope records.");
        } else {
            console.error("   ❌ Failed: Search results incorrect.");
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
        process.exit(1);
    } finally {
        // Cleanup
        await db.delete(hrAor).where(eq(hrAor.tenantId, tenantId));
        await db.delete(hrAssignments).where(eq(hrAssignments.tenantId, tenantId));
        await db.delete(hrWorkRelationships).where(eq(hrWorkRelationships.tenantId, tenantId));
        await db.delete(hrPersons).where(eq(hrPersons.tenantId, tenantId));
        await db.delete(hrOrganizations).where(eq(hrOrganizations.tenantId, tenantId));
        process.exit(0);
    }
}

verifyPIIMasking();
