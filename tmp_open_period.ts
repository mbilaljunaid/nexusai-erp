import { db } from "./server/db";
import { slaPeriodStatuses } from "./shared/schema/sla";
import { eq, and } from "drizzle-orm";

async function run() {
    try {
        const periodName = "Feb-26"; // Current month
        const ledgerId = "PRIMARY";
        const applicationId = "AP";

        const existing = await db.select().from(slaPeriodStatuses).where(and(
            eq(slaPeriodStatuses.ledgerId, ledgerId),
            eq(slaPeriodStatuses.applicationId, applicationId),
            eq(slaPeriodStatuses.periodName, periodName)
        ));

        if (existing.length > 0) {
            await db.update(slaPeriodStatuses)
                .set({ status: 'Open' })
                .where(eq(slaPeriodStatuses.id, existing[0].id));
            console.log("Period updated to Open");
        } else {
            await db.insert(slaPeriodStatuses).values({
                ledgerId,
                applicationId,
                periodName,
                status: 'Open'
            });
            console.log("Period created as Open");
        }

        // Also open AR and GL for good measure
        await db.insert(slaPeriodStatuses).values({ ledgerId, applicationId: "AR", periodName, status: "Open" }).onConflictDoNothing();
        await db.insert(slaPeriodStatuses).values({ ledgerId, applicationId: "GL", periodName, status: "Open" }).onConflictDoNothing();

        process.exit(0);
    } catch (e) {
        console.error("Failed to open period:", e);
        process.exit(1);
    }
}
run();
