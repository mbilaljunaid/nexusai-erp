import { arService } from "./server/services/ar";
import { storage } from "./server/storage";
import { db } from "./server/db";
import { arLockboxItems, arLockboxBatches } from "./shared/schema/ar";
import { eq } from "drizzle-orm";
import { financeService } from "./server/services/finance";

async function runTest() {
    try {
        console.log("=== Lockbox Error Handling E2E ===");

        // 0. Find an Open GL Period
        const periods = await storage.listGlPeriods();
        let currentPeriod = periods.find(p => p.status === "Open");

        if (!currentPeriod) {
            console.log(`⚠️ No Open GL Period found. Creating one for the current month...`);
            const today = new Date();
            const periodName = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            currentPeriod = await storage.createGlPeriod({
                periodName,
                ledgerId: "PRIMARY",
                startDate: new Date(today.getFullYear(), today.getMonth(), 1),
                endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0),
                status: "Open"
            });
            console.log(`✅ Created and Opened GL Period ${periodName}`);
        } else {
            console.log(`✅ Using Open GL Period ${currentPeriod.periodName}`);
        }

        // 1. Setup Data - Create Customer and Targeted Invoice
        const customer = await storage.createArCustomer({
            partyId: "test-party-123",
            accountNumber: `CUST-${Date.now()}`,
            name: "Test Customer Firm",
            accountDescr: "Test Customer for Manual Lockbox Matching",
            status: "Active"
        });

        const invoice = await storage.createArInvoice({
            invoiceNumber: `INV-MANUAL-${Date.now()}`,
            customerId: customer.id,
            accountId: "dummy",
            siteId: "dummy",
            invoiceDate: new Date(),
            dueDate: new Date(),
            currency: "USD",
            amount: "1000",
            totalAmount: "1000",
            status: "Sent"
        });

        console.log(`✅ Created target invoice: ${invoice.invoiceNumber}`);

        // 2. Submit Lockbox Batch with an invalid invoice number to purposefully generate an Exception
        const batchData = {
            batchDate: new Date().toISOString(),
            bankAccountId: "019488e0-6a0b-71ff-80c1-be5617a23c34",
            currencyCode: "USD",
            totalAmount: "1000",
            itemCount: 1
        };

        const itemsData = [
            {
                checkNumber: `CHK-${Date.now()}`,
                remittanceRef: "INVALID-INV-12345", // Forces an 'Unmatched' status
                payerName: "Test Customer",
                amount: "1000",
                itemDate: currentPeriod.startDate?.toISOString() || new Date().toISOString()
            }
        ];

        console.log("⏳ Processing Lockbox Batch with invalid Remittance Ref...");
        const batch = await arService.processLockboxBatch(batchData, itemsData);

        console.log(`✅ Batch Processed. Status: ${batch.status}`);
        if (batch.status !== "Exceptions") {
            throw new Error(`Expected batch status 'Exceptions', got '${batch.status}'`);
        }

        const items = await storage.listArLockboxItems(batch.id);
        const unmatchedItem = items[0];
        console.log(`✅ Item 1 Status: ${unmatchedItem.matchStatus}`);

        if (unmatchedItem.matchStatus !== "Unmatched") {
            throw new Error(`Expected item status 'Unmatched', got '${unmatchedItem.matchStatus}'`);
        }

        // 3. Execute Manual Match
        console.log(`⏳ Executing Manual Match: Item [${unmatchedItem.id}] -> Invoice [${invoice.id}]...`);
        const matchedItem = await arService.manuallyMatchLockboxItem(unmatchedItem.id, invoice.id);

        console.log(`✅ Manual Match completed. New Item Status: ${matchedItem.matchStatus}`);
        if (matchedItem.matchStatus !== "Matched") {
            throw new Error(`Manual match failed. Expected item status 'Matched', got '${matchedItem.matchStatus}'`);
        }

        // 4. Verify Batch status automatically upgraded
        const refreshedBatch = await storage.getArLockboxBatch(batch.id);
        console.log(`✅ Refreshed Batch Status: ${refreshedBatch?.status}`);
        if (refreshedBatch?.status !== "Processed") {
            throw new Error(`Batch status did not upgrade. Expected 'Processed', got '${refreshedBatch?.status}'`);
        }

        console.log("🎉 All Lockbox Error Handling tests passed successfully!");
        process.exit(0);
    } catch (e) {
        console.error("❌ Test Failed:", e);
        process.exit(1);
    }
}

runTest();
