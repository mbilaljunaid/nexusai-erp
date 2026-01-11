
import "dotenv/config";
import { arService } from "../server/services/ar";
import { storage } from "../server/storage";

async function verifyAdvancedTransactions() {
    console.log("Starting AR Advanced Transactions Verification...");

    try {
        // 1. Setup Master Data
        console.log("Creating Setup Data...");
        const customer = await arService.createCustomer({
            name: "Adv Tnx Corp",
            customerType: "Commercial"
        } as any);

        const account = await arService.createAccount({
            customerId: customer.id,
            accountName: "Adv Tnx Account",
            accountNumber: `AT-${Date.now()}`
        } as any);

        const site = await arService.createSite({
            accountId: account.id,
            siteName: "HQ Site",
            address: "123 Test St",
            isBillTo: true,
            isShipTo: true
        } as any);

        // 2. Create Standard Invoice ($1000)
        console.log("Creating Standard Invoice...");
        const invoice = await arService.createInvoice({
            customerId: customer.id,
            accountId: account.id,
            siteId: site.id,
            invoiceNumber: `INV-ADV-${Date.now()}`,
            amount: "1000",
            totalAmount: "1000",
            taxAmount: "0",
            currency: "USD",
            dueDate: new Date(),
            status: "Sent",
            transactionClass: "INV",
            description: "Original Invoice"
        } as any);
        console.log(`Invoice Created: ${invoice.invoiceNumber}`);

        // 3. Create Credit Memo ($200)
        console.log("Creating Credit Memo...");
        const cm = await arService.createCreditMemo(invoice.id, 200, "Damaged Goods");
        console.log(`Credit Memo Created: ${cm.invoiceNumber} (Class: ${cm.transactionClass})`);

        if (cm.transactionClass !== "CM") throw new Error("CM Class Mismatch");
        if (cm.sourceTransactionId !== invoice.id) throw new Error("CM Linking Failed");

        // 4. Apply Credit Memo
        console.log("Applying Credit Memo...");
        await arService.applyCreditMemo(cm.id, invoice.id, 200);

        // Verify Balances
        // Note: applyCreditMemo creates an ArAdjustment.
        const adjustments = await arService.listAdjustments(invoice.id);
        const totalAdj = adjustments.reduce((sum, a) => sum + Number(a.amount), 0);
        console.log(`Total Adjustments on Invoice: ${totalAdj}`);

        if (totalAdj !== -200) throw new Error(`Adjustment amount mismatch. Expected -200, got ${totalAdj}`);

        // 5. Create Debit Memo ($50)
        console.log("Creating Debit Memo...");
        const dm = await arService.createDebitMemo(account.id, site.id, 50, "Late Fees");
        console.log(`Debit Memo Created: ${dm.invoiceNumber}`);
        if (dm.transactionClass !== "DM") throw new Error("DM Class Mismatch");

        // 6. Chargeback Test
        // Need a Receipt first? 
        // Logic: Receipt created for Invoice, partial payment? 
        // createChargeback requires a receiptId.

        console.log("Creating Receipt...");
        const receipt = await arService.createReceipt({
            customerId: customer.id,
            accountId: account.id,
            receiptNumber: `REC-ADV-${Date.now()}`,
            amount: "500",
            receiptDate: new Date(),
            receiptMethodId: "CHECK",
            status: "Unapplied",
            currency: "USD"
        } as any);

        console.log("Creating Chargeback...");
        // Usually done during application, but standalone testing:
        const cb = await arService.createChargeback(receipt.id, invoice.id, 50);
        console.log(`Chargeback Created: ${cb.invoiceNumber}`);
        if (cb.transactionClass !== "CB") throw new Error("CB Class Mismatch");

        console.log("✅ Verification Successful!");
        process.exit(0);

    } catch (e) {
        console.error("❌ Verification Failed:", e);
        process.exit(1);
    }
}

verifyAdvancedTransactions();
