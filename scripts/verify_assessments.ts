
import { db } from "@db";
import { sql, eq } from "drizzle-orm";
import { hrmLearningAssessments, hrmLearningAssessmentQuestions, hrmLearningAssessmentAttempts, hrmLearningEnrollments, hrmLearningCourses, hrmLearningOfferings } from "@shared/schema/talent_learning";
import { hrPersons } from "@shared/schema/hr_worker";

async function verifyAssessments() {
    console.log("🚦 Starting Assessment Engine Verification...");
    const tenantId = "verify_quiz_" + Date.now();
    const personId = "user_" + Date.now();

    // 1. Setup: Person, Course, Offering, Enrollment
    const [person] = await db.insert(hrPersons).values({
        id: personId,
        tenantId,
        personNumber: "PN" + Date.now(), // Fixed: Required field
        firstName: "Quiz",
        lastName: "Taker",
        email: `qt_${Date.now()}@test.com`
    }).returning();
    const [course] = await db.insert(hrmLearningCourses).values({ tenantId, title: "Quiz 101" }).returning();
    const [offering] = await db.insert(hrmLearningOfferings).values({ tenantId, courseId: course.id, title: "Q1" }).returning();
    const [enrollment] = await db.insert(hrmLearningEnrollments).values({ tenantId, personId: person.id, offeringId: offering.id, status: "ENROLLED" }).returning();

    console.log(`  - Setup Complete. Enrollment: ${enrollment.id}`);

    // 2. Create Assessment (Passing Score = 20)
    const [assessment] = await db.insert(hrmLearningAssessments).values({
        tenantId,
        title: "Final Exam",
        passingScore: 20
    }).returning();
    console.log(`  - Created Assessment: ${assessment.id}`);

    // 3. Add Questions (10 pts each)
    const [q1] = await db.insert(hrmLearningAssessmentQuestions).values({
        tenantId, assessmentId: assessment.id, text: "Sky color?", type: "MULTIPLE_CHOICE", options: { a: "Blue", b: "Green" }, correctAnswer: "Blue", points: 10
    }).returning();
    const [q2] = await db.insert(hrmLearningAssessmentQuestions).values({
        tenantId, assessmentId: assessment.id, text: "2+2?", type: "MULTIPLE_CHOICE", options: { a: "3", b: "4" }, correctAnswer: "4", points: 10
    }).returning();
    console.log("  - Added 2 Questions (20 pts total).");

    // 4. Submit Failing Attempt (10/20)
    const { AssessmentService } = await import("../server/services/AssessmentService"); // Dynamic import

    const failAttempt = await AssessmentService.submitAttempt(tenantId, enrollment.id, assessment.id, {
        [q1.id]: "Blue",  // Correct
        [q2.id]: "3"      // Incorrect
    });
    console.log(`  - Attempt 1 Score: ${failAttempt.score}. Passed: ${failAttempt.passed}`);
    if (failAttempt.passed) throw new Error("Should have failed!");

    // 5. Submit Passing Attempt (20/20)
    const passAttempt = await AssessmentService.submitAttempt(tenantId, enrollment.id, assessment.id, {
        [q1.id]: "Blue",
        [q2.id]: "4"
    });
    console.log(`  - Attempt 2 Score: ${passAttempt.score}. Passed: ${passAttempt.passed}`);
    if (!passAttempt.passed) throw new Error("Should have passed!");

    // 6. Verify Enrollment Completion
    const updatedEnrollment = await db.query.hrmLearningEnrollments.findFirst({
        where: eq(hrmLearningEnrollments.id, enrollment.id)
    });
    if (updatedEnrollment?.status === "COMPLETED" && updatedEnrollment.score === 20) {
        console.log("✅ Enrollment marked COMPLETED automatically.");
    } else {
        throw new Error("Enrollment status update failed.");
    }

    console.log("🎉 ASSESSMENT ENGINE VERIFIED.");
    process.exit(0);
}

verifyAssessments().catch((err) => {
    console.error("❌ Unexpected Error:", err);
    process.exit(1);
});
