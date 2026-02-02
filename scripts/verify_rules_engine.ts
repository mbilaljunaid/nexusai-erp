
import { db } from "../server/db";
import { hrmTimeSheets, hrmTimeEntries, hrmShifts, hrmShiftAssignments, hrmLaborPolicies, hrmTimeViolations } from "../shared/schema/time_labor";
import { TimeLaborService } from "../server/services/TimeLaborService";
import { hrPersons } from "../shared/schema/hr_worker";
import { eq, and } from "drizzle-orm";

const DATE = "2026-03-01"; // Future date for clean test

async function main() {
    console.log("🚀 Starting Rules Engine Verification...");

    try {
        const tenantId = "test-tenant-wfm-001";

        // 1. Get Employee
        const [person] = await db.select().from(hrPersons).where(eq(hrPersons.tenantId, tenantId)).limit(1);
        if (!person) throw new Error("Need at least 1 employee.");
        console.log(`   > Testing with: ${person.firstName}`);

        // 2. Setup Policy (Grace 15m)
        // Cleanup first
        await db.delete(hrmLaborPolicies).where(eq(hrmLaborPolicies.tenantId, tenantId));
        await db.insert(hrmLaborPolicies).values({
            tenantId,
            name: "Test Policy",
            gracePeriodMinutes: 15
        });
        console.log("   > Policy Created: 15 min Grace");

        // 3. Setup Shift (09:00 - 17:00)
        // Ensure period exists
        const periods = await TimeLaborService.getOpenPeriods(tenantId);
        if (periods.length === 0) throw new Error("No open periods");
        const period = periods.find(p => DATE >= p.startDate && DATE <= p.endDate);
        if (!period) console.log("   ! Warning: Date might be outside open period, but logic might still work if periodId passed manually or found.");

        // Create Shift
        const [shift] = await db.insert(hrmShifts).values({
            tenantId,
            name: "Standard 9-5",
            code: "TEST-9-5",
            startTime: "09:00",
            endTime: "17:00",
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] // Simplify
        }).returning();

        // Assign Shift
        await db.insert(hrmShiftAssignments).values({
            tenantId,
            personId: person.id,
            shiftId: shift.id,
            date: DATE
        });
        console.log("   > Shift Assigned: 09:00 - 17:00");

        // 4. Log "Late" Entry (09:20)
        // LATE: 09:20 > 09:00 + 15m (09:15)

        // Ensure Timesheet
        const sheet = await TimeLaborService.getOrCreateTimesheet(tenantId, person.id, periods[0].id);

        console.log("   > Logging Late Entry (09:20)...");
        const entryCallback = await TimeLaborService.logTime({
            tenantId,
            timesheetId: sheet.id,
            date: DATE,
            startTime: `${DATE}T09:20:00`,
            endTime: `${DATE}T17:00:00`,
            durationMinutes: 460
        });

        // 5. Verify Violation
        console.log("   > Checking Violations...");
        const violations = await db.select().from(hrmTimeViolations).where(eq(hrmTimeViolations.entryId, entryCallback.id));

        if (violations.length > 0) {
            const v = violations[0];
            console.log(`✅ Violation Found: ${v.type} - ${v.message}`);
            if (v.type === "LATE_IN") {
                console.log("✅ Success: LATE_IN detected correctly.");
            } else {
                throw new Error(`Wrong Violation Type: ${v.type}`);
            }
        } else {
            console.log("❌ Failed: No violation detected.");
            throw new Error("Expected LATE_IN violation.");
        }

    } catch (error) {
        console.error("❌ Error During Verification:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();
