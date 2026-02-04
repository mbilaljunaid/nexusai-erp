
import "dotenv/config";
import { db } from "../server/db";
import { hrPersons, hrWorkRelationships, hrAssignments, hrOrganizations, hrAor } from "../shared/schema";
import { AorService } from "../server/modules/hr/services/AorService";
import { eq } from "drizzle-orm";

async function verifyAorCoverage() {
    console.log("🔍 Verifying AOR Coverage Calculation...");
    const tenantId = "test_tenant_cov_" + Date.now();
    const actorId = "system";

    try {
        // 1. Setup Organization
        console.log("   - Seeding Organization (Dept A)...");
        const deptA = "org_cov_a_" + Date.now();
        await db.insert(hrOrganizations).values([
            { id: deptA, tenantId, name: "Department A", classificationCode: "DEPARTMENT", status: "A" }
        ]);

        // 2. Setup Employees in Dept A
        console.log("   - Seeding 2 Employees in Dept A...");
        // Use a loop or simple inserts
        const p1 = await db.insert(hrPersons).values({
            tenantId, firstName: "Emp", lastName: "One", personNumber: "COV001", email: "cov1@test.com"
        }).returning();
        const wrId1 = "wr_cov1_" + tenantId;
        const asgId1 = "asg_cov1_" + tenantId;
        await db.insert(hrWorkRelationships).values({
            id: wrId1, tenantId, personId: p1[0].id, legalEmployerId: "le1", dateStart: "2023-01-01"
        });
        await db.insert(hrAssignments).values({
            id: asgId1, tenantId, personId: p1[0].id, workRelationshipId: wrId1,
            departmentId: deptA, assignmentStatus: "ACTIVE", primaryAssignmentFlag: true, effectiveStartDate: "2023-01-01",
            assignmentNumber: "ASG-" + asgId1
        });

        const p2 = await db.insert(hrPersons).values({
            tenantId, firstName: "Emp", lastName: "Two", personNumber: "COV002", email: "cov2@test.com"
        }).returning();
        const wrId2 = "wr_cov2_" + tenantId;
        const asgId2 = "asg_cov2_" + tenantId;
        await db.insert(hrWorkRelationships).values({
            id: wrId2, tenantId, personId: p2[0].id, legalEmployerId: "le1", dateStart: "2023-01-01"
        });
        await db.insert(hrAssignments).values({
            id: asgId2, tenantId, personId: p2[0].id, workRelationshipId: wrId2,
            departmentId: deptA, assignmentStatus: "ACTIVE", primaryAssignmentFlag: true, effectiveStartDate: "2023-01-01",
            assignmentNumber: "ASG-" + asgId2
        });

        // 3. Setup AOR for Dept A
        console.log("   - Seeding AOR for Dept A...");
        await db.insert(hrAor).values({
            id: "aor_cov_1",
            tenantId,
            personId: "some_manager",
            name: "Dept A Manager",
            scopeType: "DEPARTMENT",
            scopeValueId: deptA,
            isActive: true
        });

        // 4. Verify listAors returns coverageCount = 2
        console.log("🧪 Test 1: Check Coverage Count");
        const aors = await AorService.listAors(tenantId);
        const aor = aors.find((a: any) => a.id === "aor_cov_1");

        if (aor && aor.coverageCount === 2) {
            console.log("   ✅ Success: Coverage Count is 2.");
        } else {
            console.error(`   ❌ Failed: Expected 2, got ${aor?.coverageCount}`);
            // If type doesn't exist on 'aor', we might need to cast or check if raw query returned it.
            console.log("Full AOR object:", aor);
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

verifyAorCoverage();
