
import "dotenv/config";
import { db } from "../server/db";
import { TimeLaborService } from "../server/services/TimeLaborService";
import { hrmPublicHolidays } from "../shared/schema/time_labor";
import { eq } from "drizzle-orm";

const TENANT = "test-tenant-verify-holidays";

async function verifyHolidays() {
    console.log("Starting Holiday Verification...");

    // 1. CLEANUP
    await db.delete(hrmPublicHolidays).where(eq(hrmPublicHolidays.tenantId, TENANT));
    console.log("Cleanup Complete.");

    // 2. CREATE US HOLIDAY
    await TimeLaborService.createHoliday(TENANT, "2026-07-04", "Independence Day", "US");
    console.log("Created US Holiday: July 4th");

    // 3. CREATE UK HOLIDAY
    await TimeLaborService.createHoliday(TENANT, "2026-12-26", "Boxing Day", "UK");
    console.log("Created UK Holiday: Boxing Day");

    // 4. CHECK US WORKER on July 4th (Should Warn)
    const warnUS = await TimeLaborService.checkHolidayWarning(TENANT, "2026-07-04", "US");
    console.log(`US Worker on July 4th: ${warnUS} -> ${warnUS?.includes("Independence") ? "PASSED" : "FAILED"}`);

    // 5. CHECK UK WORKER on July 4th (Should NOT Warn)
    const warnUK = await TimeLaborService.checkHolidayWarning(TENANT, "2026-07-04", "UK");
    console.log(`UK Worker on July 4th: ${warnUK} -> ${warnUK === null ? "PASSED" : "FAILED"}`);

    // 6. CHECK UK WORKER on Boxing Day (Should Warn)
    const warnUK2 = await TimeLaborService.checkHolidayWarning(TENANT, "2026-12-26", "UK");
    console.log(`UK Worker on Boxing Day: ${warnUK2} -> ${warnUK2?.includes("Boxing") ? "PASSED" : "FAILED"}`);

    console.log("\nVerification Complete.");
    process.exit(0);
}

verifyHolidays().catch(console.error);
