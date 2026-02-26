import { db } from "./server/db";
import { apWhtGroups, apWhtRates, apSuppliers, apSupplierSites, apInvoices, apInvoiceLines } from "./shared/schema/ap";
import { eq } from "drizzle-orm";
import { apService } from "./server/services/ap";
import { randomUUID } from "crypto";

async function runTest() {
    console.log("Starting Multi-Tier WHT Priorities Test...");

    try {
        // 1. Create WHT Group
        const [group] = await db.insert(apWhtGroups).values({
            groupName: `US WHT ${Date.now()}`,
            description: "Federal + State Multi-Tier",
        }).returning();
        console.log(`Created WHT Group: ${group.groupName} (${group.id})`);

        // 2. Create WHT Rates (Priority 1: Federal 20%, Priority 2: State 5%)
        await db.insert(apWhtRates).values([
            { groupId: group.id, taxRateName: "FEDERAL BACKUP WHT", ratePercent: "20.00", priority: 1, enabledFlag: true },
            { groupId: group.id, taxRateName: "STATE WHT", ratePercent: "5.00", priority: 2, enabledFlag: true }
        ]);
        console.log("Attached Priority 1 (20%) and Priority 2 (5%) Rates.");

        // 3. Create Supplier with WHT Enabled
        const [supplier] = await db.insert(apSuppliers).values({
            supplierNumber: `WHT-SUP-${Date.now()}`,
            name: "Taxable Consultants LLC",
            taxId: "WHT-123456",
            paymentTerms: "Net 30",
            allowWithholdingTax: true,
            withholdingTaxGroupId: group.id,
            status: "Active"
        }).returning();

        const [site] = await db.insert(apSupplierSites).values({
            supplierId: supplier.id,
            siteName: "HQ",
            address: "123 Tax St",
            status: "Active",
            primaryPayFlag: true
        }).returning();

        console.log(`Created Supplier WHT Enabled mapped to Group ${group.groupName}`);

        // 4. Create Standard Invoice for $1000.00
        const invNum = `INV-WHT-${Date.now()}`;
        const [invoice] = await db.insert(apInvoices).values({
            supplierId: supplier.id,
            supplierSiteId: site.id,
            invoiceNumber: invNum,
            invoiceAmount: "1000.00",
            invoiceCurrencyCode: "USD",
            invoiceType: "STANDARD",
            invoiceDate: new Date(),
            dueDate: new Date(),
            paymentStatus: "UNPAID",
            validationStatus: "NEVER VALIDATED",
            approvalStatus: "NOT REQUIRED",
            exchangeRate: "1.0000"
        }).returning();

        await db.insert(apInvoiceLines).values({
            invoiceId: invoice.id,
            lineNumber: 1,
            lineType: "ITEM",
            amount: "1000.00",
            description: "Consulting Services"
        });
        console.log(`Created Invoice ${invNum} for $1000.00`);

        // 5. Trigger SLA Validation (The WHT Engine runs here)
        console.log("Triggering SLA Validation Engine...");
        await apService.validateInvoice(invoice.id);

        // 6. Verify Results
        const [validatedInvoice] = await db.select().from(apInvoices).where(eq(apInvoices.id, invoice.id)).limit(1);
        
        console.log(`\n--- WHT Validation Results ---`);
        console.log(`Invoice validationStatus: ${validatedInvoice.validationStatus}`);
        console.log(`Calculated withholdingTaxAmount: ${validatedInvoice.withholdingTaxAmount} (Expected: 250.00)`);
        
        if (Number(validatedInvoice.withholdingTaxAmount) === 250) {
            console.log("✅ WHT Multi-Tier Computation Success! 20% + 5% dynamically cascaded.");
            process.exit(0);
        } else {
            console.error("❌ WHT Computation Failed.");
            process.exit(1);
        }

    } catch (err) {
        console.error("Test Failed with exception:", err);
        process.exit(1);
    }
}

runTest();
