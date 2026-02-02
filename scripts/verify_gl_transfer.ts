
import { db } from "../server/db";
import { slaJournalHeaders, slaJournalLines } from "../shared/schema/sla";
import { glJournals, glJournalLines, glJournalBatches } from "../shared/schema/finance";
import { eq, inArray } from "drizzle-orm";
import { glTransferService } from "../server/services/GlTransferService";
import { slaEngine } from "../server/modules/sla/sla.service";

async function verifyGlTransfer() {
    console.log("🔍 Verifying SLA -> GL Transfer...");

    // 0. Cleanup Clean slate for test
    const pending = await db.select({ id: slaJournalHeaders.id }).from(slaJournalHeaders)
        .where(eq(slaJournalHeaders.transferStatus, "Not Transferred"));

    if (pending.length > 0) {
        const ids = pending.map(p => p.id);
        await db.delete(slaJournalLines).where(inArray(slaJournalLines.headerId, ids));
        await db.delete(slaJournalHeaders).where(inArray(slaJournalHeaders.id, ids));
    }
    console.log("🧹 Cleared pending SLA journals.");

    // 1. Create a fresh Transaction (AR Invoice) to generate SLA
    const invoiceId = `TEST-GL-INV-${Date.now()}`;
    const ledgerId = "PRIMARY";

    await slaEngine.createAccounting({
        eventClassId: "AR_INVOICE",
        eventTypeId: "AR_INVOICE_COMPLETE",
        entityId: invoiceId,
        entityTable: "ar_invoices",
        ledgerId: ledgerId,
        eventDate: new Date(),
        glDate: new Date(),
        currencyCode: "USD",
        amount: 1500.00,
        description: "Test Invoice for GL Transfer",
        sourceData: {
            customerType: "HighValue",
            amount: 1500.00
        }
    });

    console.log(`✅ Mock SLA Generated for ${invoiceId}`);

    // Wait for async SLA processing if any (though here we awaited it)
    await new Promise(r => setTimeout(r, 100));

    // 2. Run Transfer
    console.log("🚀 Running GL Transfer...");
    const result = await glTransferService.transferToGl("PRIMARY");
    console.log("Transfer Result:", result);

    if (result.count === 0) {
        console.error("❌ Transfer returned 0!");
        process.exit(1);
    }

    // 3. Verify GL Tables
    const glBatch = await db.select().from(glJournalBatches).where(eq(glJournalBatches.id, result.batchId!));
    const glJe = await db.select().from(glJournals).where(eq(glJournals.batchId, result.batchId!));

    console.log(`✅ GL Batch Created: ${glBatch[0].batchName} (Total Dr: ${glBatch[0].totalDebit})`);
    console.log(`✅ GL Journals Created: ${glJe.length}`);

    for (const je of glJe) {
        const lines = await db.select().from(glJournalLines).where(eq(glJournalLines.journalId, je.id));
        console.log(`   - Journal ${je.journalNumber} has ${lines.length} lines.`);

        // Sum check
        const dr = lines.reduce((s, l) => s + Number(l.accountedDebit), 0);
        const cr = lines.reduce((s, l) => s + Number(l.accountedCredit), 0);
        console.log(`     > Dr: ${dr}, Cr: ${cr} (Diff: ${dr - cr})`);

        if (Math.abs(dr - cr) > 0.01) {
            console.error(`❌ Journal Unbalanced!`);
            process.exit(1);
        }
    }

    // 4. Verify SLA Header Status Update for our Invoice
    const header = await db.query.slaJournalHeaders.findFirst({
        where: eq(slaJournalHeaders.entityId, invoiceId)
    });

    if (header && header.transferStatus === "Transferred" && header.glJournalId) {
        console.log(`✅ SLA Header matching ${invoiceId} marked as Transferred to GL JE ${header.glJournalId}.`);
    } else {
        console.error(`❌ SLA Header status check failed: ${header?.transferStatus}`);
        process.exit(1);
    }

    console.log("🎉 GL Transfer Verification PASSED!");
    process.exit(0);
}

verifyGlTransfer().catch(err => {
    console.error("Verification Failed:", err);
    process.exit(1);
});
