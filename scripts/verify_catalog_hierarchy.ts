
import { db } from "@db";
import { sql, eq } from "drizzle-orm";
import { hrmLearningCommunities, hrmLearningCourses } from "@shared/schema/talent_learning";

async function verifyCatalogHierarchy() {
    console.log("🚦 Starting Catalog Hierarchy Verification...");
    const tenantId = "verify_hierarchy_" + Date.now();

    const { CommunityService } = await import("../server/services/CommunityService");

    // 1. Create Root: "IT Department"
    const root = await CommunityService.createCommunity({
        tenantId,
        title: "IT Department",
        description: "Technology catalog"
    });
    console.log(`  - Created Root: ${root.title} (${root.id})`);

    // 2. Create Child: "Software Engineering" (Parent = IT)
    const child = await CommunityService.createCommunity({
        tenantId,
        title: "Software Engineering",
        parentId: root.id
    });
    console.log(`  - Created Child: ${child.title} (Path: ${child.path})`);
    if (!child.path?.includes(root.id)) throw new Error("Hierarchy Path failed!");

    // 3. Create Grandchild: "Frontend"
    const grandchild = await CommunityService.createCommunity({
        tenantId,
        title: "Frontend",
        parentId: child.id
    });
    console.log(`  - Created Grandchild: ${grandchild.title} (Path: ${grandchild.path})`);

    // 4. Assign Course to Grandchild
    const [course] = await db.insert(hrmLearningCourses).values({
        tenantId,
        title: "React Masterclass",
        communityId: grandchild.id
    }).returning();
    console.log(`  - Linked Course '${course.title}' to Community '${grandchild.title}'`);

    // 5. Verify Children Fetch
    const result = await CommunityService.getChildren(grandchild.id);
    if (result.courses.length === 1 && result.courses[0].id === course.id) {
        console.log("✅ Course correctly retrieved via hierarchy.");
    } else {
        throw new Error("Course retrieval via community failed!");
    }

    // 6. Verify Breadcrumbs
    const bc = await CommunityService.getBreadcrumbs(grandchild.id);
    console.log(`  - Breadcrumbs: ${bc.map(b => b.title).join(" > ")}`);
    if (bc.length === 3 && bc[0].title === "IT Department" && bc[2].title === "Frontend") {
        console.log("✅ Breadcrumbs verified.");
    } else {
        throw new Error("Breadcrumb generation failed!");
    }

    console.log("🎉 CATALOG HIERARCHY VERIFIED.");
    process.exit(0);
}

verifyCatalogHierarchy().catch((err) => {
    console.error("❌ Unexpected Error:", err);
    process.exit(1);
});
