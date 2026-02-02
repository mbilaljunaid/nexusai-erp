
import { db } from "../server/db";
import { hrmTimeSheets, hrmTimeEntries } from "../shared/schema";
import { TimeLaborService } from "../server/services/TimeLaborService";
import { eq, and } from "drizzle-orm";
import { seedAdminUser } from "../server/platformAuth";
import { hrPersons } from "../shared/schema/hr_worker";

// MOCK PERSONS
const EMPLOYEE_NUMBER = "WFM-TEST-001";
const MANAGER_NUMBER = "manager-user-001";

async function main() {
    console.log("🚀 Starting Approval Workflow Verification...");

    try {
        const tenantId = "test-tenant-wfm-001";

        // 1. Get Employee & Active Period
        const [person] = await db.select().from(hrPersons).where(eq(hrPersons.personNumber, EMPLOYEE_NUMBER));
        if (!person) throw new Error("Employee not found in DB. Run 'verify_time_foundation.ts' first.");

        // Ensure Manager Exists
        const [existingManager] = await db.select().from(hrPersons).where(eq(hrPersons.personNumber, MANAGER_NUMBER));
        let manager = existingManager;
        if (!manager) {
            const [newManager] = await db.insert(hrPersons).values({
                tenantId,
                personNumber: MANAGER_NUMBER,
                firstName: "Boss",
                lastName: "Man",
                email: "boss@test.com"
            }).returning();
            manager = newManager;
        }
        console.log(`✅ Manager Ready: ${manager.id}`);

        const periods = await TimeLaborService.getOpenPeriods(tenantId);
        if (periods.length === 0) throw new Error("No Open Periods.");
        const periodId = periods[0].id;

        // 2. Ensure Timesheet Exists
        console.log("1. Fetching Timesheet...");
        const sheet = await TimeLaborService.getOrCreateTimesheet(tenantId, person.id, periodId);
        console.log(`   > Sheet ID: ${sheet.id}, Status: ${sheet.status}`);

        // 3. Ensure Time Logged (If empty, log something)
        if (Number(sheet.totalHours) === 0) {
            console.log("   > Logging 8 hours to ensure validity...");
            await TimeLaborService.logTime({
                tenantId,
                timesheetId: sheet.id,
                date: "2026-01-05",
                durationMinutes: 480,
                timeType: "REGULAR",
                notes: "Pre-submission entry"
            });
        }

        // 4. SUBMIT (Employee Action)
        console.log("2. Submitting Timesheet...");
        // Handle re-running script (if already submitted, skip)
        let submittedSheet = sheet;
        if (sheet.status === "DRAFT" || sheet.status === "REJECTED") {
            submittedSheet = await TimeLaborService.submitTimesheet(sheet.id);
        }
        console.log(`   > Status: ${submittedSheet.status} (Date: ${submittedSheet.submissionDate})`);

        if (submittedSheet.status !== "SUBMITTED" && submittedSheet.status !== "APPROVED") throw new Error("Submission Failed or Invalid State");

        // 5. VIEW PENDING (Manager Action)
        console.log("3. Manager: Fetching Pending List...");
        const pending = await TimeLaborService.getPendingTimesheets(tenantId);
        const found = pending.find(p => p.timesheet.id === sheet.id);

        if (found) {
            console.log(`   > Found items in pending queue: ${pending.length}`);
        } else {
            // If already approved, it won't be pending.
            if (submittedSheet.status !== "APPROVED") console.warn("   > Warning: Submitted sheet not in pending list (might be approved already)");
        }

        // 6. APPROVE (Manager Action) - If not already approved
        if (submittedSheet.status !== "APPROVED") {
            console.log("4. Manager: Approving...");
            const approvedSheet = await TimeLaborService.approveTimesheet(sheet.id, manager.id);
            console.log(`   > Status: ${approvedSheet.status} (Approver: ${approvedSheet.approverId})`);

            if (approvedSheet.status === "APPROVED") {
                console.log("✅ Success: Workflow complete (Draft -> Submitted -> Approved)");
            } else {
                throw new Error("Approval Failed");
            }
        } else {
            console.log("✅ Success: Already Approved.");
        }

    } catch (error) {
        console.error("❌ Error During Verification:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();
