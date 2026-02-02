
import { db } from "@db";
import { sql, eq } from "drizzle-orm";
import { hrmLearningCourses, hrmLearningOfferings, hrmLearningEnrollments } from "@shared/schema/talent_learning";
import { approvalRequests } from "@shared/schema/crm";
import { hrPersons } from "@shared/schema/hr_worker";
import { LearningWorkflowService } from "../server/services/LearningWorkflowService";

async function verifyLearningWorkflow() {
    console.log("🚦 Starting Learning Workflow Verification...");
    const tenantId = "verify_workflow_" + Date.now();
    const requesterId = `user-${Date.now()}`;
    const approverId = `manager-${Date.now()}`;

    // 1. SETUP DATA (Paid Course)
    console.log("  - Creating Paid Offering...");

    // Person
    const [person] = await db.insert(hrPersons).values({
        tenantId,
        personNumber: `USR-${Date.now()}`,
        firstName: "Workflow",
        lastName: "Tester",
        email: `workflow${Date.now()}@test.com`
    }).returning();

    const [course] = await db.insert(hrmLearningCourses).values({
        tenantId,
        title: "Advanced Paid Course",
        category: "Technical"
    }).returning();

    const [offering] = await db.insert(hrmLearningOfferings).values({
        tenantId,
        courseId: course.id,
        title: "Premium Session",
        price: "500.00",
        currency: "USD"
    }).returning();

    console.log(`  - Offering Created: ${offering.price} ${offering.currency}`);

    // 2. ENROLL (Simulate Pending Approval state)
    // In real app, UI does this. Here we verify Service logic.

    console.log("\n🚀 Requesting Approval...");
    const [enrollment] = await db.insert(hrmLearningEnrollments).values({
        tenantId,
        offeringId: offering.id,
        personId: person.id,
        status: "PENDING_APPROVAL", // UI sets this for paid courses
        progressPercent: 0
    }).returning();

    // Trigger Workflow Service
    const request = await LearningWorkflowService.requestApproval(enrollment.id, requesterId, tenantId);
    console.log(`  - Approval Request Created: ${request.id} (Status: ${request.status})`);

    if (request.status === "Pending") {
        console.log("✅ Request Service Verified.");
    } else {
        console.error("❌ Request Creation Failed.");
        process.exit(1);
    }

    // 3. APPROVE
    console.log("\n✅ Manager Approving...");
    const updatedRequest = await LearningWorkflowService.decideRequest(request.id, approverId, "APPROVE", "Looks good!", tenantId);

    console.log(`  - Request Status: ${updatedRequest.status}`);

    // 4. VERIFY ENROLLMENT STATUS
    const [finalEnrollment] = await db.select().from(hrmLearningEnrollments).where(eq(hrmLearningEnrollments.id, enrollment.id));
    console.log(`  - Enrollment Status: ${finalEnrollment.status}`);

    if (updatedRequest.status === "Approved" && finalEnrollment.status === "ENROLLED") {
        console.log("✅ Approval Logic Verified.");
    } else {
        console.error("❌ Approval Logic Failed.");
        process.exit(1);
    }

    console.log("\n🎉 ALL TESTS PASSED.");
    process.exit(0);
}

verifyLearningWorkflow().catch((err) => {
    console.error("❌ Unexpected Error:", err);
    process.exit(1);
});
