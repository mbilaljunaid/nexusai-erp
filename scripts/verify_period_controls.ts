
import "dotenv/config";
import { financeService } from "../server/services/finance";
import { db } from "../server/db";
import { glPeriods } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyPeriodControls() {
    console.log("Starting Period Control Verification...");
    const ledgerId = "primary-ledger-id";

    try {
        // 1. Setup: Ensure Ledger Controls Enforce Period Close
        console.log("Setting up controls...");
        await financeService.updateLedgerControls(ledgerId, {
            enforcePeriodClose: true,
            preventFutureEntry: true,
            allowPriorPeriodEntry: true
        });

        // 2. Setup: Ensure a specific period is Closed
        // Find or Create a "Closed" period for testing
        // For logic simplicity, we'll assume "Jan-2020" exists or create it temporarily if possible.
        // Actually, let's just use date manipulation.
        // Or updated existing periods status.

        // Let's create a fake closed period directly in DB to be safe
        const testDate = new Date("2020-01-15");
        await db.insert(glPeriods).values({
            ledgerId,
            periodName: "TEST-CLOSED-2020",
            startDate: new Date("2020-01-01"),
            endDate: new Date("2020-01-31"),
            fiscalYear: 2020,
            status: "Closed"
        } as any).onConflictDoNothing();

        // 3. Attempt to post to Closed Period (Should Fail)
        console.log("Attempting to post to Closed Period...");
        let errorCaught = false;
        try {
            await financeService.validatePeriodStatus(ledgerId, testDate);
        } catch (e: any) {
            console.log("Caught Expected Error:", e.message);
            if (e.message.includes("is Closed")) errorCaught = true;
        }

        if (!errorCaught) {
            console.error("Verification Failed: Should have rejected closed period entry.");
            process.exit(1);
        } else {
            console.log("Success: Rejected closed period entry.");
        }

        // 4. Attempt to post to Future Period (Future Entry Warning/Prevent)
        const futureDate = new Date("2030-01-15");
        await db.insert(glPeriods).values({
            ledgerId,
            periodName: "TEST-FUTURE-2030",
            startDate: new Date("2030-01-01"),
            endDate: new Date("2030-01-31"),
            fiscalYear: 2030,
            status: "Future-Entry"
        } as any).onConflictDoNothing();

        console.log("Attempting to post to Future-Entry Period...");
        errorCaught = false;
        try {
            await financeService.validatePeriodStatus(ledgerId, futureDate);
        } catch (e: any) {
            console.log("Caught Expected Error:", e.message);
            if (e.message.includes("Future-Entry")) errorCaught = true;
        }

        if (!errorCaught) {
            console.error("Verification Failed: Should have rejected future period entry.");
            process.exit(1);
        } else {
            console.log("Success: Rejected future period entry.");
        }

        console.log("Verification Complete: Strict Period Controls are working.");
        process.exit(0);

    } catch (e: any) {
        console.error("Verification Error:", e);
        process.exit(1);
    }
}

verifyPeriodControls();
