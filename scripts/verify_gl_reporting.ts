
import 'dotenv/config';
import { glReportingService } from "../server/services/gl-reporting";
import { storage } from "../server/storage";
import { db } from "../server/db";

async function verifyGlReporting() {
    console.log("Starting GL Reporting Verification...");

    try {
        const periodName = "Jan-2026";
        const date = new Date("2026-01-31");

        // 1. Setup Data - Create Ledgers
        console.log("1. Creating Ledgers...");
        const usLedger = await storage.createGlLedger({ name: `US Ledger ${Date.now()}`, currencyCode: "USD" });
        const euLedger = await storage.createGlLedger({ name: `EU Ledger ${Date.now()}`, currencyCode: "EUR" });

        // 2. Setup Daily Rate (EUR -> USD = 1.1)
        console.log("2. Creating Exchange Rate...");
        await storage.createGlDailyRate({
            fromCurrency: "EUR",
            toCurrency: "USD",
            rate: "1.1",
            conversionDate: date,
            conversionType: "Spot"
        });

        // 3. Create Initial Balances
        console.log("3. Creating Balances...");
        // US: $1000 Cash
        await storage.upsertGlBalance({
            ledgerId: usLedger.id,
            codeCombinationId: "101-000-1000", // Cash
            currencyCode: "USD",
            periodName,
            periodNetDr: "1000",
            periodNetCr: "0",
            endBalance: "1000"
        });
        // EU: €500 Cash
        await storage.upsertGlBalance({
            ledgerId: euLedger.id,
            codeCombinationId: "101-000-1000", // Cash
            currencyCode: "EUR", // Functional Currency
            periodName,
            periodNetDr: "500",
            periodNetCr: "0",
            endBalance: "500"
        });

        // 4. Run Translation on EU Ledger (EUR -> USD)
        // Expect: 500 * 1.1 = 550 USD
        console.log("4. Running Translation...");
        const translated = await glReportingService.translateBalances(euLedger.id, periodName, "USD", date);
        console.log(`Translated check: ${translated[0].endBalance} USD (Expected 550)`);

        if (Number(translated[0].endBalance) !== 550) {
            throw new Error("Translation Failed: Result mismatch");
        }

        // 5. Setup Ledger Set
        console.log("5. Setting up Ledger Set...");
        const set = await storage.createGlLedgerSet({ name: `Global Set ${Date.now()}` });
        await storage.addLedgerToSet({ ledgerSetId: set.id, ledgerId: usLedger.id });
        await storage.addLedgerToSet({ ledgerSetId: set.id, ledgerId: euLedger.id });

        // 6. Run Consolidation
        // Expect: 1000 (US) + 550 (EU Translated) = 1550 USD
        console.log("6. Running Consolidation...");
        const consolidated = await glReportingService.getConsolidatedBalances(set.id, periodName, "USD");
        const totalCash = consolidated.find(c => c.codeCombinationId === "101-000-1000");

        console.log(`Consolidated Total: ${totalCash?.endBalance} USD (Expected 1550)`);

        if (totalCash?.endBalance !== 1550) {
            throw new Error("Consolidation Failed: Total mismatch");
        }

        console.log("\n✅ GL Reporting Verification Passed!");
        process.exit(0);

    } catch (error) {
        console.error("Verification Failed:", error);
        process.exit(1);
    }
}

verifyGlReporting();
