import { db } from "./server/db";
import { slaJournalHeaders, slaJournalLines } from "./shared/schema/sla";
import { eq, desc } from "drizzle-orm";

async function run() {
    try {
        const [header] = await db.select().from(slaJournalHeaders).where(eq(slaJournalHeaders.eventClassId, "AP_INVOICE")).orderBy(desc(slaJournalHeaders.createdAt)).limit(1);
        if (!header) return process.exit(0);

        const lines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, header.id));
        console.log("Lines for Header:", header.id);
        console.log("Lines:", JSON.stringify(lines, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
