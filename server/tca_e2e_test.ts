import "dotenv/config";
import { db } from "../server/db";
import { eq } from "drizzle-orm";
import {
    arCustomers,
    arCustomerProfiles,
    arCustomerBankAccounts
} from "../shared/schema/ar";
import { arService } from "../server/services/ar";

async function runTest() {
    console.log("=== Starting TCA E2E Verification ===");

    try {
        // 1. Create Customer
        const customer = await arService.createCustomer({
            name: "TCA Test Corp",
            number: "TCA-001",
            category: "Commercial",
            status: "Active",
            businessUnitId: null
        });
        console.log(`✅ Customer Created: ${customer.id}`);

        // 2. Create Customer Profile
        const profile = await arService.createCustomerProfile({
            entityType: "CUSTOMER",
            entityId: customer.id,
            profileClassName: "Corporate Standard",
            creditLimit: "50000",
            orderLimit: "10000",
            currency: "USD",
            paymentTerms: "Net 30",
            statementCycle: "Monthly",
            dunningLetters: true
        });
        console.log(`✅ Customer Profile Created: ${profile.id} with Credit Limit ${profile.creditLimit}`);

        // 3. Create Customer Bank Account
        const bankAccount = await arService.createCustomerBankAccount({
            customerId: customer.id,
            bankName: "Chase Bank",
            branchName: "Downtown",
            accountNumber: "123456789",
            routingNumber: "111000111",
            currency: "USD",
            primaryFlag: true
        });
        console.log(`✅ Customer Bank Account Created: ${bankAccount.id} at ${bankAccount.bankName}`);

        // 4. Verify Retrieval
        const fetchedProfiles = await arService.listCustomerProfiles();
        const customerProfileFound = fetchedProfiles.some(p => p.id === profile.id);
        if (customerProfileFound) {
            console.log("✅ Profile successfully retrieved from list");
        } else {
            console.error("❌ Profile retrieval failed");
            process.exit(1);
        }

        const fetchedBankAccounts = await arService.listCustomerBankAccounts(customer.id);
        if (fetchedBankAccounts.length > 0 && fetchedBankAccounts[0].id === bankAccount.id) {
            console.log("✅ Bank Account successfully retrieved for customer");
        } else {
            console.error("❌ Bank Account retrieval failed");
            process.exit(1);
        }

        console.log("=== Verification Complete ===");
        process.exit(0);

    } catch (error) {
        console.error("❌ Test Failed:", error);
        process.exit(1);
    }
}

runTest();
