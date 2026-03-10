import { db } from "./server/db";
import { arService } from "./server/services/ar";

const run = async () => {
    try {
        console.log("Testing lockbox engine directly against service...");
        const batchData = {
            batchDate: new Date(),
            bankAccountId: "019488e0-6a0b-71ff-80c1-be5617a23c34", // Using a dummy UUID for the test
            currencyCode: "USD",
            totalAmount: "15500",
            itemCount: 2
        };
        const itemsData = [
            {
                checkNumber: "CHK101",
                remittanceRef: "INV-GLO-001",
                payerName: "Globex Corporation",
                amount: "2500",
                itemDate: new Date()
            },
            {
                checkNumber: "CHK102",
                remittanceRef: "INV-INI-002",
                payerName: "Initech LLC",
                amount: "13000",
                itemDate: new Date()
            }
        ];

        const result = await arService.processLockboxBatch(batchData, itemsData);
        console.log("Processed Batch:", result);

        const summary = await arService.getLockboxSummary();
        console.log("Summary Response:", summary);

    } catch (e) {
        console.error("Test error:", e);
    }
    process.exit(0);
}
run();
