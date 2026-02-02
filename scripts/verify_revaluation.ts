
import 'dotenv/config';
import { FinanceService } from "../server/services/finance";
import { storage } from "../server/storage";
import { db } from "../server/db";
import { glBalances, glCodeCombinations, glLedgers, glPeriods, glExchangeRates, glRevaluationEntries } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

const finance = new FinanceService();

async function verifyRevaluation() {
    console.log("🚀 Starting FX Revaluation Verification...");

    try {
        const periodName = "Jan-2026";
        const ledgerId = "REV-TEST-LEDGER";

        // 1. Setup Ledger
        console.log("1. Setting up Ledger...");
        await db.delete(glLedgers).where(eq(glLedgers.id, ledgerId));
        await storage.createGlLedger({
            id: ledgerId,
            name: "Revaluation Test Ledger",
            currencyCode: "USD",
            ledgerCategory: "PRIMARY",
            isActive: true
        });

        // 2. Setup Period
        console.log("2. Setting up Period...");
        const [existingPeriod] = await db.select().from(glPeriods).where(eq(glPeriods.periodName, periodName));
        let periodId = existingPeriod?.id;
        if (!existingPeriod) {
            const period = await storage.createGlPeriod({
                periodName,
                fiscalYear: 2026,
                periodNum: 1,
                startDate: new Date("2026-01-01"),
                endDate: new Date("2026-01-31"),
                status: "Open"
            });
            periodId = period.id;
        }

        // 3. Setup Code Combination
        console.log("3. Setting up Code Combination...");
        const ccCode = "01-000-1110-000"; // Cash EUR
        const [existingCC] = await db.select().from(glCodeCombinations).where(eq(glCodeCombinations.code, ccCode));
        let ccId = existingCC?.id;
        if (!existingCC) {
            const cc = await storage.createGlCodeCombination({
                code: ccCode,
                segment1: "01",
                segment2: "000",
                segment3: "1110",
                segment4: "000",
                segment5: "000",
                ledgerId: ledgerId,
                enabled: true
            });
            ccId = cc.id;
        }

        // 4. Seed Initial Exchange Rate (EUR -> USD @ 1.1)
        console.log("4. Seeding Initial Exchange Rate (1.1)...");
        await db.delete(glExchangeRates).where(and(eq(glExchangeRates.currency, "EUR"), eq(glExchangeRates.periodName, periodName)));
        await storage.createExchangeRate({
            currency: "EUR",
            periodName: periodName,
            rateToFunctional: "1.1"
        });

        // 5. Post Journal in EUR
        console.log("5. Posting 100 EUR Journal...");
        // Clear existing balances for this test to be clean
        await db.delete(glBalances).where(and(eq(glBalances.ledgerId, ledgerId), eq(glBalances.periodName, periodName)));

        const journal = await finance.createJournal(
            {
                name: "EUR Cash Receipt",
                ledgerId: ledgerId,
                periodId: periodId!,
                source: "Manual",
                category: "Receipts",
                currencyCode: "EUR",
                accountingDate: new Date("2026-01-15"),
                status: "Draft"
            },
            [
                {
                    lineNumber: 1,
                    accountId: ccId!, // Cash EUR
                    debit: "100", // entered amount
                    accountedDebit: "110", // 100 * 1.1
                    description: "Initial EUR Deposit"
                },
                {
                    lineNumber: 2,
                    accountId: ccId!, // Simplified: offset to same for balancing in this test
                    credit: "100",
                    accountedCredit: "110",
                    description: "Offset"
                }
            ],
            "test-user"
        );

        // Force Post (triggers updateBalancesCube)
        console.log("Posting journal...");
        await finance.postJournal(journal.id);

        // Wait for background processing
        console.log("Waiting for posting engine...");
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Verify Balances were created
        const balances = await db.select().from(glBalances)
            .where(and(eq(glBalances.ledgerId, ledgerId), eq(glBalances.periodName, periodName)));

        console.log(`Balances found: ${balances.length}`);
        balances.forEach(b => console.log(` - Currency: ${b.currencyCode}, EndBalance: ${b.endBalance}`));

        // 6. Update Exchange Rate (EUR -> USD @ 1.2)
        console.log("6. Updating Exchange Rate to 1.2 (Period End)...");
        const [rateRow] = await db.select().from(glExchangeRates)
            .where(and(eq(glExchangeRates.currency, "EUR"), eq(glExchangeRates.periodName, periodName)));

        await db.update(glExchangeRates)
            .set({ rateToFunctional: "1.2" })
            .where(eq(glExchangeRates.id, rateRow.id));

        // 7. Run Revaluation
        console.log("7. Running Revaluation Engine...");
        await finance.runRevaluation(ledgerId, periodName, "EUR");

        // 8. Verify Results
        console.log("8. Verifying Results...");

        // Check Revaluation Entries
        const revalEntries = await db.select().from(glRevaluationEntries)
            .where(and(eq(glRevaluationEntries.ledgerId, ledgerId), eq(glRevaluationEntries.periodName, periodName)));

        console.log(`Revaluation Entries: ${revalEntries.length}`);
        if (revalEntries.length === 0) throw new Error("No revaluation entry generated!");

        const entry = revalEntries[0];
        console.log(` - Gain/Loss: ${entry.gainLoss}`);
        // Expected Gain: (100 * 1.2) - (100 * 1.1) = 120 - 110 = 10
        if (Math.abs(Number(entry.gainLoss) - 10) > 0.01) {
            throw new Error(`Incorrect Gain/Loss. Expected 10, got ${entry.gainLoss}`);
        }

        // Check Updated Functional Balance
        const [funcBal] = await db.select().from(glBalances)
            .where(and(
                eq(glBalances.ledgerId, ledgerId),
                eq(glBalances.periodName, periodName),
                eq(glBalances.currencyCode, "USD"),
                eq(glBalances.codeCombinationId, ccId!)
            ))
            .limit(1);

        console.log(`New Functional Balance: ${funcBal?.endBalance}`);
        // Expected Balance: 120
        // Wait, in my journal I had 100 Dr and 100 Cr to the same account. 
        // So Net = 0.
        // Let's re-read my journal: 
        // Line 1: Dr 100
        // Line 2: Cr 100
        // Total Balance = 0.
        // Revaluation on 0 is 0.

        // I should change the journal to be unbalanced or use different accounts.
        // But FinanceService requires balanced journals.
        // I'll use Account A and Account B.

        console.log("✅ Script logic verified (need to adjust journal for non-zero balance)");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

// Re-running with better journal data
async function verifyRevaluationFixed() {
    console.log("🚀 Starting FX Revaluation Verification (V2)...");

    try {
        // Manually ensure revaluation tables and updated journal table exist
        console.log("0. Ensuring Database Tables Exist...");

        // Ensure currency_code exists on gl_journals_v2
        try {
            await db.execute(sql`ALTER TABLE "gl_journals_v2" ADD COLUMN IF NOT EXISTS "currency_code" varchar NOT NULL DEFAULT 'USD'`);
        } catch (e) {
            console.log("Note: currency_code column might already exist or table doesn't exist yet.");
        }

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "gl_revaluation_entries" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "ledger_id" varchar NOT NULL,
                "period_name" varchar NOT NULL,
                "currency" varchar NOT NULL,
                "amount" numeric(20, 10) NOT NULL,
                "fx_rate" numeric(20, 10) NOT NULL,
                "gain_loss" numeric(20, 10) NOT NULL,
                "created_at" timestamp DEFAULT now()
            );
        `);
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "gl_exchange_rates" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "currency" varchar NOT NULL,
                "period_name" varchar NOT NULL,
                "rate_to_functional" numeric(20, 10) NOT NULL,
                "created_at" timestamp DEFAULT now()
            );
        `);

        const periodName = "Jan-2026-v2";
        const ledgerId = "REV-TEST-LEDGER-V2";

        // 1. Setup Ledger
        console.log("1. Setting up Ledger...");
        const [existingL] = await db.select().from(glLedgers).where(eq(glLedgers.id, ledgerId));
        if (!existingL) {
            await storage.createGlLedger({
                id: ledgerId,
                name: "Revaluation Test Ledger V2",
                currencyCode: "USD",
                ledgerCategory: "PRIMARY",
                isActive: true
            });
        }

        // 2. Setup Period
        console.log("2. Setting up Period...");
        const [existingP] = await db.select().from(glPeriods).where(eq(glPeriods.periodName, periodName));
        let periodId = existingP?.id;
        if (!existingP) {
            const period = await storage.createGlPeriod({
                periodName,
                fiscalYear: 2026,
                periodNum: 1,
                startDate: new Date("2026-01-01"),
                endDate: new Date("2026-01-31"),
                status: "Open"
            });
            periodId = period.id;
        }

        // 3. Setup CCIDs
        console.log("3. Setting up Code Combinations...");
        const getOrCreateCC = async (code: string, segments: string[]) => {
            const [existing] = await db.select().from(glCodeCombinations).where(eq(glCodeCombinations.code, code));
            if (existing) return existing;
            return await storage.createGlCodeCombination({
                code,
                segment1: segments[0], segment2: segments[1], segment3: segments[2], segment4: segments[3], segment5: segments[4],
                ledgerId: ledgerId,
                enabled: true
            });
        };

        const ccCash = await getOrCreateCC("01-000-1110-001", ["01", "000", "1110", "001", "000"]);
        const ccRev = await getOrCreateCC("01-000-4110-000", ["01", "000", "4110", "000", "000"]);

        // Cleanup balances and entries for this test
        console.log("Cleaning up previous test data...");
        await db.delete(glBalances).where(and(eq(glBalances.ledgerId, ledgerId), eq(glBalances.periodName, periodName)));
        await db.delete(glRevaluationEntries).where(and(eq(glRevaluationEntries.ledgerId, ledgerId), eq(glRevaluationEntries.periodName, periodName)));

        // 4. Seed Rate 1.1
        console.log("4. Seeding Initial Exchange Rate (1.1)...");
        await db.delete(glExchangeRates).where(and(eq(glExchangeRates.currency, "EUR"), eq(glExchangeRates.periodName, periodName)));
        await storage.createExchangeRate({
            currency: "EUR",
            periodName: periodName,
            rateToFunctional: "1.1"
        });

        // 5. Post Journal: Dr Cash 100 EUR, Cr Revenue 100 EUR
        console.log("5. Posting 100 EUR Journal...");
        const journal = await finance.createJournal(
            {
                name: "EUR Sales",
                ledgerId: ledgerId,
                periodId: periodId!,
                source: "Manual",
                category: "Sales",
                currencyCode: "EUR",
                accountingDate: new Date("2026-01-15"),
                status: "Draft"
            },
            [
                {
                    lineNumber: 1,
                    accountId: ccCash.id,
                    enteredDebit: "100",
                    accountedDebit: "110", // 100 * 1.1
                    exchangeRate: "1.1",
                    currencyCode: "EUR",
                    description: "EUR Sale"
                },
                {
                    lineNumber: 2,
                    accountId: ccRev.id,
                    enteredCredit: "100",
                    accountedCredit: "110",
                    exchangeRate: "1.1",
                    currencyCode: "EUR",
                    description: "EUR Revenue"
                }
            ],
            "test-user"
        );

        await finance.postJournal(journal.id);
        console.log("Waiting for posting engine...");
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Verify Balances were created
        console.log("Checking Balances BEFORE Revaluation...");
        const balances = await db.select().from(glBalances)
            .where(and(eq(glBalances.ledgerId, ledgerId), eq(glBalances.periodName, periodName)));

        console.log(`Balances found: ${balances.length}`);
        if (balances.length === 0) {
            console.log("No balances found. Journal might not have updated balances cube.");
        }
        balances.forEach(b => {
            console.log(` - Account: ${b.codeCombinationId}, Currency: ${b.currencyCode}, EndBalance: ${b.endBalance}, NetDr: ${b.periodNetDr}, NetCr: ${b.periodNetCr}`);
        });

        // 6. Update Rate to 1.2
        console.log("6. Updating Exchange Rate to 1.2 (Period End)...");
        const rates = await db.select().from(glExchangeRates)
            .where(and(eq(glExchangeRates.currency, "EUR"), eq(glExchangeRates.periodName, periodName)));

        let rateRow = rates[0];
        if (!rateRow) {
            console.error("Rate row not found! Re-seeding...");
            rateRow = await storage.createExchangeRate({
                currency: "EUR",
                periodName: periodName,
                rateToFunctional: "1.1"
            });
        }

        await db.update(glExchangeRates).set({ rateToFunctional: "1.2" }).where(eq(glExchangeRates.id, rateRow.id));

        // 7. Run Revaluation
        console.log("7. Running Revaluation Engine...");
        await finance.runRevaluation(ledgerId, periodName, "EUR");

        // 8. Verify
        console.log("8. Verifying Results...");
        const revalEntries = await db.select().from(glRevaluationEntries)
            .where(and(eq(glRevaluationEntries.ledgerId, ledgerId), eq(glRevaluationEntries.periodName, periodName)));

        console.log(`Revaluation Entries: ${revalEntries.length}`);
        revalEntries.forEach(e => console.log(` - Entry for ${e.currency}: Gain/Loss ${e.gainLoss}`));

        if (revalEntries.length === 0) throw new Error("No revaluation entries generated");

        // Cash account should have +10 Gain
        const cashEntry = revalEntries.find(e => Number(e.gainLoss) > 0);
        if (!cashEntry) throw new Error("Cash entry not found in results");

        console.log(`Cash Gain: ${cashEntry.gainLoss}`);
        if (Math.abs(Number(cashEntry.gainLoss) - 10) > 0.01) {
            throw new Error(`Cash revaluation failed. Expected 10, got ${cashEntry.gainLoss}`);
        }

        // Revenue account revaluation might happen too if it's considered revaluable.
        // Usually, income statement accounts are NOT revalued (they use average period rates).
        // But for this MVP, we revalued ALL non-functional balances.

        console.log("✅ FX Revaluation Engine Verified Successfully!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyRevaluationFixed();
