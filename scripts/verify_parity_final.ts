
import { apService } from "../server/services/ap";
import { slaService } from "../server/services/SlaService";
import { treasuryService } from "../server/services/TreasuryService";
import { financeService } from "../server/services/finance";
import { db } from "../server/db";
import {
    apSuppliers, apSupplierSites, apInvoices, apInvoiceLines,
    apWhtGroups, apWhtRates, glJournals, slaJournalHeaders, slaJournalLines,
    glLedgers, apPaymentBatches, apPayments, glSegments, glValueSets, glCoaStructures,
    apInvoicePayments
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

async function verifyFinalParity() {
    console.log("🚀 Starting Final Parity Verification...");

    try {
        // 0. Setup Ledger if missing
        // 0. Setup COA Structure if missing
        let [coa] = await db.select().from(glCoaStructures).limit(1);
        if (!coa) {
            console.log("Creating default COA structure...");
            [coa] = await db.insert(glCoaStructures).values({
                name: "Standard COA",
                description: "Standard Chart of Accounts",
                delimiter: "-"
            } as any).returning();
        }
        const coaId = coa.id;

        // 0.1 Setup Ledger if missing
        let [ledger] = await db.select().from(glLedgers).limit(1);
        if (!ledger) {
            console.log("Creating default ledger...");
            [ledger] = await db.insert(glLedgers).values({
                name: "Primary Ledger",
                currencyCode: "USD",
                coaId: coaId
            } as any).returning();
        }
        const ledgerId = ledger.id;

        // Ensure segments exist so CCID creation populates them
        const [existingSeg] = await db.select().from(glSegments).where(eq(glSegments.coaStructureId, coaId)).limit(1);
        if (!existingSeg) {
            console.log(`Defining segments & value sets for COA ${coaId}...`);

            const vsName = `GENERIC_VS_${Date.now()}`;
            const [vs] = await db.insert(glValueSets).values({
                name: vsName,
                description: "Generic Value Set",
                formatType: "Character",
                maximumSize: 30
            } as any).returning();

            await db.insert(glSegments).values([
                { coaStructureId: coaId, segmentNumber: 1, segmentName: "Company", segmentType: "BALANCING", columnName: "segment1", valueSetId: vs.id, prompt: "Company" },
                { coaStructureId: coaId, segmentNumber: 2, segmentName: "Account", segmentType: "NATURAL", columnName: "segment2", valueSetId: vs.id, prompt: "Account" },
                { coaStructureId: coaId, segmentNumber: 3, segmentName: "Cost Center", segmentType: "COST_CENTER", columnName: "segment3", valueSetId: vs.id, prompt: "Cost Center" }
            ]);
        }

        // 1. Test Multi-Tier WHT
        console.log("\n--- Testing Multi-Tier WHT ---");
        const whtGroupName = `EMEA Standard WHT ${Date.now()}`;
        const [whtGroup] = await db.insert(apWhtGroups).values({
            groupName: whtGroupName,
            description: "Federal + Local WHT"
        }).returning();

        await db.insert(apWhtRates).values([
            { groupId: whtGroup.id, taxRateName: "Federal WHT", ratePercent: "7.00", priority: 1 },
            { groupId: whtGroup.id, taxRateName: "State WHT", ratePercent: "3.00", priority: 2 }
        ]);

        const supplierName = `WHT Supplier ${Date.now()}`;
        const [supplier] = await db.insert(apSuppliers).values({
            name: supplierName,
            supplierName: supplierName,
            allowWithholdingTax: true,
            withholdingTaxGroupId: whtGroup.id
        } as any).returning();

        const [site] = await db.insert(apSupplierSites).values({
            supplierId: supplier.id,
            siteName: "DUBLIN",
            isPaySite: true,
            iban: "IE1234567890",
            swiftCode: "GENERICIE"
        } as any).returning();

        const invoiceNum = `WHT-INV-${Date.now()}`;
        const invoice = await apService.createInvoice({
            header: {
                supplierId: supplier.id,
                supplierSiteId: site.id,
                invoiceNumber: invoiceNum,
                invoiceNum: invoiceNum,
                invoiceAmount: "1000.00",
                invoiceCurrencyCode: "USD",
                invoiceDate: new Date(),
                glDate: new Date(),
                dueDate: new Date(),
                description: "WHT Multi-tier test"
            } as any,
            lines: [{ amount: "1000.00", lineNumber: 1 } as any]
        });

        const validation = await apService.validateInvoice(invoice.id);
        console.log(`Validation Status: ${validation.status}`);

        const [validatedInv] = await db.select().from(apInvoices).where(eq(apInvoices.id, invoice.id));
        console.log(`Calculated WHT Amount: ${validatedInv.withholdingTaxAmount} (Expected: 100.00)`);

        if (Number(validatedInv.withholdingTaxAmount) === 100) {
            console.log("✅ WHT Multi-tier Success");
        } else {
            console.error("❌ WHT Multi-tier Failed");
        }

        // 2. Test Intercompany Balancing
        console.log("\n--- Testing Intercompany Balancing ---");
        // We simulate a cross-BSV invoice:
        // BSV 01 (Liability) vs BSV 02 (Expense)

        // In this implementation, createAccounting uses deriveAccount which currently uses BSV 01.
        // I will manually trigger an intercompany event to test the engine.

        const icEvent = {
            eventClass: "AP_INVOICE_VALIDATED",
            entityId: "IC-TEST-001",
            entityTable: "ap_invoices",
            description: "Cross-Entity Invoice",
            amount: 500,
            currency: "USD",
            date: new Date(),
            ledgerId: ledgerId,
            sourceData: { ic: true } // Trigger for our logic
        };

        // Custom balancing logic for test: 
        // We override the derived BSVs in a custom call if we were using a real rules engine.
        // For verification, I'll modify createAccounting to accept BSV overrides in sourceData.
        // But since I'm testing the EXISTING logic, I'll just check if it handles unequal BSVs if I provide them.

        // Let's modify SlaService.ts briefly to support BSV overrides for testing or just mock the lines.
        // Actually, if I can just call balanceBySegment directly:

        const mockLines = [
            { lineNumber: 1, codeCombinationId: "CC-01", enteredDr: "500", enteredCr: "0", currencyCode: "USD" },
            { lineNumber: 2, codeCombinationId: "CC-02", enteredDr: "0", enteredCr: "500", currencyCode: "USD" }
        ];

        // I need real CCIDs.
        const cc01 = await (slaService as any).deriveAccount("EXPENSE", {}, ledgerId); // 01-000-50000...
        // Manually create a CC for BSV 02
        const cc02 = await financeService.getOrCreateCodeCombination(ledgerId, "02-000-20000-000-000-000-000-000-000-000");

        const linesToBalance = [
            { headerId: 999, lineNumber: 1, codeCombinationId: cc01, enteredDr: "500", enteredCr: "0", currencyCode: "USD" },
            { headerId: 999, lineNumber: 2, codeCombinationId: cc02.id, enteredDr: "0", enteredCr: "500", currencyCode: "USD" }
        ];

        const balanced = await (slaService as any).balanceBySegment(linesToBalance, ledgerId);
        console.log(`Lines after balancing: ${balanced.length} (Expected: 4)`);

        if (balanced.length === 4) {
            console.log("✅ Intercompany Balancing Success");
            balanced.forEach((l: any, i: number) => {
                console.log(`Line ${i + 1}: CCID ${l.codeCombinationId}, DR ${l.enteredDr}, CR ${l.enteredCr}`);
            });
        } else {
            console.error("❌ Intercompany Balancing Failed");
        }

        // 3. Test ISO20022 Generation
        console.log("\n--- Testing ISO20022 XML ---");
        const [batch] = await db.insert(apPaymentBatches).values({
            batchName: `Verification Batch ${Date.now()}`,
            checkDate: new Date(),
            status: "SELECTED"
        } as any).returning();

        // Add a payment for our WHT invoice
        const [payment] = await db.insert(apPayments).values({
            batchId: batch.id,
            amount: "900.00", // Net of WHT
            currencyCode: "USD",
            supplierId: supplier.id,
            paymentDate: new Date(),
            paymentMethodCode: "ELECTRONIC",
            status: "NEGOTIABLE"
        } as any).returning();

        await db.insert(apInvoicePayments).values({
            paymentId: payment.id,
            invoiceId: invoice.id,
            amount: "900.00"
        } as any);

        const xml = await treasuryService.generateISO20022(batch.id);
        console.log("ISO20022 Snippet:");
        console.log(xml.substring(0, 500) + "...");

        if (xml.includes("<IBAN>IE1234567890</IBAN>") && xml.includes("<BIC>GENERICIE</BIC>")) {
            console.log("✅ ISO20022 XML Success (IBAN/BIC found)");
        } else {
            console.error("❌ ISO20022 XML Failed");
        }

        console.log("\n🎉 Final Parity Verification Complete!");
        process.exit(0);
    } catch (e) {
        console.error("\n❌ Verification Failed:", e);
        process.exit(1);
    }
}

verifyFinalParity();
