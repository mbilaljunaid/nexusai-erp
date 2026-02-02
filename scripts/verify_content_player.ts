
import { db } from "@db";
import { sql, eq } from "drizzle-orm";
import { hrmLearningCourses, hrmLearningOfferings, hrmLearningEnrollments } from "@shared/schema/talent_learning";
import { hrPersons } from "@shared/schema/hr_worker";
import { ContentDeliveryService } from "../server/services/ContentDeliveryService";

async function verifyContentPlayer() {
    console.log("🚦 Starting Content Player Verification...");
    const tenantId = "verify_player_" + Date.now();

    // 1. SETUP DATA
    console.log("  - Creating Test Data...");
    const [person] = await db.insert(hrPersons).values({
        tenantId,
        personNumber: `USR-${Date.now()}`,
        firstName: "Player",
        lastName: "Tester",
        email: `player${Date.now()}@test.com`
    }).returning();

    const [course] = await db.insert(hrmLearningCourses).values({
        tenantId,
        title: "Video Course 101",
        category: "Technical"
    }).returning();

    const [offering] = await db.insert(hrmLearningOfferings).values({
        tenantId,
        courseId: course.id,
        title: "Offering 1"
    }).returning();

    const [enrollment] = await db.insert(hrmLearningEnrollments).values({
        tenantId,
        offeringId: offering.id,
        personId: person.id,
        status: "ENROLLED",
        progressPercent: 0
    }).returning();

    // 2. TEST LAUNCH
    console.log("\n🚀 Testing Content Launch...");
    const launchData = await ContentDeliveryService.getLaunchData(enrollment.id, tenantId, person.id);
    console.log(`  - Launch URL: ${launchData.contentUrl}`);
    console.log(`  - Token: ${launchData.trackingToken}`);

    if (launchData.contentUrl && launchData.enrollmentId === enrollment.id) {
        console.log("✅ Launch Data Verified.");
    } else {
        console.error("❌ Invalid Launch Data.");
        process.exit(1);
    }

    // 3. TEST PROGRESS TRACKING
    console.log("\n📈 Testing Progress Tracking...");
    await ContentDeliveryService.trackProgress(enrollment.id, {
        status: "IN_PROGRESS",
        timeSpentSeconds: 120
    });

    // Verify DB update
    const [updated] = await db.select().from(hrmLearningEnrollments).where(eq(hrmLearningEnrollments.id, enrollment.id));
    console.log(`  - Status: ${updated.status}`);
    console.log(`  - Progress: ${updated.progressPercent}%`);

    if (updated.status === "IN_PROGRESS" && updated.progressPercent === 50) {
        console.log("✅ Progress Update Verified.");
    } else {
        console.error("❌ Progress Update Failed.");
        process.exit(1);
    }

    // 4. TEST COMPLETION
    console.log("\n🏁 Testing Completion...");
    await ContentDeliveryService.trackProgress(enrollment.id, {
        status: "COMPLETED",
        score: 100
    });

    const [completed] = await db.select().from(hrmLearningEnrollments).where(eq(hrmLearningEnrollments.id, enrollment.id));
    console.log(`  - Status: ${completed.status}`);
    console.log(`  - Completion Date: ${completed.completionDate}`);

    if (completed.status === "COMPLETED" && completed.completionDate) {
        console.log("✅ Completion Verified.");
    } else {
        console.error("❌ Completion Logic Failed.");
        process.exit(1);
    }

    console.log("\n🎉 ALL TESTS PASSED.");
    process.exit(0);
}

verifyContentPlayer().catch((err) => {
    console.error("❌ Unexpected Error:", err);
    process.exit(1);
});
