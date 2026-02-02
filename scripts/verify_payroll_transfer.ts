
import { db } from "../server/db";
import { hrmTimeSheets, hrmPayrollBatches, hrmTimePeriods } from "../shared/schema/time_labor";
import { TimeLaborService } from "../server/services/TimeLaborService";
import { eq, and } from "drizzle-orm";
import { hrPersons } from "../shared/schema/hr_worker";

const EMPLOYEE_NUMBER = "WFM-TEST-001";
const ADMIN_ID = "admin-user-001";

async function main() {
    console.log("🚀 Starting Payroll Integration Verification...");

    try {
        const tenantId = "test-tenant-wfm-001";

        // 1. Get Employee & Active Period
        const [person] = await db.select().from(hrPersons).where(eq(hrPersons.personNumber, EMPLOYEE_NUMBER));
        if (!person) throw new Error("Employee not found.");

        const periods = await TimeLaborService.getOpenPeriods(tenantId);
        if (periods.length === 0) throw new Error("No Open Periods.");
        const periodId = periods[0].id; // Use the first open period or specific one if we knew it

        // 2. ENSURE APPROVED TIMESHEET EXISTS
        // Only approved sheets get picked up.
        // We'll check if exists, if not, we warn or create mock.
        // Assuming previous step approved one, let's verify.
        let [sheet] = await db.select().from(hrmTimeSheets).where(and(
            eq(hrmTimeSheets.personId, person.id),
            eq(hrmTimeSheets.periodId, periodId)
        ));

        if (!sheet) {
            console.log("   > No sheet found, creating APPROVED dummy sheet...");
            // Mocking an approved sheet for test
            [sheet] = await db.insert(hrmTimeSheets).values({
                tenantId,
                periodId,
                personId: person.id,
                status: "APPROVED",
                totalHours: "40",
                totalOvertime: "2"
            }).returning();
        } else if (sheet.status !== "APPROVED" && sheet.status !== "TRANSFERRED") {
            // Force update to APPROVED for test
            console.log(`   > Forcing sheet ${sheet.id} to APPROVED...`);
            await db.update(hrmTimeSheets).set({ status: "APPROVED" }).where(eq(hrmTimeSheets.id, sheet.id));
        }

        if (sheet.status === "TRANSFERRED") {
            console.log("   > Valid Sheet already transferred. We might need another one or accept empty batch.");
        }

        // 3. RUN TRANSFER
        console.log("2. Running Transfer to Payroll...");
        const result = await TimeLaborService.transferToPayroll(tenantId, periodId, ADMIN_ID);

        if ('message' in result) {
            console.log(`   > Result: ${result.message}`);
        } else {
            console.log(`   > Batch Created: ${result.id}`);
            console.log(`   > Total Records: ${result.totalRecords}`);
            console.log(`   > Payload Payload: ${JSON.stringify(result.payload).substring(0, 100)}...`);
        }

        // 4. VERIFY BATCH HISTORY
        console.log("3. Verifying Batch History...");
        const batches = await TimeLaborService.getPayrollBatches(tenantId);
        if (batches.length > 0) {
            console.log(`✅ Success: Found ${batches.length} batches.`);
        } else {
            throw new Error("No batches found in history.");
        }

        // 5. VERIFY SHEET STATUS
        const [updatedSheet] = await db.select().from(hrmTimeSheets).where(eq(hrmTimeSheets.id, sheet.id));
        if (updatedSheet.status === "TRANSFERRED") {
            console.log(`✅ Success: Timesheet ${updatedSheet.id} status is TRANSFERRED.`);
        } else {
            // If we had a message above (empty), this might not change, but if we had records, it must change.
            if (!('message' in result)) {
                throw new Error(`Timesheet status failed to update. Status: ${updatedSheet.status}`);
            }
        }

    } catch (error) {
        console.error("❌ Error During Verification:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();
