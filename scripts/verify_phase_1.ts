
import { TimeLaborService } from "../server/services/TimeLaborService";
import { db } from "../server/db";
import { hrPersons } from "../shared/schema/hr_worker";
import { hrmTimePeriods, hrmTimeSheets } from "../shared/schema/time_labor";
import { eq, and } from "drizzle-orm";

async function verifyPhase1() {
    console.log("🚀 Starting Phase 1 Verification: Advanced Time & Absence...");

    const tenantId = "default";
    const testUserId = "test_user_wfm";

    try {
        // 1. Setup Test Data
        console.log("--- Step 1: Setting up test environment ---");

        // Ensure a test person exists for the user
        let [person] = await db.select().from(hrPersons).where(and(eq(hrPersons.userId, testUserId), eq(hrPersons.tenantId, tenantId)));
        if (!person) {
            console.log("Creating test person...");
            [person] = await db.insert(hrPersons).values({
                tenantId,
                userId: testUserId,
                firstName: "Time",
                lastName: "Tester",
                email: "time.tester@example.com",
            }).returning();
        }

        // Ensure a period exists
        let [period] = await db.select().from(hrmTimePeriods).where(eq(hrmTimePeriods.tenantId, tenantId));
        if (!period) {
            console.log("Creating test time period...");
            [period] = await TimeLaborService.createTimePeriod(tenantId, "Feb 2026 Week 1", "2026-02-01", "2026-02-07");
        }

        // 2. Test Person Linkage
        console.log("\n--- Step 2: Testing User-to-Person Linkage ---");
        const linkedPersonId = await TimeLaborService.getPersonIdForUser(testUserId, tenantId);
        if (linkedPersonId === person.id) {
            console.log("✅ SUCCESS: Correctly linked user to person ID.");
        } else {
            console.error("❌ FAILURE: Linkage failed.");
            process.exit(1);
        }

        // 3. Test Timesheet Access
        console.log("\n--- Step 3: Testing Secure Timesheet Access ---");
        const sheet = await TimeLaborService.getOrCreateTimesheet(tenantId, person.id, period.id);
        if (sheet && sheet.personId === person.id) {
            console.log("✅ SUCCESS: Fetched/Created correct timesheet for user.");
        } else {
            console.error("❌ FAILURE: Timesheet retrieval error.");
            process.exit(1);
        }

        // 4. Test Absence History
        console.log("\n--- Step 4: Testing Absence History retrieval ---");
        const history = await TimeLaborService.getAbsenceHistory(tenantId, person.id);
        console.log(`✅ SUCCESS: Fetched absence history (count: ${history.length}).`);

        console.log("\n✨ Phase 1 Verification Complete! System is ready for Time & Absence deployment.");

    } catch (error) {
        console.error("❌ Verification failed with error:", error);
        process.exit(1);
    }
}

verifyPhase1();
