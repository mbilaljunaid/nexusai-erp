import { slaEngine } from "../server/modules/sla/sla.service";
import { db } from "../server/db";
import { slaJournalHeaders, slaJournalLines } from "../shared/schema/sla";
import { glLedgers } from "../shared/schema/finance";
import { eq } from "drizzle-orm";

async function verifySlaEngine() {
    console.log("🔍 Verifying SLA Engine V1...");

    // Fetch valid Ledger
    const [ledger] = await db.select().from(glLedgers).limit(1);
    const ledgerId = ledger?.id || "d7f6c497-6c2e-436f-b25b-09257d0796ad"; // Fallback to assumed (might still fail if empty)

    if (!ledger) {
        console.warn("⚠️ No Ledger found in DB. Using fallback ID, which may fail FK check.");
    } else {
        console.log(`✅ Using Ledger: ${ledger.name} (${ledger.id})`);
    }

    // Mock Payload for an AP Invoice Validation Event
    const invoiceId = "INV-TEST-" + Date.now();
    const payload = {
        eventClassId: "AP_INVOICE",
        eventTypeId: "AP_INVOICE_VALIDATED",
        entityId: invoiceId,
        entityTable: "ap_invoices",
        ledgerId: ledgerId,
        eventDate: new Date(),
        glDate: new Date(),
        currencyCode: "USD",
        amount: 1500.00,
        description: "Test Invoice Accounting",
        sourceData: { vendorId: "VEN-001" }
    };

    try {
        console.log(`➡️ Sending Event: ${payload.eventTypeId} for ${invoiceId}`);
        const header = await slaEngine.createAccounting(payload);

        if (!header) {
            console.error("❌ Failed to create Header.");
            return;
        }

        console.log(`✅ Header Created: ${header.id} [Status: ${header.status}]`);

        // Check Lines
        const lines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, header.id));
        console.log(`📊 Generated ${lines.length} Lines:`);

        lines.forEach(line => {
            console.log(`   Line ${line.lineNumber}: ${line.accountingClass} (${line.description}) -> Dr: ${line.enteredDr || 0} | Cr: ${line.enteredCr || 0} [CCID: ${line.codeCombinationId}]`);
        });

        // Validation
        const totalDr = lines.reduce((acc, l) => acc + Number(l.enteredDr || 0), 0);
        const totalCr = lines.reduce((acc, l) => acc + Number(l.enteredCr || 0), 0);

        if (totalDr === totalCr) {
            console.log(`✅ Accounting Balanced: ${totalDr} = ${totalCr}`);
        } else {
            console.error(`❌ UNEVEN: Dr ${totalDr} != Cr ${totalCr}`);
        }

    } catch (err) {
        console.error("❌ Verification Failed:", err);
    }
}

verifySlaEngine();
