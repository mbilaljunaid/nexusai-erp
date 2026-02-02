import 'dotenv/config';
import { storage } from "../server/storage";
import { insertTaxCodeSchema, insertTaxJurisdictionSchema, insertTaxExemptionSchema, insertArCustomerSchema, insertArCustomerSiteSchema, insertArInvoiceSchema } from "@shared/schema";

async function verifyTaxDetermination() {
    console.log("Starting Tax Determination Verification...");

    // 1. Setup Data
    const timestamp = Date.now();
    console.log("Creating Test Data...");

    // Jurisdiction
    const jurisdiction = await storage.createTaxJurisdiction({
        name: `Test State ${timestamp}`,
        type: "State"
    });
    console.log("Created Jurisdiction:", jurisdiction.name);

    // Tax Code (10%)
    const taxCode = await storage.createTaxCode({
        name: `State Tax ${timestamp}`,
        rate: "0.1000",
        jurisdictionId: jurisdiction.id,
        active: true
    });
    console.log("Created Tax Code:", taxCode.name, "Rate:", taxCode.rate);

    // Customer
    const customer = await storage.createArCustomer({
        name: `Tax Test Customer ${timestamp}`,
        status: "Active"
    });

    // Account
    const account = await storage.createArCustomerAccount({
        customerId: customer.id,
        accountName: "Test Account",
        accountNumber: `TAX-${timestamp}`,
        status: "Active"
    });

    // Site (Address must match jurisdiction name "Test State ...")
    const site = await storage.createArCustomerSite({
        accountId: account.id,
        siteName: "Headquarters",
        address: `123 Main St, ${jurisdiction.name}, Country`
    });
    console.log("Created Site Address:", site.address);

    // Invoice ($1000)
    const invoice = await storage.createArInvoice({
        customerId: customer.id,
        siteId: site.id,
        invoiceNumber: `INV-${timestamp}`,
        amount: "1000.00",
        totalAmount: "1000.00",
        status: "Draft"
    });
    console.log("Created Invoice:", invoice.invoiceNumber, "Amount:", invoice.amount);

    // 2. Test Calculation (Standard)
    // We need to import TaxService to test it directly, or call API. 
    // Since this script runs in the same environment as server (using tsx), we can import service.
    const { taxService } = await import("../server/services/tax");

    console.log("\n--- Test 1: Standard Calculation ---");
    const result1 = await taxService.calculateTaxForInvoice(invoice.id);
    console.log("Tax Amount:", result1.taxAmount);
    console.log("Details:", result1.taxDetails);

    if (result1.taxAmount === 100) {
        console.log("PASS: Standard tax calculated correctly (10% of 1000 = 100)");
    } else {
        console.error("FAIL: Expected 100, got", result1.taxAmount);
    }

    // 3. Test Exemption (Full)
    console.log("\n--- Test 2: Full Exemption ---");
    const exemptionFull = await storage.createTaxExemption({
        customerId: customer.id, // linked to customer
        taxCodeId: taxCode.id,
        exemptionType: "Full"
    });

    const result2 = await taxService.calculateTaxForInvoice(invoice.id);
    console.log("Tax Amount:", result2.taxAmount);

    if (result2.taxAmount === 0) {
        console.log("PASS: Full exemption applied (0 tax)");
    } else {
        console.error("FAIL: Expected 0, got", result2.taxAmount);
    }

    // Cleanup Exemption (Naive db delete not exposed in storage interface? defaults usually don't have delete)
    // For verification scripts, we usually just add content. 
    // Let's create a NEW exemption that overrides? Or maybe we can't delete.
    // We can create a Partial exemption for a NEW invoice/customer to test distinct cases.

    console.log("\n--- Test 3: Partial Exemption ---");
    // Creating new customer/invoice for partial test
    const customer2 = await storage.createArCustomer({ name: `Partial Tax Cust ${timestamp}`, status: "Active" });
    const account2 = await storage.createArCustomerAccount({ customerId: customer2.id, accountName: "Acc2", accountNumber: `TAX2-${timestamp}` });
    const site2 = await storage.createArCustomerSite({ accountId: account2.id, siteName: "Site2", address: `456 Rd, ${jurisdiction.name}` });
    const invoice2 = await storage.createArInvoice({ customerId: customer2.id, siteId: site2.id, invoiceNumber: `INV2-${timestamp}`, amount: "1000.00", totalAmount: "1000.00" });

    await storage.createTaxExemption({
        customerId: customer2.id,
        taxCodeId: taxCode.id,
        exemptionType: "Partial",
        exemptionValue: "0.50" // 50% discount
    });

    const result3 = await taxService.calculateTaxForInvoice(invoice2.id);
    console.log("Tax Amount:", result3.taxAmount); // Should be 100 * 0.5 = 50. Wait.
    // Logic: rate = rate * (1 - exemptionValue). 
    // Rate 0.10. Exemption 0.50 (50% reduction). Eff Rate 0.05.
    // Tax = 1000 * 0.05 = 50.

    if (result3.taxAmount === 50) {
        console.log("PASS: Partial exemption applied (50 tax)");
    } else {
        console.error("FAIL: Expected 50, got", result3.taxAmount);
    }

    console.log("\nVerification Complete.");
    process.exit(0);
}

verifyTaxDetermination().catch(console.error);
