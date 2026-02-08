
import { db } from "../server/db";
import { glPeriods } from "../shared/schema/finance";
import { eq, and } from "drizzle-orm";

async function resetPeriods() {
    console.log("🔄 Resetting Periods to Open...");

    const periodName = "Jan-2026";
    const ledgerId = "PRIMARY";

    const period = await db.query.glPeriods.findFirst({
        where: and(eq(glPeriods.periodName, periodName), eq(glPeriods.ledgerId, ledgerId))
    });

    if (period) {
        await db.update(glPeriods)
            .set({ status: "Open" })
            .where(eq(glPeriods.id, period.id));
        console.log(`✅ Opened ${periodName} for ${ledgerId}`);
    } else {
        await db.insert(glPeriods).values({
            periodName,
            ledgerId,
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-02-01"),
            fiscalYear: 2026,
            status: "Open"
        } as any);
        console.log(`✅ Created & Opened ${periodName} for ${ledgerId}`);
    }
    process.exit(0);
}

resetPeriods();
