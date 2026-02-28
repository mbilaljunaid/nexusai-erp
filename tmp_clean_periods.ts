import { db } from "./server/db";
import { glPeriods } from "./shared/schema";
import { like, or } from "drizzle-orm";

async function run() {
    try {
        await db.delete(glPeriods).where(
            or(
                like(glPeriods.periodName, "Smart-Close-%"),
                like(glPeriods.periodName, "Next-Smart-Close-%")
            )
        );
        console.log("Deleted overlapping periods.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
