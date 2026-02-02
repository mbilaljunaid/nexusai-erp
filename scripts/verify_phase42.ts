import { db } from "../server/db";
import { apInvoices, apSuppliers, apPaymentBatches, cashBankAccounts, glLedgers, slaEventClasses, apSupplierSites } from "@shared/schema";
import { apService } from "../server/services/ap";
import { treasuryService } from "../server/services/TreasuryService";
import { arAiService } from "../server/services/ar-ai";
import { eq } from "drizzle-orm";
import { PaymentWorker } from "../server/worker/PaymentWorker";

async function verify() {
    console.log("🚀 Starting Phase 42 Verification...");

    try {
        // 1. Verify WHT-Aware Payment Calculation
        console.log("\n1. Verifying WHT-Aware Payment Calculation...");

        let [supplier] = await db.select().from(apSuppliers).limit(1);
        if (!supplier) {
            console.log("- Seeding mock supplier...");
            [supplier] = await db.insert(apSuppliers).values({
                name: "Phase 42 Mock Supplier",
                supplierNumber: "V42-SUPP",
                allowWithholdingTax: true
            }).returning();
        }

        let [site] = await db.select().from(apSupplierSites).where(eq(apSupplierSites.supplierId, supplier.id)).limit(1);
        if (!site) {
            console.log("- Seeding mock supplier site...");
            [site] = await db.insert(apSupplierSites).values({
                supplierId: supplier.id,
                siteName: "MAIN",
                iban: "US99NEXUS00000012345678",
                swiftCode: "TESTSWIFT",
                bankAccountName: "Mock Supplier Bank",
                bankAccountNumber: "00012345678"
            }).returning();
        }

        let [bank] = await db.select().from(cashBankAccounts).limit(1);
        if (!bank) {
            console.log("- Seeding mock bank account...");
            [bank] = await db.insert(cashBankAccounts).values({
                name: "Primary Operating Account",
                bankName: "Nexus Test Bank",
                accountNumber: "NEXUS-V42-123",
                swiftCode: "NEXUSTEST",
                currency: "USD",
                active: true
            }).returning();
        }

        let [ledger] = await db.select().from(glLedgers).limit(1);
        if (!ledger) {
            console.log("- Seeding mock ledger...");
            [ledger] = await db.insert(glLedgers).values({
                id: "PRIMARY",
                name: "Nexus Primary Ledger",
                currencyCode: "USD",
                ledgerCategory: "PRIMARY"
            }).returning();
        }

        // Seed SLA Event Classes
        const eventClasses = [
            { id: "AP_PAYMENT_CREATED", applicationId: "AP", name: "AP Payment Created" },
            { id: "AR_RECEIPT_UNAPPLIED", applicationId: "AR", name: "AR Receipt Unapplied" }
        ];

        for (const ec of eventClasses) {
            const [existing] = await db.select().from(slaEventClasses).where(eq(slaEventClasses.id, ec.id));
            if (!existing) {
                console.log(`- Seeding SLA Event Class: ${ec.id}...`);
                await db.insert(slaEventClasses).values(ec);
            }
        }

        // Create an invoice with WHT
        const invData = {
            header: {
                supplierId: supplier.id,
                supplierSiteId: site.id, // Linked to the new site
                invoiceNumber: "V42-" + Date.now(),
                invoiceAmount: "1000.00",
                invoiceCurrencyCode: "USD",
                invoiceDate: new Date(),
                dueDate: new Date(),
                description: "Phase 42 Verification Invoice",
                withholdingTaxAmount: "100.00" // 10% WHT
            },
            lines: [{ amount: "1000.00", description: "Service" }]
        };

        const invoice = await apService.createInvoice(invData as any);
        console.log(`- Created Invoice ${invoice.invoiceNumber} with $100 WHT.`);

        // Validate Invoice to make it eligible for payment
        await apService.validateInvoice(invoice.id);
        console.log(`- Validated Invoice ${invoice.id}.`);

        // Create a batch and pay it
        const [batch] = await db.insert(apPaymentBatches).values({
            batchName: "BATCH-V42-" + Date.now(),
            status: "SELECTED",
            checkDate: new Date(),
            bankAccountId: bank.id
        }).returning();

        console.log(`- Processing Batch ${batch.id} with PaymentWorker...`);
        await PaymentWorker.processBatch(batch.id);

        // Check payment amount (should be 900.00)
        const payments = await apService.getBatchPayments(batch.id);
        const payment = payments[0];

        console.log(`- Payment Amount: ${payment.amount} (Expected: 900.00)`);
        if (Number(payment.amount) === 900.00) {
            console.log("✅ WHT-Aware Payment Verified.");
        } else {
            console.error("❌ WHT-Aware Payment FAILED.");
        }

        // 2. Verify Dynamic Treasury Resolution
        console.log("\n2. Verifying Dynamic Treasury Resolution (ISO20022)...");
        const xml = await treasuryService.generateISO20022(batch.id);

        console.log(`- Debtor IBAN in XML: ${xml.includes(bank.accountNumber!) ? "MATCHED" : "MISMATCHED"}`);
        console.log(`- Debtor BIC in XML: ${xml.includes(bank.swiftCode!) ? "MATCHED" : "MISMATCHED"}`);

        if (xml.includes(bank.accountNumber!) && xml.includes(bank.swiftCode!)) {
            console.log("✅ Dynamic Treasury Resolution Verified.");
        } else {
            console.error("❌ Dynamic Treasury Resolution FAILED.");
        }

        // 3. Verify AI Collection Email
        console.log("\n3. Verifying AI Collection Email Refinement...");
        const mockInvoice = { invoiceNumber: "INV-AI-TEST", totalAmount: "5000.00", currency: "USD", dueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) };
        const mockCustomer = { name: "Test Corp" };

        const email = await arAiService.generateCollectionEmail(mockInvoice, mockCustomer);
        console.log("- Generated Email Sample (Snippet):");
        console.log(email.substring(0, 200) + "...");

        if (email.toLowerCase().includes("overdue") && email.includes("5000.00")) {
            console.log("✅ AI Collection Email Verified.");
        } else {
            console.error("❌ AI Collection Email FAILED.");
        }

    } catch (err) {
        console.error("Verification failed with error:", err);
    }

    process.exit(0);
}

verify();
