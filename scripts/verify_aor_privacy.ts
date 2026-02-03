import "dotenv/config";
import { PersonService } from "../server/modules/hr/services/PersonService";
import { AorService } from "../server/modules/hr/services/AorService";
import { db } from "../server/db";
import { hrPersons, hrAssignments, hrWorkRelationships } from "../shared/schema/hr_worker";
import { hrOrganizations, hrLocations } from "../shared/schema/hr_structures";
import { eq, and } from "drizzle-orm";

async function verifyAorPrivacy() {
    console.log("Starting AOR Privacy Verification...");
    const tenantId = "test-tenant-" + Date.now();

    try {
        // 1. Setup Structures
        console.log("Setting up departments and locations...");
        const [dept] = await db.insert(hrOrganizations).values({
            tenantId,
            name: "Secret R&D",
            type: "DEPT",
            status: "ACTIVE"
        }).returning();

        const [le] = await db.insert(hrOrganizations).values({
            tenantId,
            name: "Global Corp LE",
            type: "LE",
            status: "ACTIVE"
        }).returning();

        const [loc] = await db.insert(hrLocations).values({
            tenantId,
            locationCode: "SECRET_LAB",
            name: "Secret Lab",
            status: "ACTIVE"
        }).returning();

        // 2. Setup Persons
        console.log("Creating test personnel...");
        // The Worker (Subject)
        const [worker] = await db.insert(hrPersons).values({
            tenantId,
            personNumber: "W" + Date.now(),
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: "1985-05-15",
            nationalId: "SSN-123-4567"
        }).returning();

        // Work Relationship & Assignment
        const [rel] = await db.insert(hrWorkRelationships).values({
            tenantId,
            personId: worker.id,
            legalEmployerId: le.id,
            dateStart: "2020-01-01",
            workerType: "EMPLOYEE"
        }).returning();

        await db.insert(hrAssignments).values({
            tenantId,
            personId: worker.id,
            workRelationshipId: rel.id,
            assignmentNumber: "ASG-" + worker.personNumber,
            departmentId: dept.id,
            locationId: loc.id,
            effectiveStartDate: "2020-01-01",
            assignmentStatus: "ACTIVE"
        });

        // The Managers
        const [managerOk] = await db.insert(hrPersons).values({
            tenantId,
            personNumber: "M-OK-" + Date.now(),
            firstName: "Authorized",
            lastName: "Manager"
        }).returning();

        const [managerNo] = await db.insert(hrPersons).values({
            tenantId,
            personNumber: "M-NO-" + Date.now(),
            firstName: "Unauthorized",
            lastName: "Manager"
        }).returning();

        // 3. Setup AOR
        console.log("Assigning AOR to Authorized Manager...");
        await AorService.assignAor({
            tenantId,
            personId: managerOk.id,
            scopeType: "DEPARTMENT",
            scopeValueId: dept.id,
            responsibilityType: "HR_REP"
        });

        // 4. Test Verification
        console.log("\n--- Running Visibility Tests ---\n");

        // TEST 1: Authorized access (Full Data)
        console.log("Test 1: Authorized manager viewing profile...");
        const profileOk = await PersonService.getPersonProfile(worker.id, tenantId, managerOk.id);
        const pOk = profileOk?.person;
        console.log("DOB seen by Auth Manager:", pOk.dateOfBirth);
        console.log("National ID seen by Auth Manager:", pOk.nationalId);

        if (pOk.dateOfBirth === "1985-05-15" && pOk.nationalId === "SSN-123-4567") {
            console.log("✅ Success: Authorized manager saw full data.");
        } else {
            console.error("❌ Failure: Authorized manager's data was masked!");
        }

        // TEST 2: Unauthorized access (Masked Data)
        console.log("\nTest 2: Unauthorized manager viewing profile...");
        const profileNo = await PersonService.getPersonProfile(worker.id, tenantId, managerNo.id);
        const pNo = profileNo?.person;
        console.log("DOB seen by Unauth Manager:", pNo.dateOfBirth);
        console.log("National ID seen by Unauth Manager:", pNo.nationalId);

        if (pNo.dateOfBirth === "1900-01-01" && pNo.nationalId.startsWith("***")) {
            console.log("✅ Success: Unauthorized manager saw masked data.");
        } else {
            console.error("❌ Failure: Unauthorized manager saw raw PII!");
        }

        // TEST 3: Search Filtering (Record Level)
        console.log("\nTest 3: Search filtering...");
        const searchOk = await PersonService.searchPersons(tenantId, "John", 1, 10, managerOk.id);
        console.log("Results for Auth Manager:", searchOk.data.length);

        const searchNo = await PersonService.searchPersons(tenantId, "John", 1, 10, managerNo.id);
        console.log("Results for Unauth Manager:", searchNo.data.length);

        if (searchOk.data.length === 1 && searchNo.data.length === 0) {
            console.log("✅ Success: Search filtering active.");
        } else {
            console.error("❌ Failure: Search filtering inconsistent.");
        }

        console.log("\n--- Verification Complete ---");

    } catch (error) {
        console.error("Error during verification:", error);
    } finally {
        process.exit(0);
    }
}

verifyAorPrivacy();
