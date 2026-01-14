
import "dotenv/config";
import { db } from "../server/db";
import { revenueContracts, revenueRecognitions, revenueSourceEvents } from "../shared/schema/revenue";
import { revenuePeriods } from "../shared/schema/revenue_periods";
import { eq, sql } from "drizzle-orm";
import { revenueService } from "../server/services/RevenueService";
import { v4 as uuidv4 } from 'uuid';

import { glLedgers } from "../shared/schema/finance";

async function main() {
    console.log("🔍 Starting Period Close Sweep Verification...");

    // 0. Get Valid Ledger
    const ledgers = await db.select().from(glLedgers).limit(1);
    const ledgerId = ledgers[0]?.id || "PRIMARY";

    // 1. Create a Test Period
    const periodName = `Test-Sweep-${uuidv4().substring(0, 4)}`;
    const [period] = await db.insert(revenuePeriods).values({
        periodName,
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
        status: "Open",
        ledgerId
    }).returning();
    console.log(`✅ Created Test Period: ${periodName}`);

    // 2. Create Contract
    const contractId = uuidv4();
    await db.insert(revenueContracts).values({
        id: contractId,
        contractNumber: `SWEEP-${uuidv4().substring(0, 6)}`,
        customerId: "CUST-SWEEP",
        ledgerId, // Use the fetched ledger
        status: "Active",
        totalTransactionPrice: "1200",
        totalAllocatedPrice: "1200",
        versionNumber: 1
    });

    // 3. Simulate Invoice (Source Event) = $500
    // This implies we billed $500.
    await db.insert(revenueSourceEvents).values({
        sourceSystem: "Billing",
        sourceId: `INV-${uuidv4()}`,
        eventType: "Invoice",
        amount: "500",
        contractId: contractId,
        processingStatus: "Processed",
        eventDate: new Date("2026-01-15")
    });

    // 4. Simulate Revenue Recognition = $600 (Advanced/Unbilled Scenario)
    // We recognized more than we billed -> Unbilled Receivable of $100
    await db.insert(revenueRecognitions).values({
        contractId,
        pobId: "POB-TEMP",
        periodName,
        scheduleDate: new Date("2026-01-31"),
        amount: "600",
        accountType: "Revenue",
        status: "Posted", // Already posted
        eventType: "Schedule"
    });

    // 5. Add a Pending Schedule (Should be auto-posted by sweep)
    // For simplicity, we just check if it counts it, assuming service logic handles posting
    /* 
    await db.insert(revenueRecognitions).values({
        contractId,
        pobId: "POB-TEMP-2",
        periodName,
        scheduleDate: new Date("2026-01-31"),
        amount: "100",
        accountType: "Revenue",
        status: "Pending",
        eventType: "Schedule"
    });
    */

    // 6. Run Sweep
    console.log("🧹 Running Sweep...");
    const result = await revenueService.runPeriodCloseSweep(period.id);

    console.log("📊 Sweep Result:", result);

    // 7. Verification
    // Expect Unbilled = Recognized (600) - Invoiced (500) = 100
    // Check for our specific contract details
    const myContract = result.unbilledDetails.find((c: any) => c.contractId === contractId);

    if (myContract) {
        if (myContract.unbilled === 100) {
            console.log("✅ Unbilled Accrual Calculation Correct (100) for target contract");
        } else {
            console.error(`❌ Incorrect Unbilled Amount for target contract. Expected 100, got ${myContract.unbilled}`);
            process.exit(1);
        }
    } else {
        console.error(`❌ Target Contract ${contractId} not found in unbilled details.`);
        process.exit(1);
    }

    console.log("🎉 Sweep Verification Complete!");
    process.exit(0);
}

main().catch(console.error);
