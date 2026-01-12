
import { db } from "../server/db";
import { cashForecasts } from "@shared/schema";
import { cashForecastService } from "../server/services/cash-forecast.service";
import { eq } from "drizzle-orm";

async function verifyForecast() {
    console.log("Verifying Manual Forecast...");

    // 1. Clean up existing forecasts for today
    await db.delete(cashForecasts).where(eq(cashForecasts.description, "Test Forecast Adjustment"));

    // 2. Insert a manual forecast for today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    await db.insert(cashForecasts).values({
        forecastDate: today,
        amount: "5000.00",
        description: "Test Forecast Adjustment",
        type: "MANUAL",
        currency: "USD"
    });
    console.log("Inserted manual forecast: +5000.00");

    // 3. Generate Forecast
    const forecast = await cashForecastService.generateForecast(today, 1, "BASELINE");
    const day0 = forecast[0];

    // 4. Verify Inflow includes the 5000 (assuming no other AR inflow or verifying the bump)
    // We can also check details
    const manualDetail = day0.details.find(d => d.source === "MANUAL" && d.entityName === "Test Forecast Adjustment");

    if (manualDetail) {
        console.log("✅ Found Manual Forecast Detail:", manualDetail);
    } else {
        console.error("❌ Manual Forecast Detail NOT found");
        process.exit(1);
    }

    if (manualDetail.amount === 5000) {
        console.log("✅ Amount matches: 5000");
    } else {
        console.error(`❌ Amount mismatch: Expected 5000, got ${manualDetail.amount}`);
        process.exit(1);
    }

    // Clean up
    await db.delete(cashForecasts).where(eq(cashForecasts.description, "Test Forecast Adjustment"));
    console.log("Verification Successful");
}

verifyForecast().catch(console.error);
