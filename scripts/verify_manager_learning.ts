
import { db } from "@db";
import { sql, eq } from "drizzle-orm";
import { hrPersons, hrAssignments, hrWorkRelationships } from "@shared/schema/hr_worker";
import { hrOrganizations } from "@shared/schema/hr_structures";
import { hrmLearningCourses, hrmLearningOfferings, hrmLearningEnrollments } from "@shared/schema/talent_learning";
import { ManagerLearningService } from "../server/services/ManagerLearningService";

async function verifyManagerLearning() {
    console.log("🚦 Starting Manager Learning Verification...");

    // 1. SETUP DATA
    const tenantId = "verify_tenant_" + Date.now();
    console.log(`- Tenant ID: ${tenantId}`);

    // Create Manager (Alice)
    const [alice] = await db.insert(hrPersons).values({
        tenantId,
        personNumber: `MGR-${Date.now()}`,
        firstName: "Alice",
        lastName: "Manager",
        email: "alice@test.com"
    }).returning();
    console.log(`- Created Manager: ${alice.firstName} (${alice.id})`);

    // Create Report (Bob)
    const [bob] = await db.insert(hrPersons).values({
        tenantId,
        personNumber: `EMP-${Date.now()}`,
        firstName: "Bob",
        lastName: "Worker",
        email: "bob@test.com"
    }).returning();
    console.log(`- Created Report: ${bob.firstName} (${bob.id})`);

    // Create Org (Legal Employer) - Required for Work Relationship
    const [org] = await db.insert(hrOrganizations).values({
        tenantId,
        name: "Test Org",
        classificationCode: "LEGAL_EMPLOYER",
        status: "A"
    }).returning();

    // Create Work Relationship for Bob
    const [wr] = await db.insert(hrWorkRelationships).values({
        tenantId,
        personId: bob.id,
        legalEmployerId: org.id,
        dateStart: new Date().toISOString(),
        workerType: "EMPLOYEE"
    }).returning();

    // Create Assignment linking Bob to Alice (Manager)
    await db.insert(hrAssignments).values({
        tenantId,
        workRelationshipId: wr.id,
        personId: bob.id,
        assignmentNumber: `EMP-${Date.now()}-1`,
        managerId: alice.id, // THE LINK
        effectiveStartDate: new Date().toISOString(),
        assignmentStatus: "ACTIVE"
    });
    console.log(`- Created Assignment: Bob reports to Alice`);

    // Create Course & Offering
    const [course] = await db.insert(hrmLearningCourses).values({
        tenantId,
        title: "Health & Safety 101",
        description: "Mandatory Safety Training",
        status: "ACTIVE"
    }).returning();

    const [offering] = await db.insert(hrmLearningOfferings).values({
        tenantId,
        courseId: course.id,
        title: "Q1 Session",
        startDate: new Date().toISOString()
    }).returning();
    console.log(`- Created Course: ${course.title}`);

    // 2. VERIFY TEAM FETCH
    console.log("\n🧪 Verifying Team Fetch...");
    const team = await ManagerLearningService.getTeamMembers(alice.id, tenantId);
    console.log("- Team Members Found:", team.length);

    if (team.length === 0 || team[0].personId !== bob.id) {
        console.error("❌ Failed: Bob not found in Alice's team.");
        process.exit(1);
    }
    console.log("✅ Team Fetch Successful.");

    // 3. VERIFY ASSIGNMENT
    console.log("\n🧪 Verifying Manager Assignment...");
    const enrollment = await ManagerLearningService.assignLearning(alice.id, {
        personId: bob.id,
        offeringId: offering.id,
        tenantId
    });
    console.log(`- Assigned Course. Enrollment ID: ${enrollment.id}`);

    // Check DB
    const [checkEnrollment] = await db.select().from(hrmLearningEnrollments).where(eq(hrmLearningEnrollments.id, enrollment.id));
    if (!checkEnrollment) {
        console.error("❌ Failed: Enrollment not found in DB.");
        process.exit(1);
    }
    console.log("✅ Assignment Verified.");

    console.log("\n🎉 ALL TESTS PASSED.");
    process.exit(0);
}

verifyManagerLearning().catch((err) => {
    console.error("❌ Unexpected Error:", err);
    process.exit(1);
});
