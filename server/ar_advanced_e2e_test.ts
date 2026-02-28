import "dotenv/config";
import { db } from "../server/db";
import { eq } from "drizzle-orm";
import {
    arCustomers, arCustomerAccounts, arCustomerSites,
    arInvoices, arInvoiceLines, arReceipts, arReceiptApplications, arAdjustments
} from "../shared/schema/ar";
import { arService } from "../server/services/ar";
import { slaJournalHeaders, slaJournalLines } from "../shared/schema/sla";

async function runTest() {
    console.log("=== Starting Advanced AR E2E Verification ===");

    try {
        // 1. Create Customer
        const customer = await arService.createCustomer({
            name: "Globex Europe HQ",
            customerType: "Commercial"
        });
        console.log("✅ Customer Created:", customer.id);

        const account = await arService.createAccount({
            customerId: customer.id,
            accountName: "Globex Main EUR",
            accountNumber: `ACC-GLB-${Date.now()}`
        });

        const site = await arService.createSite({
            accountId: account.id,
            siteName: "Paris Billing",
            address: "1 Champs Elysees"
        });

        // 2. Multi-Line Invoice (USD)
        const invoiceData = {
            customerId: customer.id,
            accountId: account.id,
            siteId: site.id,
            invoiceNumber: `INV-ADV-${Date.now()}`,
            amount: "1000",
            taxAmount: "100",
            totalAmount: "1100",
            currency: "USD",
            transactionClass: "INV"
        };
        const invoice = await arService.createInvoice(invoiceData as any);
        console.log("✅ Multi-line Invoice Created:", invoice.invoiceNumber, "Total:", invoice.totalAmount, invoice.currency);

        // Add Lines
        await db.insert(arInvoiceLines).values([
            {
                invoiceId: invoice.id,
                lineNumber: 1,
                lineType: "LINE",
                description: "Consulting Services",
                quantity: "10",
                unitPrice: "80",
                amount: "800",
                taxAmount: "80"
            },
            {
                invoiceId: invoice.id,
                lineNumber: 2,
                lineType: "LINE",
                description: "Software License",
                quantity: "1",
                unitPrice: "200",
                amount: "200",
                taxAmount: "20"
            }
        ]);
        console.log("✅ Invoice Lines Added");

        // 3. Cross-Currency Receipt (EUR) with Write-Off
        // Invoice is $1100. Let's say exchange rate is 1 EUR = 1.10 USD
        // They pay EUR 1000. 1000 EUR * 1.10 = $1100
        // Let's test the write off: They pay EUR 999. 999 * 1.10 = $1098.90
        // $1.10 Unapplied remaining (assuming receipt currency EUR, allocated 999)
        // Actually, amount applied is in Invoice currency ($1100).
        // Let's create a receipt for 1000 EUR.
        const receipt = await arService.createReceipt({
            customerId: customer.id,
            accountId: account.id,
            amount: "1000",
            currency: "EUR",
            paymentMethod: "Wire",
            status: "OnAccount",
            exchangeRate: "1.10",
            exchangeRateType: "Corporate"
        } as any);
        console.log("✅ On-Account Receipt Created:", receipt.id, receipt.amount, receipt.currency);

        // Apply it. The invoice needs $1100 USD. 
        // 1100 USD / 1.10 = 1000 EUR.
        // Let's apply $1099.50 (Leaving $0.50 Unapplied to trigger Write-Off)

        const application = await arService.applyReceipt(receipt.id, invoice.id, 1099.50);
        console.log("✅ Receipt Applied. Application ID:", application.id);

        // Fetch it back to see Write-Off Status
        const finalReceipt = await db.query.arReceipts.findFirst({ where: eq(arReceipts.id, receipt.id) });
        console.log("✅ Final Receipt Status:", finalReceipt?.status, "Unapplied:", finalReceipt?.unappliedAmount);

        if (finalReceipt?.status === "Applied" && parseFloat(finalReceipt.unappliedAmount!) === 0) {
            console.log("🚀 Auto-Write-Off SUCCESSFUL!");
        } else {
            console.log("❌ Auto-Write-Off FAILED or threshold not met.");
        }

        // Verify balance
        const balance = await arService.getAccountBalance(account.id);
        console.log("✅ Account Balance Profile:", balance);

        console.log("=== Verification Complete ===");
        process.exit(0);

    } catch (e) {
        console.error("❌ Test Failed:", e);
        process.exit(1);
    }
}

runTest();
