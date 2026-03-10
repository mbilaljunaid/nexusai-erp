
import { db } from "@db";
import { sql } from "drizzle-orm";
import { hrmLearningCourses } from "@shared/schema/talent_learning";

async function verifyLmsScale() {
    console.log("🚦 Starting LMS Scale Verification...");
    const tenantId = "verify_scale_" + Date.now();

    // 1. SEED DATA (15 Courses)
    console.log("  - Seeding 15 Courses...");
    const coursesToInsert = Array.from({ length: 15 }).map((_, i) => ({
        tenantId,
        title: `Scale Test Course ${i + 1}`,
        category: "Test",
        provider: "Internal",
        durationMinutes: 60
    }));

    await db.insert(hrmLearningCourses).values(coursesToInsert);
    console.log("  - Seed Complete.");

    // 2. VERIFY PAGINATION (Page 1)
    console.log("\n🚀 Testing Page 1 (Limit 10)...");
    const { LearningService } = await import("../server/services/LearningService"); // Dynamic import to use Service

    const page1 = await LearningService.searchCatalog(tenantId, { page: 1, pageSize: 10 });
    console.log(`  - Page 1 Count: ${page1.data.length}`);
    console.log(`  - Total Items: ${page1.total}`);

    if (page1.data.length === 10 && page1.total === 15) {
        console.log("✅ Page 1 Verified.");
    } else {
        console.error(`❌ Page 1 Failed. Got ${page1.data.length} items, total ${page1.total}`);
        process.exit(1);
    }

    // 3. VERIFY PAGINATION (Page 2)
    console.log("\n🚀 Testing Page 2 (Limit 10)...");
    const page2 = await LearningService.searchCatalog(tenantId, { page: 2, pageSize: 10 });
    console.log(`  - Page 2 Count: ${page2.data.length}`);

    if (page2.data.length === 5) {
        console.log("✅ Page 2 Verified.");
    } else {
        console.error(`❌ Page 2 Failed. Got ${page2.data.length} items.`);
        process.exit(1);
    }

    console.log("\n🎉 SCALABILITY CHECKS PASSED.");
    process.exit(0);
}

verifyLmsScale().catch((err) => {
    console.error("❌ Unexpected Error:", err);
    process.exit(1);
});
