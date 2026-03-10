
import { db } from "@db";
import { sql, eq } from "drizzle-orm";
import { hrmLearningCourses, hrmLearningCurricula, hrmLearningCurriculumMembers } from "@shared/schema/talent_learning";

async function verifyLearningPaths() {
    console.log("🚦 Starting Learning Paths Verification...");
    const tenantId = "verify_path_" + Date.now();

    // 1. Setup: Create 2 Courses
    const [c1] = await db.insert(hrmLearningCourses).values({
        tenantId, title: "Course A (Intro)", category: "Test", provider: "Internal"
    }).returning();
    const [c2] = await db.insert(hrmLearningCourses).values({
        tenantId, title: "Course B (Advanced)", category: "Test", provider: "Internal"
    }).returning();
    console.log(`  - Created Courses to Bundle: ${c1.id}, ${c2.id}`);

    // 2. Create Curriculum
    const [path] = await db.insert(hrmLearningCurricula).values({
        tenantId,
        title: "Full Stack Developer Path",
        description: "Zero to Hero"
    }).returning();
    console.log(`  - Created Curriculum: ${path.id} (${path.title})`);

    // 3. Add Courses to Path
    await db.insert(hrmLearningCurriculumMembers).values([
        { tenantId, curriculumId: path.id, courseId: c1.id, sequenceOrder: 1 },
        { tenantId, curriculumId: path.id, courseId: c2.id, sequenceOrder: 2 }
    ]);
    console.log("  - Added courses to curriculum.");

    // 4. Verify Retrieval (Simulating Service.getCurriculumDetails)
    const members = await db.select({
        title: hrmLearningCourses.title,
        seq: hrmLearningCurriculumMembers.sequenceOrder
    })
        .from(hrmLearningCurriculumMembers)
        .innerJoin(hrmLearningCourses, eq(hrmLearningCurriculumMembers.courseId, hrmLearningCourses.id))
        .where(eq(hrmLearningCurriculumMembers.curriculumId, path.id));

    if (members.length === 2 && members[0].title.includes("Course A") || members[1].title.includes("Course A")) {
        console.log("✅ Verified: Curriculum contains correct courses.");
    } else {
        console.error("❌ Verification Failed: Members not found or incorrect.");
        console.log(members);
        process.exit(1);
    }

    console.log("🎉 LEARNING PATHS VERIFIED.");
    process.exit(0);
}

verifyLearningPaths().catch((err) => {
    console.error("❌ Unexpected Error:", err);
    process.exit(1);
});
