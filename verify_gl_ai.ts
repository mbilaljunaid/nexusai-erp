import { financeService } from "./server/services/finance";
import { aiService } from "./server/services/ai";
import { storage } from "./server/storage";

async function verifyAI() {
    console.log("🤖 Starting AI GL Verification...");
    console.log("Storage Provider:", storage.constructor.name);
    await aiService.initialize(); // Register actions

    // 0. Setup Accounts
    console.log("0. Creating Accounts...");
    const a1 = await financeService.createAccount({ accountCode: "1000", accountName: "Cash", accountType: "Asset", enabled: true });
    const a2 = await financeService.createAccount({ accountCode: "2000", accountName: "Payables", accountType: "Liability", enabled: true });
    const aRev = await financeService.createAccount({ accountCode: "4000", accountName: "Revenue", accountType: "Revenue", enabled: true });

    // 1. Setup Data for Anomalies
    console.log("1. Setting up Anomaly Data...");
    // A. High Value Manual
    await financeService.createJournal({
        journalNumber: "JRN-ANOM-1",
        description: "Suspicious manual entry",
        source: "Manual",
        periodId: "per-1",
        status: "Posted"
    }, [
        { accountId: a1.id, debit: "150000", credit: "0" }, // > 10k
        { accountId: a2.id, debit: "0", credit: "150000" }
    ]);

    // B. Benford's Law Violation (Many entries starting with '9')
    // We already have some random data from previous runs, adding specific violation
    for (let i = 0; i < 30; i++) {
        await financeService.createJournal({
            journalNumber: `JRN-BEN-${i}`,
            description: "Fake data",
            source: "Manual",
            periodId: "per-1",
            status: "Posted"
        }, [
            { accountId: a1.id, debit: "900", credit: "0" }, // Starts with 9
            { accountId: a2.id, debit: "0", credit: "900" }
        ]);
    }

    // 2. Test Detect Anomalies Action via AI Service
    // We simulate the intent parsing "Detect anomalies please" -> gl_detect_anomalies
    console.log("2. Executing AI Action: gl_detect_anomalies...");
    const anomalies = await aiService.executeAction("user-1", "gl_detect_anomalies", {});

    console.log("   Anomalies Detected:", anomalies.length);
    anomalies.forEach((a: any) => console.log(`   - [${a.severity}] ${a.reason} (Ref: ${a.journalNumber || a.journalId})`));

    const highValueFound = anomalies.find((a: any) => a.reason.includes("High value"));
    const benfordFound = anomalies.find((a: any) => a.reason.includes("Benford"));

    if (highValueFound) console.log("✅ High Value Logic Verified.");
    else console.error("❌ High Value Logic Failed.");

    if (benfordFound) console.log("✅ Benford's Law Logic Verified.");
    else console.error("❌ Benford's Law Logic Failed (Might need more data points or check logic).");

    // 3. Test Variance Explanation
    console.log("3. Testing Variance Explanation...");
    // Setup two periods
    const p1 = await financeService.createPeriod({ periodName: "Period A", startDate: new Date("2026-01-01"), endDate: new Date("2026-01-31"), status: "Open" });
    const p2 = await financeService.createPeriod({ periodName: "Period B", startDate: new Date("2026-02-01"), endDate: new Date("2026-02-28"), status: "Open" });

    // Add activity to P2 but not P1 (Variance)
    await financeService.createJournal({
        journalNumber: "JRN-VAR-1", description: "Big Sales", periodId: p2.id, source: "Manual", status: "Posted"
    }, [
        { accountId: aRev.id, debit: "0", credit: "5000" },
        { accountId: a1.id, debit: "5000", credit: "0" }
    ]);

    // Call AI
    const analysis = await aiService.executeAction("user-1", "gl_explain_variance", { periodId: p2.id, benchmarkPeriodId: p1.id });
    console.log("   Variance Analysis Result:", analysis);

    if (analysis.length > 0 && analysis[0].explanation) {
        console.log("✅ Variance Logic Verified.");
    } else {
        console.error("❌ Variance Logic Failed.");
    }

    process.exit(0);
}

verifyAI().catch(e => {
    console.error(e);
    process.exit(1);
});
