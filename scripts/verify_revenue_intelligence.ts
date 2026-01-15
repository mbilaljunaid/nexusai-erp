
import { db } from "../server/db";
import { revenueRecognitions, revenueContracts, revenueSourceEvents, revenueContractVersions } from "@shared/schema/revenue";
import { revenueService } from "../server/services/RevenueService";
import { revenueForecastingService } from "../server/services/RevenueForecastingService";
import { eq, sql } from "drizzle-orm";
import { addMonths, subMonths } from "date-fns";
import { v4 as uuidv4 } from 'uuid';

async function verifyRevenueIntelligence() {
    console.log("🔍 Starting Revenue Intelligence Verification...");

    try {
        // Test 1: Linear Regression Forecast
        console.log("\n1. Testing Revenue Forecasting (Linear Regression)...");

        // Seed some history
        await db.execute(sql`DELETE FROM ${revenueRecognitions} WHERE description LIKE '%ForecastTest%'`);
        const today = new Date();
        const baseAmount = 10000;

        // Create an upward trend (Month 0 to 11)
        for (let i = 11; i >= 0; i--) {
            await db.insert(revenueRecognitions).values({
                contractId: "temp-hist",
                pobId: "temp-hist-pob",
                periodName: `Hist-${i}`,
                scheduleDate: addMonths(subMonths(today, i), 0), // Use exactly similar logic, but make sure it falls inside.
                // Actually, simply using subMonths(today, i) where i < 12 is generally safe.
                // But the service calculates StartDate EXACTLY at invocation.
                // Let's use subMonths(today, i) but ensure today is "fresh" and maybe add a day to be safe from equality checks.
                amount: (baseAmount + (12 - i) * 1000).toString(),
                accountType: "Revenue",
                status: "Posted",
                eventType: "Schedule",
                description: "ForecastTest"
            });
        }

        const forecast = await revenueForecastingService.generateForecast(6, "temp-hist");
        console.log(`   - Slope: ${forecast.model.slope.toFixed(2)} (Should be ~1000)`);
        console.log(`   - 6-Month Projection: ${forecast.forecast[5].amount.toFixed(2)}`);

        if (forecast.model.slope > 800 && forecast.model.slope < 1200) {
            console.log("✅ Forecast Logic Valid (Trend Detected)");
        } else {
            console.error("❌ Forecast Logic Incorrect", forecast.model);
        }

        // Test 2: Risk Analysis
        console.log("\n2. Testing Contract Risk Analysis...");

        // Create a RISKY contract (High value, No billings, Old)
        const riskyContractId = uuidv4();
        await db.insert(revenueContracts).values({
            id: riskyContractId,
            contractNumber: `RISK-TEST-${Date.now()}`,
            customerId: "cust-risk",
            status: "Active",
            totalAllocatedPrice: "500000",
            totalTransactionPrice: "500000",
            ledgerId: "primary"
        });

        // Insert just a tiny recognized amount to avoid divide-by-zero, but keep liability high
        await db.insert(revenueRecognitions).values({
            contractId: riskyContractId,
            pobId: "risk-pob",
            periodName: "Jan-25",
            scheduleDate: new Date(),
            amount: "1000",
            accountType: "Revenue",
            status: "Posted",
            eventType: "Schedule"
        });

        // Add a very old Last Billing Date (or None)
        // Let's add one from 120 days ago to trigger "Churn Risk"
        await db.insert(revenueSourceEvents).values({
            contractId: riskyContractId,
            sourceId: "old-inv",
            eventType: "Invoice",
            amount: "100",
            eventDate: subMonths(new Date(), 4), // 4 months ago
            processingStatus: "Processed",
            sourceSystem: "Test",
            currency: "USD"
        });

        const riskAnalysis = await revenueService.analyzeContractRisk(riskyContractId);

        console.log(`   - Contract Liability: $${riskAnalysis.liability}`);
        console.log(`   - Risk Score: ${riskAnalysis.riskScore}`);
        console.log(`   - Risks Found: ${riskAnalysis.risks.length}`);
        riskAnalysis.risks.forEach(r => console.log(`     -> [${r.type}] ${r.description}`));

        if (riskAnalysis.risks.some(r => r.type === "HIGH_LIABILITY") && riskAnalysis.risks.some(r => r.type === "CHURN_RISK")) {
            console.log("✅ AI Risk Agent Correctly Flagged Contract");
        } else {
            console.error("❌ AI Risk Agent Failed to Flag Risks");
        }

        console.log("\n🎉 Intelligence Verification Complete!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyRevenueIntelligence();
