
import { ManagerAnalyticsService } from "../server/services/ManagerAnalyticsService";
import { db } from "../server/db";
import { hrPersons, hrAssignments } from "../shared/schema/hr_worker";
import { eq, and } from "drizzle-orm";

async function verifyPhase2() {
    console.log("🚀 Starting Phase 2 Verification: Manager Decision Support...");

    const tenantId = "default";
    const testManagerId = "test_manager_mss";
    const testDirectId = "test_direct_p1";

    try {
        // 1. Setup Test Hierarchy
        console.log("--- Step 1: Setting up team hierarchy ---");

        // Ensure manager person exists
        let [manager] = await db.select().from(hrPersons).where(and(eq(hrPersons.userId, testManagerId), eq(hrPersons.tenantId, tenantId)));
        if (!manager) {
            console.log("Creating test manager...");
            [manager] = await db.insert(hrPersons).values({
                tenantId,
                userId: testManagerId,
                firstName: "Manager",
                lastName: "User",
                email: "manager@example.com",
            }).returning();
        }

        // Ensure direct report exists
        let [direct] = await db.select().from(hrPersons).where(and(eq(hrPersons.userId, testDirectId), eq(hrPersons.tenantId, tenantId)));
        if (!direct) {
            console.log("Creating test direct report...");
            [direct] = await db.insert(hrPersons).values({
                tenantId,
                userId: testDirectId,
                firstName: "Direct",
                lastName: "Report",
                email: "direct@example.com",
            }).returning();
        }

        // Ensure assignment exists linking them
        let [assignment] = await db.select().from(hrAssignments).where(and(eq(hrAssignments.personId, direct.id), eq(hrAssignments.managerId, manager.id)));
        if (!assignment) {
            console.log("Linking direct to manager...");
            await db.insert(hrAssignments).values({
                tenantId,
                personId: direct.id,
                managerId: manager.id,
                assignmentNumber: "E10001",
                assignmentStatus: "ACTIVE",
                primaryFlag: true
            });
        }

        // 2. Test Team Metrics
        console.log("\n--- Step 2: Testing Team Metrics Calculation ---");
        const metrics = await ManagerAnalyticsService.getTeamMetrics(manager.id, tenantId);
        if (metrics && metrics.headCount >= 1) {
            console.log(`✅ SUCCESS: Correctly calculated headcount (${metrics.headCount}).`);
            console.log(`   Metrics: Performance Avg: ${metrics.averageRating}, Risk: ${metrics.attritionRisk}`);
        } else {
            console.error("❌ FAILURE: Headcount calculation error.");
            process.exit(1);
        }

        // 3. Test Skill Gaps
        console.log("\n--- Step 3: Testing Skill Gaps retrieval ---");
        const gaps = await ManagerAnalyticsService.getSkillGaps(manager.id, tenantId);
        if (gaps && gaps.length > 0) {
            console.log(`✅ SUCCESS: Fetched ${gaps.length} capability gaps.`);
        } else {
            console.error("❌ FAILURE: Skill gaps retrieval error.");
            process.exit(1);
        }

        console.log("\n✨ Phase 2 Verification Complete! MSS Analytics are fully operational.");

    } catch (error) {
        console.error("❌ Verification failed with error:", error);
        process.exit(1);
    }
}

verifyPhase2();
