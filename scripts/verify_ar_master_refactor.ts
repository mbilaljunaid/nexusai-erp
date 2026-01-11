import { arService } from "../server/services/ar";

async function verifyArMasterRefactor() {
    console.log("🚀 Starting AR Master Data Refactor Verification...");

    try {
        // 1. Create a Customer (Party)
        console.log("\n1. Creating Customer (Party)...");
        const party = await arService.createCustomer({
            name: "Cyberdyne Systems",
            customerType: "Commercial",
            contactEmail: "accounting@cyberdyne.jp",
            address: "Tokyo, Japan"
        });
        console.log("✅ Party created:", party.id);

        // 2. Create an Account for the Party
        console.log("\n2. Creating Customer Account...");
        const account = await arService.createAccount({
            customerId: party.id,
            accountName: "Cyberdyne Global Account",
            accountNumber: "ACC-CYB-001",
            creditLimit: "100000.00",
            riskCategory: "Low"
        });
        console.log("✅ Account created:", account.id);

        // 3. Create a Bill-to Site
        console.log("\n3. Creating Bill-to Site...");
        const billTo = await arService.createSite({
            accountId: account.id,
            siteName: "HQ Billing",
            address: "Cyberdyne Tower, Tokyo",
            isBillTo: true,
            isShipTo: false
        });
        console.log("✅ Bill-to Site created:", billTo.id);

        // 4. Create an Invoice linked to Site
        console.log("\n4. Creating Invoice linked to Site...");
        const invoice = await arService.createInvoice({
            customerId: party.id,
            accountId: account.id,
            siteId: billTo.id,
            invoiceNumber: "INV-CYB-REF-001",
            amount: "5000.00",
            taxAmount: "500.00",
            totalAmount: "5500.00",
            currency: "USD",
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        } as any);
        console.log("✅ Invoice created:", invoice.id);

        // 5. Verification Queries
        console.log("\n5. Running Verification Queries...");
        const accounts = await arService.listAccounts(party.id);
        if (accounts.length === 0) throw new Error("Expected at least 1 account for customer");
        console.log("✅ listAccounts verified");

        const sites = await arService.listSites(account.id);
        if (sites.length === 0) throw new Error("Expected at least 1 site for account");
        console.log("✅ listSites verified");

        const invoices = await arService.listInvoices();
        const cyberdyneInvoice = invoices.find(i => i.invoiceNumber === "INV-CYB-REF-001");
        if (!cyberdyneInvoice || cyberdyneInvoice.siteId !== billTo.id) {
            throw new Error("Invoice site linkage failed");
        }
        console.log("✅ Invoice site linkage verified");

        console.log("\n✨ AR Master Data Refactor Verification PASSED!");
    } catch (error: any) {
        console.error("\n❌ Verification FAILED:", error.message);
        process.exit(1);
    }
}

verifyArMasterRefactor();
