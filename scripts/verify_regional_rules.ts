
import "dotenv/config";
import { db } from "../server/db";
import { TimeLaborService } from "../server/services/TimeLaborService";
import { hrmRegionalPolicies, hrmTimeSheets, hrmTimeEntries, hrmTimePeriods } from "../shared/schema/time_labor";
import { hrPersons } from "../shared/schema/hr_worker";
import { eq } from "drizzle-orm";

const TENANT = "test-tenant-verify-regional";

async function verifyRegionalRules() {
    console.log("Starting Regional Rules Verification...");

    // 1. CLEANUP
    await db.delete(hrmRegionalPolicies).where(eq(hrmRegionalPolicies.tenantId, TENANT));
    await db.delete(hrmTimeSheets).where(eq(hrmTimeSheets.tenantId, TENANT));
    await db.delete(hrPersons).where(eq(hrPersons.tenantId, TENANT));
    await db.delete(hrmTimePeriods).where(eq(hrmTimePeriods.tenantId, TENANT));

    // 2. SETUP TIME PERIOD
    const period = await TimeLaborService.createTimePeriod(TENANT, "Feb 2026", "2026-02-01", "2026-02-28");
    console.log("Created Period:", period.id);

    // 3. SETUP POLICIES
    // US: 40h Standard
    await TimeLaborService.configureRegionalPolicy(TENANT, "US", 40, 8, 1.5);
    // AE: 48h Standard
    await TimeLaborService.configureRegionalPolicy(TENANT, "AE", 48, 8, 1.25);
    console.log("Policies Configured.");

    // 4. CREATE PERSONS
    const [personUS] = await db.insert(hrPersons).values({
        tenantId: TENANT,
        personNumber: "US001",
        firstName: "John",
        lastName: "Doe",
        country: "US"
    }).returning();

    const [personAE] = await db.insert(hrPersons).values({
        tenantId: TENANT,
        personNumber: "AE001",
        firstName: "Ahmed",
        lastName: "Ali",
        country: "AE"
    }).returning();
    console.log("Persons Created:", personUS.country, personAE.country);

    // 5. CREATE TIMESHEETS
    const sheetUS = await TimeLaborService.getOrCreateTimesheet(TENANT, personUS.id, period.id);
    const sheetAE = await TimeLaborService.getOrCreateTimesheet(TENANT, personAE.id, period.id);

    // 6. LOG TIME (45 Hours for EACH)
    // We'll log a single bulk entry for simplicity of verification logic, assuming "Regular" mapping
    // But logTime splits by day? No, logTime is single entry.
    // We'll just create one massive entry of 45 hours (2700 mins) to test the TOTAL logic.
    // Date: 2026-02-01

    console.log("Logging 45h (2700m) for US Worker...");
    await TimeLaborService.logTime({
        tenantId: TENANT,
        timesheetId: sheetUS.id,
        date: "2026-02-01",
        durationMinutes: 2700, // 45h
        notes: "Work Week"
    });

    console.log("Logging 45h (2700m) for AE Worker...");
    await TimeLaborService.logTime({
        tenantId: TENANT,
        timesheetId: sheetAE.id,
        date: "2026-02-01",
        durationMinutes: 2700, // 45h
        notes: "Work Week"
    });

    // 7. VERIFY TOTALS
    const updatedUS = await TimeLaborService.getTimesheet(sheetUS.id);
    const updatedAE = await TimeLaborService.getTimesheet(sheetAE.id);

    console.log(`\n--- RESULTS ---`);
    console.log(`US Worker (Standard 40h): Logged 45h`);
    console.log(`>> Total OT: ${updatedUS.totalOvertime} (Expected: 5.00) -> ${Number(updatedUS.totalOvertime) === 5.0 ? "PASSED" : "FAILED"}`);

    console.log(`AE Worker (Standard 48h): Logged 45h`);
    console.log(`>> Total OT: ${updatedAE.totalOvertime} (Expected: 0.00) -> ${Number(updatedAE.totalOvertime) === 0.0 ? "PASSED" : "FAILED"}`);

    console.log("\nVerification Complete.");
    process.exit(0);
}

verifyRegionalRules().catch(console.error);
