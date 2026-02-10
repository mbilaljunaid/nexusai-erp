import { db } from "../server/db";
import { wfmTimePeriods, wfmTimesheets, wfmTimeEntries, wfmLeaveBalances } from "@shared/schema/wfm";
import { TimeLaborService } from "../server/services/TimeLaborService";

const TENANT_ID = "test-tenant-wfm-001";
const TEST_PERSON_ID = "3ebd9ddb-1566-418d-a0d6-9c773861acc4";

async function verifyWfmWorkflow() {
    console.log("🧪 WFM Workflow Verification\n");

    try {
        // 1. Create Time Period
        console.log("1️⃣ Creating Time Period...");
        const period = await TimeLaborService.createTimePeriod(
            TENANT_ID,
            "Week of Feb 10, 2026",
            new Date("2026-02-10"),
            new Date("2026-02-16")
        );
        console.log(`✅ Period created: ${period.id}`);

        // 2. Get or Create Timesheet
        console.log("\n2️⃣ Getting/Creating Timesheet...");
        const timesheet = await TimeLaborService.getOrCreateTimesheet(
            TENANT_ID,
            TEST_PERSON_ID,
            period.id
        );
        console.log(`✅ Timesheet created: ${timesheet.id}`);

        // 3. Add Time Entry
        console.log("\n3️⃣ Adding Time Entry...");
        const entry = await TimeLaborService.logTime({
            tenantId: TENANT_ID,
            timesheetId: timesheet.id,
            date: new Date("2026-02-10"),
            timeType: "REGULAR",
            durationMinutes: 480 // 8 hours
        });
        console.log(`✅ Entry logged: ${entry.id}`);

        // 4. Submit Timesheet
        console.log("\n4️⃣ Submitting Timesheet...");
        const submitted = await TimeLaborService.submitTimesheet(timesheet.id);
        console.log(`✅ Timesheet status: ${submitted.status}`);

        // 5. Approve Timesheet (as manager)
        console.log("\n5️⃣ Approving Timesheet...");
        const approved = await TimeLaborService.approveTimesheet(
            timesheet.id,
            "manager-user-001"
        );
        console.log(`✅ Timesheet approved: ${approved.status}`);

        // 6. Check Leave Balances
        console.log("\n6️⃣ Checking Leave Balances...");
        const balances = await TimeLaborService.getLeaveBalances(TENANT_ID, TEST_PERSON_ID);
        console.log(`✅ Leave balances:`);
        balances.forEach((b: any) => {
            console.log(`   - ${b.leaveType}: ${b.balanceHours}h`);
        });

        // 7. Test Analytics
        console.log("\n7️⃣ Testing Labor Analytics...");
        const metrics = await TimeLaborService.getLaborMetrics(
            TENANT_ID,
            "2026-02-10",
            "2026-02-16"
        );
        console.log(`✅ Analytics:`, JSON.stringify(metrics, null, 2));

        console.log("\n✅ ALL TESTS PASSED!");
        console.log("\n📋 Summary:");
        console.log(`   - Period ID: ${period.id}`);
        console.log(`   - Timesheet ID: ${timesheet.id}`);
        console.log(`   - Final Status: ${approved.status}`);
        console.log(`   - Leave Balances: ${balances.length} types`);

    } catch (error) {
        console.error("\n❌ TEST FAILED:", error);
        process.exit(1);
    }
}

verifyWfmWorkflow()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Fatal error:", err);
        process.exit(1);
    });
