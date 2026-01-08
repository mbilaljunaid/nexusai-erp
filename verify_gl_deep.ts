import { financeService } from "./server/services/finance";
import { InsertGlPeriod, InsertGlJournal, InsertGlJournalLine } from "./shared/schema";

async function runVerification() {
    console.log("Starting GL Deep Dive Verification...");

    // 1. Create a Test Period
    console.log("\n1. Creating Fiscal Period...");
    const periodData: InsertGlPeriod = {
        periodName: "Test-Deep-Period",
        fiscalYear: 2099,
        startDate: new Date("2099-01-01"),
        endDate: new Date("2099-01-31"),
        status: "Open"
    };
    const period = await financeService.createPeriod(periodData);
    console.log(`   Created Period: ${period.periodName} (${period.id})`);

    // 2. Create Accounts if needed (assuming some exist, but let's make sure)
    console.log("\n2. Ensuring Accounts exist...");
    const accounts = await financeService.listAccounts();
    let accountId1, accountId2;
    if (accounts.length < 2) {
        // Create dummy accounts
        const a1 = await financeService.createAccount({ accountCode: "9998", accountName: "Test Cash", accountType: "Asset" });
        const a2 = await financeService.createAccount({ accountCode: "9999", accountName: "Test Revenue", accountType: "Revenue" });
        accountId1 = a1.id;
        accountId2 = a2.id;
    } else {
        accountId1 = accounts[0].id;
        accountId2 = accounts[1].id;
    }

    // 3. Post a Journal
    console.log("\n3. Posting Journal...");
    const journalData: InsertGlJournal = {
        journalNumber: `BS-TEST-${Date.now()}`,
        periodId: period.id,
        description: "Test Deep Dive Journal",
        status: "Posted" // Directly posting for brevity
    };
    const linesData: Omit<InsertGlJournalLine, "journalId">[] = [
        { accountId: accountId1, debit: "100.00", credit: "0" },
        { accountId: accountId2, debit: "0", credit: "100.00" }
    ];

    await financeService.createJournal(journalData, linesData);
    console.log("   Journal Posted.");

    // 4. Check Trial Balance
    console.log("\n4. Verifying Trial Balance...");
    const tb = await financeService.calculateTrialBalance(period.id);
    const row1 = tb.find(r => r.accountId === accountId1);
    const row2 = tb.find(r => r.accountId === accountId2);

    console.log(`   Account ${row1?.accountCode}: Net ${row1?.netBalance} (Expected 100)`);
    console.log(`   Account ${row2?.accountCode}: Net ${row2?.netBalance} (Expected -100)`);

    if (row1?.netBalance === 100 && row2?.netBalance === -100) {
        console.log("   ✅ Trial Balance Correct.");
    } else {
        console.error("   ❌ Trial Balance Mismatch!");
    }

    // 5. Close Period
    console.log("\n5. Closing Period...");
    await financeService.closePeriod(period.id);
    console.log("   Period Closed.");

    // 6. Attempt Post in Closed Period
    console.log("\n6. Attempting Post in Closed Period (Expect Failure)...");
    try {
        await financeService.createJournal({
            journalNumber: `FAIL-${Date.now()}`,
            periodId: period.id,
            description: "Should Fail",
            status: "Draft"
        }, linesData);
        console.error("   ❌ Failed: Logic permitted posting to closed period!");
    } catch (e: any) {
        console.log(`   ✅ Success: Logic blocked posting - ${e.message}`);
    }

    process.exit(0);
}

runVerification().catch(console.error);
