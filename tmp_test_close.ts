import { db } from "./server/db";
import { glPeriods, slaPeriodStatuses } from "./shared/schema";
import { closeEngine } from "./server/services/period-close/CloseEngine";
import { eq, and, gte, lte } from "drizzle-orm";

async function run() {
    try {
        const date = new Date("2026-02-28T00:00:00.000Z");

        const [period] = await db.select().from(glPeriods)
            .where(and(
                eq(glPeriods.ledgerId, "PRIMARY"),
                gte(glPeriods.endDate, date),
                lte(glPeriods.startDate, date) // Adjust logic if inclusive
            ));

        console.log("Matched Period:", period);

        if (period) {
            const [status] = await db.select().from(slaPeriodStatuses)
                .where(and(
                    eq(slaPeriodStatuses.ledgerId, "PRIMARY"),
                    eq(slaPeriodStatuses.periodName, period.periodName),
                    eq(slaPeriodStatuses.applicationId, "AP")
                ));
            console.log("Matched Status:", status);
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
