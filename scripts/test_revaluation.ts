
import { db } from "../server/db";
import {
    glAccounts, glPeriods, glJournals, glJournalLines,
    glCodeCombinations, glIntercompanyRules, glDailyRates, glRevaluations
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { financeService } from "../server/services/finance";
import { randomUUID } from "crypto";

async function testRevaluation() {
    console.log("Starting Revaluation Test...");

    // 1. Setup Data
    const periodName = "Jan-2026";
    const currency = "EUR";
    const ledgerId = "primary-ledger-001";

    // Ensure Period
    let period = await db.query.glPeriods.findFirst({
        where: eq(glPeriods.periodName, periodName)
    });

    if (!period) {
        console.log("Creating Period...");
        [period] = await db.insert(glPeriods).values({
            periodName,
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-01-31"),
            fiscalYear: 2026,
            status: "Open"
        }).returning();
    }

    // Ensure Rates (EUR -> USD)
    // Transaction Rate: 0.90 (Jan 15)
    // End Rate: 0.85 (Jan 31)

    const endDate = new Date("2026-01-31");
    await db.insert(glDailyRates).values({
        fromCurrency: currency,
        toCurrency: "USD",
        conversionDate: endDate,
        conversionType: "Spot",
        rate: "0.85"
    });
    console.log("Seeded End Rate 0.85");

    // Ensure Accounts
    // 1. Cash (Asset)
    // 2. Unrealized Gain/Loss (Expense/Revenue)

    let cashAccount = await db.query.glAccounts.findFirst({ where: eq(glAccounts.accountCode, "1111-EUR") });
    if (!cashAccount) {
        [cashAccount] = await db.insert(glAccounts).values({
            accountCode: "1111-EUR",
            accountName: "EUR Cash",
            accountType: "Asset"
        }).returning();
    }

    let unrealizedAccount = await db.query.glAccounts.findFirst({ where: eq(glAccounts.accountCode, "7900") });
    if (!unrealizedAccount) {
        [unrealizedAccount] = await db.insert(glAccounts).values({
            accountCode: "7900",
            accountName: "Unrealized Gain/Loss",
            accountType: "Expense"
        }).returning();
    }

    // 2. Create Transaction (Jan 15)
    // Debit Cash 1000 EUR @ 0.90 = 900 USD
    console.log("Creating Source Journal...");
    const journal = await financeService.createJournal({
        journalNumber: `JE-EUR-${Date.now()}`,
        periodId: period.id,
        description: "Initial EUR Deposit",
        source: "Manual",
        status: "Draft",
        date: new Date("2026-01-15")
    } as any, [
        {
            accountId: cashAccount.id,
            description: "Cash Deposit",
            enteredDebit: "1000.00",
            enteredCredit: "0.00",
            currencyCode: "EUR",
            exchangeRate: "0.90"
            // financeService will calc accounted: 900
        },
        {
            accountId: unrealizedAccount.id, // Offset to balance (normally Revenue/Equity)
            description: "Offset",
            enteredDebit: "0.00",
            enteredCredit: "1000.00",
            currencyCode: "EUR",
            exchangeRate: "0.90"
        }
    ]);

    // Post it
    await financeService.postJournal(journal.id);
    console.log("Source Journal Posted.");

    // 3. Run Revaluation
    // Target: 1000 EUR * 0.85 = 850 USD.
    // Current: 900 USD.
    // Variance: -50 USD.
    // Expect: Credit Cash 50 (reduce asset), Debit Unrealized Loss 50.

    console.log("Running Revaluation...");
    const result = await financeService.runRevaluation(
        ledgerId,
        periodName,
        currency,
        "Spot",
        unrealizedAccount.id
    );

    if (result.success) {
        console.log(`Revaluation Successful. Journal ID: ${result.journalId}`);
        console.log(`Total Variance: ${result.totalVariance}`);

        // Verify Lines
        const lines = await financeService.getJournalLines(result.journalId);
        console.log("Revaluation Journal Lines:", JSON.stringify(lines, null, 2));

        if (Math.abs(result.totalVariance + 50) < 0.01) {
            console.log("SUCCESS: Variance matches expected -50 USD.");
        } else {
            console.error(`FAILURE: Expected -50, got ${result.totalVariance}`);
            process.exit(1);
        }
    } else {
        console.log(result.message);
    }
}

testRevaluation().catch(console.error);
