
import { slaService, SlaEvent } from "../server/services/SlaService";
import { db } from "../server/db";
import { slaJournalHeaders, slaJournalLines, glJournals } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

async function verifySla() {
    console.log("Starting SLA Verification...");

    const ledgerId = "primary-ledger-001"; // Assumption
    const entityId = randomUUID();

    const event: SlaEvent = {
        eventClass: "AP_INVOICE_VALIDATED",
        entityId: entityId,
        entityTable: "ap_invoices",
        description: "Test Invoice #123",
        amount: 1000,
        currency: "USD",
        date: new Date(),
        ledgerId: ledgerId,
        sourceData: { vendorType: "External" }
    };

    // 1. Create Accounting
    console.log("1. Calling createAccounting...");
    const header = await slaService.createAccounting(event);

    if (!header) {
        console.error("FAILED: Header not created.");
        process.exit(1);
    }
    console.log(`SUCCESS: SLA Header Created: ${header.id}`);

    // 2. Verify Lines
    const lines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, header.id));
    console.log(`Lines found: ${lines.length}`);
    if (lines.length !== 2) {
        console.error("FAILED: Expected 2 lines (Dr/Cr), found " + lines.length);
        process.exit(1);
    }
    const dr = lines.find(l => l.enteredDr);
    const cr = lines.find(l => l.enteredCr);

    if (dr && cr) {
        console.log(`SUCCESS: Found Debit (${dr.enteredDr}) and Credit (${cr.enteredCr})`);
        console.log(`   Dr Account: ${dr.codeCombinationId}`);
        console.log(`   Cr Account: ${cr.codeCombinationId}`);
    } else {
        console.error("FAILED: Lines unbalanced or missing logic.");
    }

    // 3. Post to GL
    console.log("2. Calling postToGL...");
    // Mock user ID
    const userId = "admin-user";
    const glJournal = await slaService.postToGL(header.id, userId);

    if (glJournal) {
        console.log(`SUCCESS: GL Journal Created: ${glJournal.id}`);
        console.log(`   Journal Number: ${glJournal.journalNumber}`);
        console.log(`   Status: ${glJournal.status}`);
    } else {
        console.error("FAILED: GL Journal not returned.");
        process.exit(1);
    }

    console.log("SLA Verification Complete.");
    process.exit(0);
}

verifySla().catch(e => {
    console.error(e);
    process.exit(1);
});
