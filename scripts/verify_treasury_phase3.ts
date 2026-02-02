
import { db } from "../server/db";
import {
    apInvoices, arInvoices, treasuryDeals, treasuryInstallments, treasuryFxDeals, treasuryCashForecasts, apPayments,
    apSuppliers, apSupplierSites, arCustomers, treasuryCounterparties
} from "@shared/schema";
import { cashForecastService } from "../server/services/CashForecastService";
import { eq, sql, and } from "drizzle-orm";

async function verifyPhase3() {
    console.log("🔍 Starting Treasury Phase 3 Verification (Forecasting & AI)...");

    try {
        const testId = `TEST-${Date.now()}`;
        const futureDate10 = new Date(); futureDate10.setDate(futureDate10.getDate() + 10);
        const futureDate15 = new Date(); futureDate15.setDate(futureDate15.getDate() + 15);
        const futureDate20 = new Date(); futureDate20.setDate(futureDate20.getDate() + 20);

        // 1. Seed Dummy Data
        console.log("Seeding Dummy Financial Data...");

        // AP Invoice (Outflow 5000)
        // Need supplier
        const [supplier] = await db.insert(apSuppliers).values({
            name: `Sup-${testId}`,
            taxId: testId,
            employeeCount: 10
        }).returning();

        const [site] = await db.insert(apSupplierSites).values({
            supplierId: supplier.id,
            siteName: "HQ",
            addressLine1: "123 St",
            city: "City",
            country: "US"
        }).returning();

        const [apInv] = await db.insert(apInvoices).values({
            invoiceNumber: `AP-${testId}`,
            supplierId: supplier.id,
            supplierSiteId: site.id,
            invoiceAmount: "5000.00",
            currency: "USD",
            invoiceDate: new Date(),
            dueDate: futureDate10,
            status: "APPROVED" // Assuming approved items are forecasted
        }).returning();

        // Treasury Counterparty
        const [cp] = await db.insert(treasuryCounterparties).values({
            name: `Bank-${testId}`,
            type: "BANK",
            active: true
        }).returning();

        // Treasury Debt Deal (Installment Outflow 2000)
        // Service needs deal type.
        const [deal] = await db.insert(treasuryDeals).values({
            dealNumber: `DL-${testId}`,
            type: "DEBT",
            counterpartyId: cp.id,
            principalAmount: "100000.00",
            startDate: new Date(),
            status: "ACTIVE"
        }).returning();

        const [installment] = await db.insert(treasuryInstallments).values({
            dealId: deal.id,
            sequenceNumber: 1,
            dueDate: futureDate15,
            principalAmount: "1000.00",
            interestAmount: "1000.00",
            totalAmount: "2000.00",
            status: "PENDING"
        }).returning();

        // FX Deal (Confirmed Settlement Outflow/Inflow)
        // Buy EUR 1000, Sell USD 1100
        const [fx] = await db.insert(treasuryFxDeals).values({
            dealNumber: `FX-${testId}`,
            dealType: "SPOT",
            counterpartyId: cp.id,
            buyCurrency: "EUR",
            sellCurrency: "USD",
            buyAmount: "1000.00",
            sellAmount: "1100.00",
            exchangeRate: "1.10",
            valueDate: futureDate20,
            status: "CONFIRMED"
        }).returning();


        // 2. Run Forecast Generation
        console.log("Generating Cash Forecast...");
        await cashForecastService.generateForecast(30);

        // 3. Verify Forecast entries
        const forecasts = await db.select().from(treasuryCashForecasts).where(eq(treasuryCashForecasts.scenario, 'BASELINE'));

        const apForecast = forecasts.find(f => f.sourceId === String(apInv.id));
        const debtForecast = forecasts.find(f => f.sourceId === String(installment.id));
        const fxForecastIn = forecasts.find(f => f.sourceId === String(fx.id) && f.currency === 'EUR');
        const fxForecastOut = forecasts.find(f => f.sourceId === String(fx.id) && f.currency === 'USD');

        console.log("Verifying AP Forecast...");
        if (apForecast && Number(apForecast.amount) === -5000.00) {
            console.log("✅ AP Outflow forecasted correctly (-5000.00)");
        } else {
            console.error("❌ AP Forecast failed", apForecast);
            process.exit(1);
        }

        console.log("Verifying Debt Forecast...");
        if (debtForecast && Number(debtForecast.amount) === -2000.00) {
            console.log("✅ Debt Outflow forecasted correctly (-2000.00)");
        } else {
            console.error("❌ Debt Forecast failed", debtForecast);
            process.exit(1);
        }

        console.log("Verifying FX Forecast...");
        if (fxForecastIn && Number(fxForecastIn.amount) === 1000.00 && fxForecastOut && Number(fxForecastOut.amount) === -1100.00) {
            console.log("✅ FX Settlement flows forecasted correctly (+1000 EUR, -1100 USD)");
        } else {
            console.error("❌ FX Forecast failed", { in: fxForecastIn, out: fxForecastOut });
            process.exit(1);
        }

        // 4. Verify Anomaly Detection
        console.log("Testing Anomaly Detection...");
        // Insert history of 20 small payments (mean ~100)
        const pastPayments = [];
        for (let i = 0; i < 20; i++) {
            pastPayments.push({
                batchId: 0, // dummy
                amount: (100 + Math.random() * 10).toString(),
                currencyCode: "USD",
                paymentDate: new Date(),
                paymentMethodCode: "CHECK",
                paymentStatus: "NEGOTIABLE",
                supplierId: supplier.id
            });
        }
        await db.insert(apPayments).values(pastPayments);

        // Insert one Huge payment (100,000)
        const hugePayment = await db.insert(apPayments).values({
            batchId: 0,
            amount: "100000.00",
            currencyCode: "USD",
            paymentDate: new Date(),
            paymentMethodCode: "WIRE",
            paymentStatus: "NEGOTIABLE",
            supplierId: supplier.id
        }).returning();

        const anomalies = await cashForecastService.detectAnomalies();
        const found = anomalies.find(a => a.id === hugePayment[0].id);

        if (found) {
            console.log(`✅ Anomaly Detected: ${found.reason}`);
        } else {
            console.error("❌ High Value Payment NOT detected as anomaly!");
            console.log("Anomalies found:", anomalies);
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }

    console.log("🎉 Treasury Phase 3 Verification Passed 100%!");
    process.exit(0);
}

verifyPhase3();
