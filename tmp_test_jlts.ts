import { db } from "./server/db";
import { slaJournalLineTypes } from "./shared/schema/sla";
import { eq } from "drizzle-orm";

async function run() {
    try {
        const jlts = await db.select().from(slaJournalLineTypes).where(eq(slaJournalLineTypes.eventClassId, "AP_INVOICE"));
        console.log("JLTs:", JSON.stringify(jlts, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
