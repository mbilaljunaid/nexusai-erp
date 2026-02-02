
import { db } from "../server/db";
import { hrmTimeSheets, hrmTimeEntries } from "../shared/schema/time_labor";
import { TimeLaborService } from "../server/services/TimeLaborService";
import { eq, and } from "drizzle-orm";
import { hrPersons } from "../shared/schema/hr_worker";

async function main() {
    console.log("🚀 Starting Bulk Entry Verification...");

    try {
        const tenantId = "test-tenant-wfm-001";

        // 1. Get Employees
        const employees = await db.select().from(hrPersons).where(eq(hrPersons.tenantId, tenantId)).limit(2);
        if (employees.length < 2) throw new Error("Need at least 2 employees for bulk test.");

        const personA = employees[0];
        const personB = employees[1];
        console.log(`   > Testing with: ${personA.firstName} & ${personB.firstName}`);

        // 1b. Get Valid Date
        const periods = await TimeLaborService.getOpenPeriods(tenantId);
        if (periods.length === 0) throw new Error("No Open Periods.");
        const targetDate = periods[0].startDate; // Use start of first open period
        console.log(`   > Target Date: ${targetDate}`);

        // 2. Fetch Initial Status
        console.log("1. Fetching Initial Daily Status...");
        const initialStatus = await TimeLaborService.getDailyStatus(tenantId, targetDate);
        console.log(`   > Found ${initialStatus.length} rows.`);

        // 3. Perform Bulk Upsert
        console.log("2. Performing Bulk Upsert...");
        const entries = [
            { personId: personA.id, startTime: "09:00", endTime: "17:00" },
            { personId: personB.id, startTime: "10:00", endTime: "18:00" }
        ];

        const results = await TimeLaborService.bulkUpsertEntries(tenantId, targetDate, entries);
        console.log(`   > Results: ${results.length} processed.`);
        results.forEach(r => {
            if (r.status === "ERROR") console.error(`     - Failed for ${r.personId}: ${r.error}`);
            else console.log(`     - Success for ${r.personId}`);
        });

        if (results.some(r => r.status === "ERROR")) throw new Error("Bulk Upsert had errors");

        // 4. Verify Persistence
        console.log("3. Verifying Persistence...");
        const finalStatus = await TimeLaborService.getDailyStatus(tenantId, targetDate);
        const rowA = finalStatus.find(r => r.person.id === personA.id);
        const rowB = finalStatus.find(r => r.person.id === personB.id);

        if (rowA?.startTime === "09:00" && rowB?.startTime === "10:00") {
            console.log("✅ Success: Both entries verified in Daily Status.");
        } else {
            console.log("Row A:", rowA);
            console.log("Row B:", rowB);
            throw new Error("Verification Failed: Start times do not match.");
        }

    } catch (error) {
        console.error("❌ Error During Verification:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();
