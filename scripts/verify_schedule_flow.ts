
import { db } from "../server/db";
import { hrmShifts, hrmShiftAssignments } from "../shared/schema/time_labor";
import { TimeLaborService } from "../server/services/TimeLaborService";
import { eq, and } from "drizzle-orm";
import { hrPersons } from "../shared/schema/hr_worker";

const EMPLOYEE_NUMBER = "WFM-TEST-001";

async function main() {
    console.log("🚀 Starting Schedule Management Verification...");

    try {
        const tenantId = "test-tenant-wfm-001";

        // 1. Ensure Employee Exists
        const [person] = await db.select().from(hrPersons).where(eq(hrPersons.personNumber, EMPLOYEE_NUMBER));
        if (!person) throw new Error("Employee not found in DB. Run 'verify_time_foundation.ts' first.");

        // 2. CREATE SHIFT (Admin)
        console.log("1. Creating Shift Definition...");
        const shiftData = {
            code: "N1",
            name: "Night Shift",
            startTime: "18:00",
            endTime: "02:00",
            color: "#4f46e5"
        };

        // Check if exists
        const existingShifts = await TimeLaborService.getShifts(tenantId);
        let shift = existingShifts.find(s => s.code === shiftData.code);

        if (!shift) {
            shift = await TimeLaborService.createShift(tenantId, shiftData);
            console.log(`   > Created Shift: ${shift.name} (${shift.id})`);
        } else {
            console.log(`   > Shift exists: ${shift.name}`);
        }

        // 3. ASSIGN SHIFT (Manager)
        const targetDate = "2026-02-10"; // Future date
        console.log(`2. Assigning Shift for ${targetDate}...`);

        const assignment = await TimeLaborService.assignShift(tenantId, person.id, shift!.id, targetDate);
        console.log(`   > Assignment ID: ${assignment.id}, Published: ${assignment.isPublished}`);

        // 4. VERIFY SCHEDULE (Team View)
        console.log("3. Verifying Team Schedule...");
        const teamSchedule = await TimeLaborService.getTeamSchedule(tenantId);
        const found = teamSchedule.find(s => s.assignment.id === assignment.id);

        if (found) {
            console.log(`✅ Success: Found assignment for ${found.person.firstName} on ${found.assignment.date} (${found.shift.code})`);
        } else {
            throw new Error("Assignment not found in Team Schedule");
        }

    } catch (error) {
        console.error("❌ Error During Verification:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();
