import 'dotenv/config';
import { db } from "../server/db";
import { HdlService } from "../server/modules/hr/services/HdlService";
import { PersonService } from "../server/modules/hr/services/PersonService";
import { AorService } from "../server/modules/hr/services/AorService";
import { hrPersons, hrAssignments, hrOrganizations } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyPhase8() {
    console.log("🔍 Starting Phase 8 Final Verification (Try 5)...");
    const tenantId = "default";
    const userId = "test-verifier";

    // 0. PRE-REQUISITES (Ensure LE exists)
    let leName = "Nexus_HDL_Test_LE";
    let leId = "1";
    const existingLe = await db.query.hrOrganizations.findFirst({
        where: eq(hrOrganizations.name, leName)
    });

    if (existingLe) {
        leId = existingLe.id;
    } else {
        console.log("Creating Test Legal Employer...");
        try {
            const [createdLe] = await db.insert(hrOrganizations).values({
                tenantId,
                name: leName,
                classificationCode: "LEGAL_EMPLOYER",
                status: "ACTIVE"
            }).returning();
            leId = createdLe.id;
            console.log("LE Created with ID:", leId);
        } catch (err: any) {
            console.log("LE Creation Skipped/Failed (Might exist):", err.message);
        }
    }

    // 1. HDL IMPORT
    console.log("\n[1] Testing HDL Import (Bulk Data)...");
    const csvContent = `METADATA|Worker|PersonNumber|FirstName|LastName|DateOfBirth|StartDate|LegalEmployer|WorkerType
MERGE|Worker|HDL_VERIFY_005|Auto|Verifier5|1990-01-01|2024-01-01|${leId}|EMPLOYEE`; // Use ID here

    try {
        const hdlResult = await HdlService.importWorkers(tenantId, userId, csvContent, "verify_hdl.csv");

        const successCount = (hdlResult as any).successCount ?? (hdlResult as any).success ?? 0;

        if (successCount === 1) {
            console.log("✅ HDL Import Successful");
        } else {
            console.error("❌ HDL Import Failed.");
            if ((hdlResult as any).errors && (hdlResult as any).errors.length > 0) {
                console.error("Errors:", JSON.stringify((hdlResult as any).errors, null, 2));
            }
        }
    } catch (e: any) {
        console.error("❌ HDL Service Error:", e.message);
    }

    // 2. EFFECTIVE DATING
    console.log("\n[2] Testing Effective Dating (Person Search)...");
    try {
        // Search Current
        const now = new Date().toISOString();
        const resCurrent = await PersonService.searchPersons(tenantId, "HDL_VERIFY_005", 1, 10, undefined, now);
        const personFound = resCurrent.data.find((p: any) => p.personNumber === "HDL_VERIFY_005");

        if (personFound) {
            console.log("✅ Person found with current effective date.");
        } else {
            console.error("❌ Person NOT found (Current Date)");
        }

        // Search Past (Before Hire in 2024 - e.g. 2023)
        const past = "2023-01-01T00:00:00.000Z";
        const resPast = await PersonService.searchPersons(tenantId, "HDL_VERIFY_005", 1, 10, undefined, past);

        const personPast = resPast.data.find((p: any) => p.personNumber === "HDL_VERIFY_005");
        if (!personPast) {
            console.log("✅ Person NOT found with past effective date (Correct).");
        } else {
            console.log("⚠️ Person found in past date (Check logic).");
        }

    } catch (e: any) {
        console.error("❌ Effective Dating Error:", e.message);
    }

    // 3. SECURITY PROFILES (AOR)
    console.log("\n[3] Testing AOR Service...");
    try {
        const aorData = {
            tenantId,
            personId: userId,
            scopeType: "DEPARTMENT",
            scopeValueId: "DEPT_123",
            responsibilityType: "HR_REP",
            isActive: true
        };
        // Insert AOR
        const [newAor] = await AorService.assignAor(aorData);
        if (newAor && newAor.id) {
            console.log("✅ AOR Assigned:", newAor.id);

            // Fetch AOR
            const fetchedAors = await AorService.getAorForUser(userId, tenantId);
            if (fetchedAors.length > 0) {
                console.log("✅ AOR Retrieved successfully.");
            } else {
                console.error("❌ AOR Retrieval Failed.");
            }
        } else {
            console.error("❌ AOR Assignment Failed.");
        }
    } catch (e: any) {
        console.error("❌ AOR Service Error:", e.message);
    }

    console.log("\n🏁 Verification Complete.");
    process.exit(0);
}

verifyPhase8().catch(e => {
    console.error("Fatal Verification Error:", e);
    process.exit(1);
});
