import { db } from './server/db';
import { apService } from './server/services/ap';
import { treasuryService } from './server/services/TreasuryService';
import { apSuppliers, apSupplierSites, cashBankAccounts, apPaymentBatches, apPayments, apInvoicePayments, apInvoices } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
    try {
        console.log("Setting up Disbursement Bank Account...");
        let [bank] = await db.select().from(cashBankAccounts).where(eq(cashBankAccounts.currency, "USD")).limit(1);
        if (!bank) {
            [bank] = await db.insert(cashBankAccounts).values({
                bankName: "JPMorgan Chase",
                accountNumber: "US12JPMC30000000000123", // Fake IBAN
                currency: "USD",
                accountType: "CHECKING",
                swiftCode: "CHASUS33",
                active: true,
                currentBalance: "1000000.00"
            }).returning();
            console.log("Created Internal Bank:", bank.id);
        }

        console.log("Setting up Supplier with IBAN/SWIFT...");
        const [site] = await db.select().from(apSupplierSites).limit(1);
        if (!site) throw new Error("No supplier site found. Run previous tests to seed data.");

        const [supplier] = await db.select().from(apSuppliers).where(eq(apSuppliers.id, site.supplierId)).limit(1);
        if (!supplier) throw new Error("No supplier found for site");

        await db.update(apSupplierSites).set({
            iban: "GB82WEST12345698765432",
            swiftCode: "NWBKGB2L"
        }).where(eq(apSupplierSites.id, site.id));
        console.log("Updated Supplier Site with banking details.");

        console.log("Creating Invoice for Payment Batch...");
        const invoice = await apService.createInvoice({
            header: {
                supplierId: supplier.id,
                supplierSiteId: site.id,
                invoiceNumber: "INV-PPR-" + Date.now(),
                invoiceDate: new Date(),
                invoiceAmount: "5000.00",
                invoiceCurrencyCode: "USD",
                description: "Invoice for PPR Test",
                invoiceStatus: "VALIDATED"
            },
            lines: [
                {
                    lineNumber: 1,
                    lineType: "ITEM",
                    amount: "5000.00",
                    description: "Service"
                }
            ]
        });

        // Mark as Validated explicitly 
        await db.update(apInvoices).set({ validationStatus: 'VALIDATED' }).where(eq(apInvoices.id, invoice.id as any));

        console.log("Creating Payment Batch...");
        const [batch] = await db.insert(apPaymentBatches).values({
            batchName: "PPR-TEST-" + Date.now(),
            status: "CONFIRMED",
            bankAccountId: bank.id,
            paymentCurrency: "USD"
        }).returning();

        console.log("Creating Payment...");
        const [payment] = await db.insert(apPayments).values({
            batchId: batch.id,
            supplierId: supplier.id,
            amount: "5000.00",
            paymentDate: new Date(),
            currencyCode: "USD",
            paymentMethodCode: "EFT",
            status: "ISSUED"
        }).returning();

        console.log("Linking Payment to Invoice (apInvoicePayments)...");
        await db.insert(apInvoicePayments).values({
            invoiceId: invoice.id as any,
            paymentId: payment.id,
            amount: "5000.00",
            discountTaken: "0.00"
        });

        console.log("Generating ISO20022 pain.001 XML...");
        const xml = await treasuryService.generateISO20022(batch.id);

        console.log("========== ISO 20022 XML OUTPUT ==========");
        console.log(xml);
        console.log("==========================================");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}
main();
