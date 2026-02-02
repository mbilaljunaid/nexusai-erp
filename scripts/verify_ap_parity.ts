import "dotenv/config";
import { db } from "../server/db";
import { apSuppliers, apSupplierSites, apInvoices, apInvoiceLines, apInvoiceDistributions, apWhtGroups, apWhtRates, apPaymentBatches, apPayments, cashBankAccounts } from "@shared/schema";
import { apService } from "../server/services/ap";
import { treasuryService } from "../server/services/TreasuryService";
import { eq } from "drizzle-orm";

async function verifyApParity() {
    console.log("=== AP LEVEL-15 PARITY VERIFICATION ===");

    // 1. Setup Data for WHT
    console.log("\n[1] Setting up WHT Master Data...");
    const [group] = await db.insert(apWhtGroups).values({
        groupName: "WHT-STD-10",
        description: "Standard 10% Withholding"
    }).returning();

    const [rate] = await db.insert(apWhtRates).values({
        groupId: group.id,
        taxRateName: "Professional Service Tax",
        ratePercent: "10.00",
        priority: 1
    }).returning();

    const [supplier] = await db.insert(apSuppliers).values({
        name: "Test Consultant Inc",
        allowWithholdingTax: true,
        withholdingTaxGroupId: group.id.toString(), // casting if needed
        supplierNumber: "SUP-WHT-001"
    }).returning();

    const [site] = await db.insert(apSupplierSites).values({
        supplierId: supplier.id,
        siteName: "HEADQUARTERS"
    }).returning();

    // 2. Test WHT Integrity (Invoice Validation)
    console.log("\n[2] Testing Phase 1 (Accounting Integrity)...");
    const [invoice] = await db.insert(apInvoices).values({
        invoiceNumber: "INV-WHT-TEST-001",
        supplierId: supplier.id,
        supplierSiteId: site.id,
        invoiceAmount: "1000.00",
        invoiceDate: new Date(),
        description: "Consulting Services",
        invoiceStatus: "DRAFT",
        validationStatus: "NEVER VALIDATED"
    }).returning();

    await db.insert(apInvoiceLines).values({
        invoiceId: invoice.id,
        lineNumber: 1,
        lineType: "ITEM",
        amount: "1000.00",
        description: "Consulting Fee"
    });

    console.log("Validating Invoice...");
    const validationResult = await apService.validateInvoice(invoice.id);
    console.log("Validation Status:", validationResult.status);

    const updatedInvoice = await db.query.apInvoices.findFirst({ where: eq(apInvoices.id, invoice.id) });
    console.log("WHT Amount on Header:", updatedInvoice?.withholdingTaxAmount);

    const distributions = await db.select().from(apInvoiceDistributions).where(eq(apInvoiceDistributions.invoiceId, invoice.id));
    const whtDist = distributions.find(d => d.description?.startsWith("WHT:"));

    if (whtDist) {
        console.log("✅ WHT Distribution Found:", whtDist.description, `Amount: ${whtDist.amount}`);
    } else {
        console.error("❌ WHT Distribution MISSING!");
    }

    // 3. Test Config (Treasury) & Performance (Async Worker)
    console.log("\n[3] Testing Phase 2 & 3 (Config & Performance)...");

    // Seed Bank Account
    await db.insert(cashBankAccounts).values({
        name: "Citi Operating",
        bankName: "Citibank NA",
        accountNumber: "US99CITI12345678", // Expected IBAN
        swiftCode: "CITIUS33",
        currency: "USD",
        active: true
    });

    // Create Batch
    const [batch] = await db.insert(apPaymentBatches).values({
        batchName: "PPR-AUTO-001",
        checkDate: new Date(),
        paymentMethodCode: "WIRE",
        status: "NEW"
    }).returning();

    // Confirm Batch (Triggers Async Worker)
    console.log("Confirming Batch (Async)...");
    await apService.confirmPaymentBatch(batch.id);

    // Poll for completion
    let attempts = 0;
    while (attempts < 10) {
        const [b] = await db.select().from(apPaymentBatches).where(eq(apPaymentBatches.id, batch.id));
        console.log(`Checking status... ${b.status}`);
        if (b.status === "CONFIRMED") break;
        await new Promise(r => setTimeout(r, 500));
        attempts++;
    }

    // Verify Payment Created
    const payments = await db.select().from(apPayments).where(eq(apPayments.batchId, batch.id));
    console.log(`✅ Payments Created: ${payments.length}`);

    // Verify Treasury XML
    console.log("Generating XML...");
    const xml = await treasuryService.generateISO20022(batch.id);
    if (xml.includes("US99CITI12345678")) {
        console.log("✅ Treasury XML contains dynamic IBAN (US99CITI12345678)");
    } else {
        console.error("❌ Treasury XML missing dynamic IBAN. Found:", xml.substring(xml.indexOf("<IBAN>"), xml.indexOf("</IBAN>")));
    }
}

verifyApParity().catch(console.error).then(() => process.exit(0));
