
import { db } from "@db";
import { sql, eq, desc } from "drizzle-orm";
import { hrmLearningCourses, hrmLearningOfferings, hrmLearningEnrollments, hrmLearningAuditLogs } from "@shared/schema/talent_learning";
import { hrPersons } from "@shared/schema/hr_worker";
import { RecertificationService } from "../server/services/RecertificationService";

async function verifyDeepCompliance() {
    console.log("🚦 Starting Deep Compliance Verification...");
    const tenantId = "verify_compliance_" + Date.now();

    // 1. SETUP DATA
    console.log("  - Creating Test Data...");

    // Person
    const [person] = await db.insert(hrPersons).values({
        tenantId,
        personNumber: `USR-${Date.now()}`,
        firstName: "Compliant",
        lastName: "User",
        email: `compliant${Date.now()}@test.com`
    }).returning();

    // Course with Validity (e.g., 1 Month for easy testing, but we mock dates anyway)
    const [course] = await db.insert(hrmLearningCourses).values({
        tenantId,
        title: "Safety 101",
        category: "Compliance",
        validityMonths: 12 // Valid for 1 year
    }).returning();

    const [offering] = await db.insert(hrmLearningOfferings).values({
        tenantId,
        courseId: course.id,
        title: "Offering 2024"
    }).returning();

    // Create EXPIRED Enrollment (Completed 13 months ago)
    const expiredDate = new Date();
    expiredDate.setMonth(expiredDate.getMonth() - 13);

    await db.insert(hrmLearningEnrollments).values({
        tenantId,
        offeringId: offering.id,
        personId: person.id,
        status: "COMPLETED",
        progressPercent: 100,
        completionDate: sql`${expiredDate.toISOString().split('T')[0]}::date`
    });

    console.log("  - Mocked expired enrollment created.");

    // 2. RUN JOB (Check Expirations)
    console.log("\n⚙️  Running Recertification Job...");
    const result = await RecertificationService.checkExpirations(tenantId);
    console.log(`  - Processed: ${result.processed}`);

    if (result.processed !== 1) {
        console.error("❌ Recertification Job Failed to identify 1 expired record.");
        process.exit(1);
    }

    // 3. VERIFY RENEWAL
    console.log("\n🔎 Verifying Auto-Renewal...");
    const enrollments = await db.select().from(hrmLearningEnrollments)
        .where(eq(hrmLearningEnrollments.personId, person.id))
        .orderBy(desc(hrmLearningEnrollments.createdAt));

    console.log(`  - Total Enrollments: ${enrollments.length}`);
    const latest = enrollments[0]; // Should be the new one

    if (enrollments.length === 2 && latest.status === "ENROLLED") {
        console.log("✅ Auto-Renewal Enrollment Created.");
    } else {
        console.error("❌ Auto-Renewal Enrollment Failed.");
        process.exit(1);
    }

    // 4. VERIFY AUDIT LOG
    console.log("\n📝 Verifying Audit Log...");
    const logs = await db.select().from(hrmLearningAuditLogs)
        .where(eq(hrmLearningAuditLogs.tenantId, tenantId))
        .orderBy(desc(hrmLearningAuditLogs.createdAt));

    console.log(`  - Latest Log Action: ${logs[0]?.action}`);

    if (logs.length > 0 && logs[0].action === "AUTO_RENEWAL") {
        console.log("✅ Audit Log Entry Verified.");
    } else {
        console.error("❌ Audit Log Missing.");
        process.exit(1);
    }

    console.log("\n🎉 ALL TESTS PASSED.");
    process.exit(0);
}

verifyDeepCompliance().catch((err) => {
    console.error("❌ Unexpected Error:", err);
    process.exit(1);
});
