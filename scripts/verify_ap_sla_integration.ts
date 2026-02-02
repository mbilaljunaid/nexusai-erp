
import { db } from "../server/db";
import { apService } from "../server/services/ap";
import { slaJournalHeaders, slaJournalLines, apInvoices, apInvoiceLines } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

async function verifyApSlaIntegration() {
    console.log("Starting AP-SLA Integration Verification...");

    try {
        // 1. Create a Test Invoice
        console.log("Creating Test Invoice...");
        const invoicePayload = {
            header: {
                invoiceNumber: `SLA-TEST-${Date.now()}`,
                supplierId: 1, // Assumes Supplier 1 exists (Seed data)
                invoiceDate: new Date(),
                invoiceAmount: "100.00",
                invoiceCurrencyCode: "USD",
                invoiceType: "STANDARD",
                paymentTermsId: 1,
                supplierSiteId: 1
            },
            lines: [
                {
                    lineNumber: 1,
                    lineType: "ITEM",
                    amount: "100.00",
                    description: "Test Item for SLA"
                }
            ]
        };

        const invoice = await apService.createInvoice(invoicePayload);
        console.log(`Invoice Created: ID ${invoice.id}, Number: ${invoice.invoiceNumber}`);

        // 2. Validate Invoice (Triggers SLA)
        console.log("Validating Invoice...");
        const validResult = await apService.validateInvoice(invoice.id);
        console.log("Validation Result:", validResult);

        if (validResult.status !== "VALIDATED") {
            console.error("Invoice Validation Failed!", validResult.holds);
            process.exit(1);
        }

        // 3. Verify SLA Journal Creation
        console.log("Verifying SLA Journal...");
        const journals = await db.select()
            .from(slaJournalHeaders)
            .where(eq(slaJournalHeaders.entityId, String(invoice.id)));

        if (journals.length === 0) {
            console.error("❌ No SLA Journal found for Invoice!");
            process.exit(1);
        }

        const journal = journals[0];
        console.log("✅ SLA Journal Header Found:", journal.id);
        console.log("   Event Class:", journal.eventClassId);
        console.log("   Event Type:", journal.eventTypeId);
        console.log("   Status:", journal.status);

        // 4. Verify Lines
        const lines = await db.select()
            .from(slaJournalLines)
            .where(eq(slaJournalLines.headerId, journal.id));

        if (lines.length === 0) {
            console.error("❌ No SLA Journal Lines found!");
            process.exit(1);
        }

        console.log(`✅ Found ${lines.length} Journal Lines:`);
        lines.forEach(l => {
            console.log(`   - Line ${l.lineNumber}: ${l.accountingClass} | Dr: ${l.enteredDr} | Cr: ${l.enteredCr} | CCID: ${l.codeCombinationId}`);
        });

        // 5. Basic Balance Check
        const totalDr = lines.reduce((sum, l) => sum + Number(l.enteredDr || 0), 0);
        const totalCr = lines.reduce((sum, l) => sum + Number(l.enteredCr || 0), 0);

        if (Math.abs(totalDr - totalCr) < 0.01) {
            console.log("✅ Journal is Balanced!");
        } else {
            console.error(`❌ Journal is Unbalanced! Dr: ${totalDr}, Cr: ${totalCr}`);
        }

    } catch (error) {
        console.error("Verification Failed:", error);
        process.exit(1);
    }
}

verifyApSlaIntegration()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
