
import { db } from "../server/db";
import { hrmTimePeriods, hrmTimeSheets, hrmTimeEntries } from "../shared/schema";
import { TimeLaborService } from "../server/services/TimeLaborService";
import { eq, and } from "drizzle-orm";
import { seedAdminUser } from "../server/platformAuth";
import { hrPersons } from "../shared/schema/hr_worker";

// MOCK USER ID from UI
const MOCK_PERSON_NUMBER = "WFM-TEST-001";

async function main() {
    console.log("🚀 Starting UI Flow Verification (Backend Simulation)...");

    try {
        const tenantId = "test-tenant-wfm-001";

        // 1. Get Person
        const [person] = await db.select().from(hrPersons).where(eq(hrPersons.personNumber, MOCK_PERSON_NUMBER));
        if (!person) throw new Error("Test Person not found. Run verify_time_foundation.ts first.");
        console.log(`✅ Person Found: ${person.id}`);

        // 2. UI Action: Load Periods
        console.log("1. UI: Fetching Periods...");
        const periods = await TimeLaborService.getOpenPeriods(tenantId);
        if (periods.length === 0) throw new Error("No Open Periods found.");
        const activePeriod = periods[0];
        console.log(`✅ Active Period Loaded: ${activePeriod.name} (${activePeriod.id})`);

        // 3. UI Action: Load Timesheet
        console.log("2. UI: Fetching/Creating Timesheet...");
        /* 
           The UI calls `getOrCreateTimesheet` via API.
           We simulate the service call here.
        */
        const sheet = await TimeLaborService.getOrCreateTimesheet(tenantId, person.id, activePeriod.id);
        console.log(`✅ Timesheet Loaded: ${sheet.id} (Status: ${sheet.status})`);

        // 4. UI Action: User Enters Time (e.g., Tue 4 hours OT)
        console.log("3. UI: User Saves Entry (Tue 4h OT)...");
        const testDate = "2026-01-03"; // Sat? No, specific date inside period window.
        // Period was Jan 1 - Jan 7. Jan 3 is Sat.

        const entry = await TimeLaborService.logTime({
            tenantId,
            timesheetId: sheet.id,
            date: testDate,
            durationMinutes: 240, // 4 hours
            timeType: "OVERTIME",
            notes: "UI Test Entry"
        });
        console.log(`✅ Entry Saved: ${entry.id}`);

        // 5. Verify Totals Updated
        const updatedSheet = await TimeLaborService.getTimesheet(sheet.id);
        console.log(`4. Verifying Updates...`);
        console.log(`   > Total Hours: ${updatedSheet.totalHours}`);
        console.log(`   > Overtime: ${updatedSheet.totalOvertime}`);

        // Expect previous 8 hours + new 4 hours = 12 hours?
        // Or just check that it updated.
        if (Number(updatedSheet.totalOvertime) >= 4.0) {
            console.log("✅ Success: Overtime reflected in totals.");
        } else {
            console.error("❌ Failed: Overtime not updated.");
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Error During Verification:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();
