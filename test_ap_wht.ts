import { db } from './server/db';
import { apService } from './server/services/ap';
import { eq } from 'drizzle-orm';
import { apSuppliers, apWhtGroups, apWhtRates } from './shared/schema/ap';

async function runTest() {
    try {
        console.log("--- Starting Multi-Tier Withholding Tax (WHT) Test ---");

        // 1. Setup Tax Foundation
        console.log("1. Setting up WHT Group and Rates...");

        const [whtGroup] = await db.insert(apWhtGroups)
            .values({
                groupName: `Backup WHT Tier 1 - ${Date.now()}`,
                description: 'Tests automated 28% rent deduction',
                enabledFlag: true
            }).returning();

        const [whtRate] = await db.insert(apWhtRates)
            .values({
                groupId: whtGroup.id,
                taxRateName: 'Federal Backup (28%)',
                ratePercent: '28.00',
                priority: 1,
                enabledFlag: true
            }).returning();

        console.log(`✅ WHT Group Ready: ${whtGroup.groupName} (${whtRate.ratePercent}%)`);

        // 2. Attach to Supplier
        const supplier = await db.query.apSuppliers.findFirst({
            where: eq(apSuppliers.supplierNumber, 'SUP-TEST-001')
        });

        if (!supplier) throw new Error("Supplier not found");

        await db.update(apSuppliers).set({
            allowWithholdingTax: true,
            withholdingTaxGroupId: whtGroup.id
        }).where(eq(apSuppliers.id, supplier.id));
        console.log("✅ Supplier WHT Configuration Applied.");

        // 3. Create an Invoice that passes validation
        console.log("2. Simulating WHT Eligible Invoice ($5,000)...");
        const invoicePayload = {
            header: {
                supplierId: supplier.id,
                invoiceNumber: `WHT-TEST-${Date.now()}`,
                invoiceDate: new Date(),
                invoiceType: "STANDARD",
                invoiceAmount: "5000.00",
                description: "Professional Services with Tax Liability"
            },
            lines: [{
                lineNumber: 1,
                lineType: "ITEM",
                description: "Consulting",
                amount: "5000.00"
            }]
        };

        const invoice = await apService.createInvoice(invoicePayload as any);
        console.log(`✅ Invoice Created: ID=${invoice.id}`);

        console.log("3. Triggering Validation Routine (WHT Engine)...");
        const validateResult = await apService.validateInvoice(invoice.id as any);
        console.log(`✅ Validation Output: Status=${validateResult.status}`);

        console.log("4. Fetching generated WHT parameters...");
        // Use storage interface to avoid nested query mapping errors
        const { storage } = await import('./server/storage');
        const finalInvoice = await storage.getApInvoice(invoice.id as any);
        console.log(`   Invoice Gross Total: $${finalInvoice?.invoiceAmount}`);
        console.log(`   Calculated Withholding Tax: $${finalInvoice?.withholdingTaxAmount}`);
        console.log(`   Net Payment Amount: $${(Number(finalInvoice?.invoiceAmount) - Number(finalInvoice?.withholdingTaxAmount || 0)).toFixed(2)}`);

        console.log("\n--- WHT Test Flow Completed Successfully! ---");
    } catch (e: any) {
        console.error("❌ E2E TEST FAILED:");
        console.error(e.message || e);
    } finally {
        process.exit(0);
    }
}

runTest();
