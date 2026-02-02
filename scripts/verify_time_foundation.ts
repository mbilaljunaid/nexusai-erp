
import { db } from "../server/db";
import { hrmTimePeriods, hrmTimeSheets, hrmTimeEntries } from "../shared/schema";
import { TimeLaborService } from "../server/services/TimeLaborService";
import { eq } from "drizzle-orm";
import { seedAdminUser } from "../server/platformAuth";
import { hrPersons } from "../shared/schema/hr_worker";

async function main() {
    console.log("🚀 Starting Time & Labor Foundation Verification...");

    try {
        // 1. Setup Tenant & Admin
        const tenantId = "test-tenant-wfm-001";
        await seedAdminUser(); // Ensures defaults exist if needed, though we'll use raw inserts

        // 2. Create or Fetch Test Person
        console.log("1. Creating/Fetching Test Person...");
        const [existingPerson] = await db.select().from(hrPersons)
            .where(eq(hrPersons.personNumber, "WFM-TEST-001"));

        let person = existingPerson;

        if (!person) {
            const [newPerson] = await db.insert(hrPersons).values({
                tenantId,
                personNumber: "WFM-TEST-001",
                firstName: "John",
                lastName: "Clockwatcher",
                email: "john.clock@test.com"
            }).returning();
            person = newPerson;
        }
        console.log(`   > Person Ready: ${person.id}`);

        // 3. Create Time Period (Admin Action)
        console.log("2. Creating Time Period...");
        const period = await TimeLaborService.createTimePeriod(
            tenantId,
            "Week 1 2026",
            "2026-01-01",
            "2026-01-07"
        );
        console.log(`   > Period Created: ${period.id} (${period.startDate} - ${period.endDate})`);

        // 4. Create Timesheet (Auto-creation logic)
        console.log("3. Creating/Fetching Timesheet...");
        const sheet = await TimeLaborService.getOrCreateTimesheet(tenantId, person.id, period.id);
        console.log(`   > Timesheet Ready: ${sheet.id}`);

        // 5. Log Time Entry
        console.log("4. Logging Time (8 hours)...");
        const entry = await TimeLaborService.logTime({
            tenantId,
            timesheetId: sheet.id,
            date: "2026-01-02", // Fri
            durationMinutes: 480, // 8 hours
            notes: "Regular work",
            timeType: "REGULAR"
        });
        console.log(`   > Entry Created: ${entry.id} (${entry.durationMinutes} mins)`);

        // 6. Verify Totals Calculation
        console.log("5. Verifying Timesheet Totals...");
        const fullSheet = await TimeLaborService.getTimesheet(sheet.id);

        console.log("   > Sheet State:", {
            totalHours: fullSheet.totalHours,
            totalEntries: fullSheet.entries.length
        });

        if (Number(fullSheet.totalHours) === 8.0) {
            console.log("✅ Success: Total Hours are correct (8.0)");
        } else {
            console.error("❌ Failed: Total Hours Incorrect", fullSheet.totalHours);
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
