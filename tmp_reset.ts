import { db } from "./server/db";
import { apInvoices, slaJournalHeaders, apInvoiceDistributions, slaJournalLines } from "./shared/schema";
import { eq, inArray } from "drizzle-orm";

async function run() {
    try {
        await db.update(apInvoices).set({ invoiceStatus: 'DRAFT', validationStatus: 'NEEDS REVALIDATION' });

        const headers = await db.select().from(slaJournalHeaders).where(eq(slaJournalHeaders.eventClassId, "AP_INVOICE"));
        if (headers.length > 0) {
            await db.delete(slaJournalLines).where(inArray(slaJournalLines.headerId, headers.map(h => h.id)));
            await db.delete(slaJournalHeaders).where(inArray(slaJournalHeaders.id, headers.map(h => h.id)));
        }

        console.log("Reset OK");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
