import { apService } from "../server/services/ap";
import { db } from "../server/db";
import {
    apInvoices, apSuppliers, apPaymentBatches, apPayments,
    slaJournalHeaders, slaJournalLines, apInvoicePayments,
    glLedgers
} from "../shared/schema";
import { eq, and } from "drizzle-orm";

async function verifyApAccounting() {
    console.log("🚀 Starting AP Accounting Verification...");

    try {
        // Fetch valid ledger
        console.log("Fetching valid ledger...");
        const [ledger] = await db.select().from(glLedgers).limit(1);
        if (!ledger) throw new Error("No ledger found in database");
        const ledgerId = ledger.id;
        console.log(`✅ Using Ledger: ${ledger.name} (${ledgerId})`);

        // 1. Setup: Ensure we have a supplier
        let [supplier] = await db.select().from(apSuppliers).limit(1);
        if (!supplier) {
            console.log("Creating test supplier...");
            [supplier] = await apService.createSupplier({
                name: "SLA Test Supplier",
                email: "sla@test.com",
                taxId: "SLA-TAX-001",
                paymentTermsId: 1
            });
        }

        // 2. Create Invoice
        console.log("Creating test invoice...");
        const invoiceData = {
            header: {
                supplierId: supplier.id,
                invoiceNumber: `SLA-INV-${Date.now()}`,
                invoiceAmount: "1000.00",
                invoiceCurrencyCode: "USD",
                invoiceDate: new Date(),
                paymentTerms: "Net 30",
                description: "SLA Verification Invoice"
            },
            lines: [
                { amount: "1000.00", description: "Line 1" }
            ]
        };
        const invoice = await apService.createInvoice(invoiceData as any);
        console.log(`✅ Invoice created: ${invoice.id}`);

        // 3. Validate Invoice (Should trigger SLA)
        console.log("Validating invoice...");
        const validationResult = await apService.validateInvoice(invoice.id);
        console.log(`✅ Validation result: ${validationResult.status}`);

        if (validationResult.status !== "VALIDATED") {
            throw new Error(`Invoice validation failed: ${validationResult.holds.join(", ")}`);
        }

        // 4. Verify Invoice Accounting
        console.log("Verifying Invoice SLA Journals...");
        const invoiceJournals = await db.select()
            .from(slaJournalHeaders)
            .where(and(
                eq(slaJournalHeaders.entityId, String(invoice.id)),
                eq(slaJournalHeaders.entityTable, "ap_invoices"),
                eq(slaJournalHeaders.eventClassId, "AP_INVOICE_VALIDATED")
            ));

        if (invoiceJournals.length === 0) {
            throw new Error("No SLA journal found for invoice validation");
        }

        const invHeaderId = invoiceJournals[0].id;
        const invLines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, invHeaderId));

        console.log(`✅ Found Invoice Journal ${invHeaderId} with ${invLines.length} lines`);
        invLines.forEach(l => {
            console.log(`   - ${l.accountingClass}: Dr ${l.enteredDr}, Cr ${l.enteredCr} (CCID: ${l.codeCombinationId})`);
        });

        if (invLines.length < 2) throw new Error("Expected at least 2 SLA lines for invoice validation");

        // 5. Create Payment Batch (PPR)
        console.log("Creating payment batch...");
        const batch = await apService.createPaymentBatch({
            batchName: `SLA-BATCH-${Date.now()}`,
            checkDate: new Date(),
            paymentMethodCode: "CHECK",
            status: "DRAFT"
        });

        console.log("Selecting invoices for batch...");
        await apService.selectInvoicesForBatch(batch.id);

        console.log("Confirming payment batch...");
        await apService.confirmPaymentBatch(batch.id);
        console.log("✅ Batch confirmed");

        // 6. Verify Payment Accounting
        console.log("Verifying Payment SLA Journals...");
        const paymentJournals = await db.select()
            .from(slaJournalHeaders)
            .where(and(
                eq(slaJournalHeaders.entityId, String(invoice.id)),
                eq(slaJournalHeaders.entityTable, "ap_invoices"),
                eq(slaJournalHeaders.eventClassId, "AP_PAYMENT_CREATED")
            ));

        if (paymentJournals.length === 0) {
            throw new Error("No SLA journal found for payment creation");
        }

        const payHeaderId = paymentJournals[0].id;
        const payLines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, payHeaderId));

        console.log(`✅ Found Payment Journal ${payHeaderId} with ${payLines.length} lines`);
        payLines.forEach(l => {
            console.log(`   - ${l.accountingClass}: Dr ${l.enteredDr}, Cr ${l.enteredCr} (CCID: ${l.codeCombinationId})`);
        });

        if (payLines.length < 2) throw new Error("Expected at least 2 SLA lines for payment");

        console.log("\n✨ AP Accounting Verification Completed Successfully!");

    } catch (error) {
        console.error("\n❌ Verification Failed:");
        console.error(error);
        process.exit(1);
    }
}

verifyApAccounting();

