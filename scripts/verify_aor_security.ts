import 'dotenv/config';
import { db } from "../server/db";
import { PersonService } from "../server/modules/hr/services/PersonService";
import { AorService } from "../server/modules/hr/services/AorService";
import { hrOrganizations, hrPersons } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyAorSecurity() {
    console.log("🔍 Testing AOR Row-Level Security...");
    const tenantId = "default";
    const adminId = "system-admin";

    // 1. SETUP DEPARTMENTS
    console.log("[1] Setting up Departments...");
    const deptA = await getOrCreateOrg(tenantId, "AOR_DEPT_A", "DEPARTMENT");
    const deptB = await getOrCreateOrg(tenantId, "AOR_DEPT_B", "DEPARTMENT");

    // 2. CREATE WORKERS
    console.log("[2] Hiring Workers in Departments...");
    // Worker A in Dept A
    await hireWorker("WORKER_A", "AOR_A", deptA.id, tenantId, adminId);
    // Worker B in Dept B
    await hireWorker("WORKER_B", "AOR_B", deptB.id, tenantId, adminId);

    // 3. SETUP SECURITY USER
    console.log("[3] Setting up Security User (HR Rep for Dept A)...");
    const hrUserId = "HR_REP_USER_A";
    // Clear existing AORs for clean test
    // (In real db we might want to delete from hr_aor where personId = hrUserId, skipping for simplicity/safety)

    await AorService.assignAor({
        tenantId,
        personId: hrUserId,
        scopeType: "DEPARTMENT",
        scopeValueId: deptA.id,
        responsibilityType: "HR_REP",
        isActive: true
    });
    console.log(`✅ Assigned AOR: Dept A (${deptA.id}) to User ${hrUserId}`);

    // 4. VERIFY ACCESS
    console.log("\n[4] Verifying Access Control...");

    // Search as HR Rep
    // Should see Worker A, Should NOT see Worker B
    const searchResult = await PersonService.searchPersons(tenantId, "AOR_", 1, 100, hrUserId);

    const hasWorkerA = searchResult.data.some((p: any) => p.personNumber === "WORKER_A");
    const hasWorkerB = searchResult.data.some((p: any) => p.personNumber === "WORKER_B");

    console.log("Results for HR Rep (Scope: Dept A):");
    console.log(`- Can see Worker A (Dept A): ${hasWorkerA ? "✅ YES" : "❌ NO"}`);
    console.log(`- Can see Worker B (Dept B): ${!hasWorkerB ? "✅ NO" : "❌ YES (Leak)"}`);

    if (hasWorkerA && !hasWorkerB) {
        console.log("\n✅ SUCCESS: AOR Security is functioning correctly.");
        process.exit(0);
    } else {
        console.error("\n❌ FAILURE: AOR Security check failed.");
        process.exit(1);
    }
}

// --- HELPERS ---

async function getOrCreateOrg(tenantId: string, name: string, type: string) {
    const existing = await db.query.hrOrganizations.findFirst({
        where: eq(hrOrganizations.name, name)
    });
    if (existing) return existing;

    const [created] = await db.insert(hrOrganizations).values({
        tenantId,
        name,
        classificationCode: type,
        status: "ACTIVE"
    }).returning();
    return created;
}

async function hireWorker(pNum: string, lName: string, deptId: string, tenantId: string, actorId: string) {
    // Ensure LE exists
    const le = await getOrCreateOrg(tenantId, "AOR_LEGAL_ENTITY", "LEGAL_EMPLOYER");

    // Check if exists
    const existing = await db.query.hrPersons.findFirst({
        where: eq(hrPersons.personNumber, pNum)
    });
    if (existing) return existing;

    // Use PersonService.hireWorker
    await PersonService.hireWorker({
        person: {
            personNumber: pNum,
            firstName: "Test",
            lastName: lName
        },
        workRelationship: {
            dateStart: new Date().toISOString().split('T')[0],
            legalEmployerId: le.id,
            workerType: "EMPLOYEE"
        },
        assignment: {
            departmentId: deptId,
            effectiveStartDate: new Date().toISOString().split('T')[0]
        }
    }, tenantId, actorId);
}

verifyAorSecurity().catch(console.error);
