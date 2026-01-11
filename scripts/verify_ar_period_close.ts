
import { db } from "../server/db";
import { arPeriodStatuses, arRevenueSchedules, arReceipts } from "../shared/schema";
import { arService } from "../server/services/ar";
import { storage } from "../server/storage";
import { eq } from "drizzle-orm";

async function verifyArPeriodClose() {
    console.log("Starting AR Period Close Verification...");

    const testPeriodName = `Test-${Date.now()}`;
    const auditId = "TEST-USER";

    try {
        // 1. Setup: Create a period status (Open) via storage
        console.log("1. Setting up test period...");
        await storage.updateArPeriodStatus(testPeriodName, "Open", auditId);

        const period = await storage.getArPeriod(testPeriodName);
        if (period?.status !== "Open") throw new Error("Failed to create Open period");
        console.log("   - Period created and Open.");

        // 2. Test Exception: Create an unapplied receipt
        console.log("2. Creating exception (Unapplied Receipt)...");
        const receipt = await storage.createArReceipt({
            customerId: "cust_test", // Dummy, won't validate in minimal schema check
            amount: "100.00",
            receiptDate: new Date(),
            status: "Unapplied",
            paymentMethod: "Check",
            transactionId: `TXN-${Date.now()}`
        } as any);

        // 3. Attempt Close (Should have warnings/exceptions)
        console.log("3. Checking exceptions...");
        const exceptions = await arService.checkPeriodCloseExceptions(testPeriodName);
        console.log("   - Exceptions found:", exceptions);

        if (!exceptions.some(e => e.includes("Unapplied Receipts"))) {
            throw new Error("Failed to detect Unapplied Receipt exception");
        }
        console.log("   - Unapplied Receipt detection verified.");

        // 4. Force Close (assuming we allow close with warning)
        console.log("4. Closing period...");
        const closeResult = await arService.closePeriod(testPeriodName, auditId);

        if (!closeResult.success) {
            throw new Error("Close failed unexpectedly (logic blocks warnings?)");
        }

        const closedPeriod = await storage.getArPeriod(testPeriodName);
        if (closedPeriod?.status !== "Closed") {
            throw new Error("Period status not updated to Closed in DB");
        }
        console.log("   - Period successfully closed.");

        // Cleanup
        console.log("Cleaning up...");
        await db.delete(arPeriodStatuses).where(eq(arPeriodStatuses.periodName, testPeriodName));
        await db.delete(arReceipts).where(eq(arReceipts.id, receipt.id));

        console.log("✅ Verification Successful!");
    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
    // Try to load from .env or just fail if not set in environment (since we are running via tsx)
    console.warn("DATABASE_URL not set explicitly. Ensure .env is loaded.");
}

verifyArPeriodClose();
