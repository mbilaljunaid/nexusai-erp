
import { db } from "../server/db";
import { cashBankAccounts, glDailyRates, cashRevaluationHistory } from "@shared/schema";
import { cashRevaluationService } from "../server/services/cash-revaluation.service";
import { eq, desc } from "drizzle-orm";

async function verifyCashRevaluation() {
    console.log("🛠️ Starting Cash Revaluation Controls Verification...");

    // 1. Setup Test Account
    const testAccountId = "test-reval-acc-" + Date.now();
    await db.insert(cashBankAccounts).values({
        id: testAccountId,
        name: "Test EUR Account",
        bankName: "Test Bank",
        accountNumber: "EUR-123456",
        currency: "EUR",
        currentBalance: "1000.00",
        active: true
    });
    console.log("✅ Created Test Account:", testAccountId);

    // 2. Seed System Rate (1.2)
    await db.insert(glDailyRates).values({
        fromCurrency: "EUR",
        toCurrency: "USD",
        conversionDate: new Date(),
        conversionType: "Corporate",
        rate: "1.200000"
    });
    console.log("✅ Seeded System Rate: 1.2");

    // 3. Run Revaluation with MANUAL OVERRIDE (1.5)
    console.log("🔄 Running postRevaluation with override: 1.5...");
    const result = await cashRevaluationService.postRevaluation(testAccountId, "test-runner", 1.5);

    console.log("📊 Result:", result);

    if (result.status !== "Posted") {
        console.error("❌ Failed: Status is not Posted");
        process.exit(1);
    }

    if (Number(result.usedRate) !== 1.5) {
        console.error(`❌ Failed: Used Rate is ${result.usedRate}, expected 1.5`);
        process.exit(1);
    }

    // 4. Verify History Log
    const history = await db.select().from(cashRevaluationHistory)
        .where(eq(cashRevaluationHistory.bankAccountId, testAccountId))
        .orderBy(desc(cashRevaluationHistory.revaluationDate));

    if (history.length === 0) {
        console.error("❌ Failed: No history entry found");
        process.exit(1);
    }

    const entry = history[0];
    console.log("📜 History Entry:", {
        rateType: entry.rateType,
        usedRate: entry.usedRate,
        systemRate: entry.systemRate,
        gainLoss: entry.unrealizedGainLoss
    });

    if (entry.rateType === "User" && Number(entry.usedRate) === 1.5) {
        console.log("✅ SUCCESS: History correctly recorded manual override.");
    } else {
        console.error("❌ Failed: History entry data mismatch.");
        process.exit(1);
    }

    process.exit(0);
}

verifyCashRevaluation().catch(console.error);
