
import 'dotenv/config';
import { financeService } from "../server/services/finance";
import { db } from "../server/db";
import { glReportDefinitions, glBalances, glJournals } from "@shared/schema";
import { eq } from "drizzle-orm";

async function testFSG() {
    console.log("Testing FSG Engine...");

    try {
        // 1. Get Balance Sheet Report ID
        const reports = await financeService.listReports();
        const bsReport = reports.find(r => r.name.includes("Balance Sheet"));
        if (!bsReport) throw new Error("Balance Sheet report not found. Did you seed?");
        console.log(`1. Found Balance Sheet: ${bsReport.id}`);

        // 2. Ensure we have Balances (using Posting Engine verification logic or manual check)
        // Let's create a fresh journal to ensure we have KNOWN data
        console.log("2. creating Test Data...");

        // Create Journal: Debit Cash (11000) 500, Credit Revenue (40000) 500
        // We'll use the Posting Engine directly if possible, or just mock balances if posting is heavy.
        // Let's use createJournal + postJournal to be thorough (Integration Test).

        const journal = await financeService.createJournal(
            {
                ledgerId: "primary-ledger-001",
                journalName: "FSG Test Journal " + Date.now(),
                periodId: "2026-01", // Assuming this period exists from previous seeds
                periodName: "Jan-2026",
                currencyCode: "USD",
                category: "Manual",
                description: "Test for FSG",
                source: "Manual"
            },
            [
                { lineNum: 1, accountId: "01-000-11000-000", debit: "500.00", credit: "0.00", description: "Cash - Test" },
                { lineNum: 2, accountId: "01-000-40000-000", debit: "0.00", credit: "500.00", description: "Revenue - Test" }
            ]
        );
        console.log(`   -> Created Journal ${journal.id}`);

        // Post it
        await financeService.postJournal(journal.id);
        console.log("   -> Posted Journal");

        // 3. Run FSG
        console.log("3. Running FSG Generation...");
        const reportGrid = await financeService.generateFinancialReport(bsReport.id, "Jan-2026", "primary-ledger-001");

        // 4. Verify Output
        console.log("4. Verifying Output...");
        // Find "Cash & Equivalents" row (Row 20)
        const cashRow = reportGrid.rows.find((r: any) => r.description === "Cash & Equivalents");
        if (!cashRow) throw new Error("Cash Row not found in output");

        const cashValue = cashRow.cells[0]; // Column 1: PTD
        console.log(`   -> Cash Row Value: ${cashValue}`);

        if (Math.abs(cashValue) >= 500) {
            console.log("SUCCESS: Cash value reflects the posted journal (>= 500).");
        } else {
            console.error("FAILURE: Cash value is less than 500. Balances update might have failed or Filtration logic is wrong.");
            console.log("Full Row:", JSON.stringify(cashRow));
        }

        // Check Liabilities/Equity if needed, but Cash is good proxy for "Assets" logic

    } catch (e) {
        console.error("Test Failed:", e);
        process.exit(1);
    }
    process.exit(0);
}

testFSG();
