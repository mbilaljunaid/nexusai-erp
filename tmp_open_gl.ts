import { db } from "./server/db";
import { glPeriods } from "./shared/schema";
import { eq, and } from "drizzle-orm";

async function run() {
    try {
        const periodName = "Feb-26";
        const ledgerId = "PRIMARY";

        // 1. Check if GL Period exists
        const [existingGL] = await db.select().from(glPeriods).where(and(
            eq(glPeriods.periodName, periodName),
            eq(glPeriods.ledgerId, ledgerId)
        ));

        if (!existingGL) {
            await db.insert(glPeriods).values({
                id: "dc6872fa-876a-493f-8fa2-652f14ea3b02",
                ledgerId,
                periodName,
                periodYear: 2026,
                periodNum: 2,
                fiscalYear: 2026,
                startDate: new Date("2026-02-01T00:00:00Z"),
                endDate: new Date("2026-02-28T23:59:59Z"),
                status: "Open"
            });
            console.log("GL Period Feb-26 Inserted");
        } else {
            await db.update(glPeriods)
                .set({ status: 'Open', startDate: new Date("2026-02-01T00:00:00Z"), endDate: new Date("2026-02-28T23:59:59Z") })
                .where(eq(glPeriods.id, existingGL.id));
            console.log("GL Period Feb-26 exists, updating dates");
        }

        process.exit(0);
    } catch (e) {
        console.error("Failed:", e);
        process.exit(1);
    }
}
run();
