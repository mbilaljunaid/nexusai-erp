
import { db } from "../server/db";
import { treasuryCounterparties, treasuryFxDeals, treasuryRiskLimits, treasuryMarketRates } from "@shared/schema";
import { treasuryService } from "../server/services/TreasuryService";
import { eq, sql } from "drizzle-orm";

async function verifyPhase2() {
    console.log("🔍 Starting Treasury Phase 2 Verification (FX & Risk)...");

    try {
        // 1. Create a Test Counterparty
        console.log("Creating Counterparty...");
        const cp = await treasuryService.createCounterparty({
            name: "verify_ph2_bank",
            type: "BANK",
            active: true
        });
        console.log(`✅ Counterparty created: ${cp.id}`);

        // 2. Set Risk Limit (Max 1M USD Exposure)
        console.log("Setting Risk Limit...");
        await treasuryService.createRiskLimit({
            counterpartyId: cp.id,
            limitType: "GLOBAL_EXPOSURE",
            amount: "1000000.00", // 1M
            currency: "USD",
            maxAmount: "1000000.00"
        });
        console.log("✅ Risk Limit set to 1,000,000 USD");

        // 3. Create First FX Deal (Forward Buy EUR 500k vs USD)
        // Assume Rate 1.10 => 550k USD Exposure
        console.log("Booking Deal 1 (500k EUR Buy @ 1.10)...");
        const deal1 = await treasuryService.createFxDeal({
            dealNumber: `FX-TEST-1-${Date.now()}`,
            dealType: "FORWARD",
            counterpartyId: cp.id,
            buyCurrency: "EUR",
            sellCurrency: "USD",
            buyAmount: "500000.00",
            sellAmount: "550000.00",
            exchangeRate: "1.100000",
            valueDate: new Date("2026-06-30"),
            tradeDate: new Date()
        });
        console.log(`✅ Deal 1 booked: ${deal1.dealNumber} (Status: ${deal1.status})`);

        // 4. Update Status to CONFIRMED (to count towards exposure)
        // Note: Our simplified checkLimitBreach currently checks for 'CONFIRMED' deals + the new deal amount.
        // The deal we just created is DRAFT (by default in createFxDeal unless we passed status).
        // Let's manually update it to CONFIRMED so it counts for the NEXT check.
        // Wait, createFxDeal logic: checkLimitBreach -> Insert.
        // checkLimitBreach sums CONFIRMED deals. Current deal is not yet inserted.
        // So Deal 1 (550k) passed because 0 existing exposure + 550k < 1M.

        // Now we confirm it.
        await db.update(treasuryFxDeals).set({ status: 'CONFIRMED' }).where(eq(treasuryFxDeals.id, deal1.id));
        console.log("✅ Deal 1 Confirmed.");

        // 5. Attempt Breach Deal (Another 600k EUR Buy @ 1.10 => 660k USD)
        // Total Exposure would be 550k + 660k = 1.21M > 1M Limit.
        console.log("Booking Deal 2 (Breach Attempt)...");
        try {
            await treasuryService.createFxDeal({
                dealNumber: `FX-TEST-2-${Date.now()}`,
                dealType: "SPOT",
                counterpartyId: cp.id,
                buyCurrency: "EUR",
                sellCurrency: "USD",
                buyAmount: "600000.00",
                sellAmount: "660000.00",
                exchangeRate: "1.100000",
                valueDate: new Date(),
                tradeDate: new Date()
            });
            console.error("❌ Deal 2 should have failed but succeeded!");
            process.exit(1);
        } catch (e: any) {
            if (e.message.includes("Risk Limit Breached")) {
                console.log("✅ Deal 2 blocked correctly by Risk Engine.");
            } else {
                console.error("❌ Unexpected error:", e);
                process.exit(1);
            }
        }

        // 6. Verification of Mark-to-Market
        // Deal 1: Bought 500k EUR @ 1.10.
        // Market moves to 1.12 (We made profit: (1.12 - 1.10) * 500k = 0.02 * 500k = 10k USD)
        console.log("Updating Market Rates (EUR/USD = 1.12)...");
        await treasuryService.updateMarketRates([{
            rateType: "FX_SPOT",
            currencyPair: "EUR/USD",
            rate: "1.120000",
            date: new Date(),
        }]);

        console.log("Running Revaluation...");
        const mtm = await treasuryService.calculateMarkToMarket(deal1.id);
        console.log(`✅ MtM Calculated: ${mtm} (Expected ~10000)`);

        if (Math.abs(mtm - 10000) < 0.01) {
            console.log("✅ Valuation Logic Correct.");
        } else {
            console.error("❌ Valuation Logic Incorrect.");
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }

    console.log("🎉 Treasury Phase 2 Verification Passed 100%!");
    process.exit(0);
}

verifyPhase2();
