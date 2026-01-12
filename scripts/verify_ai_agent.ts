
import { aiService } from "../server/services/ai";
import { financeService } from "../server/services/finance";
import { storage } from "../server/storage";

async function verifyAI() {
    console.log("Starting AI Service Verification...");

    const userId = "test-user-ai";

    // 1. Verify Action Registration
    try {
        await aiService.initialize();
        console.log("✅ AI Actions Initialized");
    } catch (e) {
        console.error("❌ Failed to initialize AI actions", e);
    }

    // 2. Mock Data for GL Config
    let periodId = "";
    try {
        const ledgers = await financeService.listLedgers();
        if (ledgers.length === 0) {
            await financeService.createLedger({
                name: "AI Test Ledger",
                currencyCode: "USD",
                coaId: "default",
                calendarId: "monthly",
                description: "Test Ledger",
                status: "Active"
            } as any);
        }

        const periods = await financeService.listPeriods();
        if (periods.length === 0) {
            const p = await financeService.createPeriod({
                periodName: "Jan-2026",
                year: 2026,
                quarter: 1,
                periodNum: 1,
                startDate: new Date("2026-01-01"),
                endDate: new Date("2026-01-31"),
                status: "Open"
            } as any);
            periodId = p.id;
        } else {
            periodId = periods[0].id;
        }
    } catch (e) {
        console.warn("⚠️ Setup warning:", e);
    }

    // 3. Test Intent Parsing: GL Config
    try {
        const result = await aiService.parseIntent("Close period Jan-2026", userId, "finance");
        if (result.action?.actionName === "gl_configure_system" && result.params.action === "Close") {
            console.log("✅ Intent Parsed: gl_configure_system (Close Period) - Confidence: " + result.confidence);
        } else {
            console.error("❌ Intent Parsing Failed for GL Config", result);
        }
    } catch (e) { console.error("❌ Intent Parsing Error", e); }

    // 4. Test Intent Parsing: Journal Creation
    try {
        const result = await aiService.parseIntent("Post entry for travel expenses", userId, "finance");
        if (result.action?.actionName === "gl_create_journal") {
            console.log("✅ Intent Parsed: gl_create_journal - Confidence: " + result.confidence);
        } else {
            console.error("❌ Intent Parsing Failed for Journal Creation", result);
        }
    } catch (e) { console.error("❌ Intent Parsing Error", e); }

    // 5. Test Intent Parsing: Explanation
    try {
        const result = await aiService.parseIntent("Compare Jan-2026 and Feb-2026 performance", userId, "finance");
        // Note: My implementation looked for "variance" or "compare" + "period".
        if (result.action?.actionName === "gl_explain_variance") {
            console.log("✅ Intent Parsed: gl_explain_variance - Confidence: " + result.confidence);
        } else {
            console.error("❌ Intent Parsing Failed for Variance", result);
        }
    } catch (e) { console.error("❌ Intent Parsing Error", e); }

    console.log("AI Verification Complete.");
    process.exit(0);
}

verifyAI();
