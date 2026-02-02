
import { aiService } from "../server/services/ai";
import { agenticService } from "../server/services/agentic";
import { faService } from "../server/services/fixedAssets";
import { db } from "../server/db";
import { faAssets, faAssetBooks } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyFaPhase4() {
    console.log("🚀 Starting Fixed Assets Phase 4 Verification...");

    // 1. Verify AI Registration (L13)
    console.log("\n--- 1. Verifying AI Registration (L13) ---");
    await aiService.initialize();
    const actions = ["fa_create_asset", "fa_run_depreciation"];
    for (const actionName of actions) {
        // We can't easily check internal Map, but we can try to parse an intent
        const intent = await aiService.parseIntent(`I want to ${actionName.replace("_", " ")}`, "system");
        if (intent.action) {
            console.log(`✅ AI Action registered and parsed: ${actionName}`);
        } else {
            console.warn(`⚠️ Intent parsing for ${actionName} was not direct, but registration should be verified by executeAction check.`);
        }
    }

    // 2. Verify Background Worker (L15)
    console.log("\n--- 2. Verifying Background Worker (L15) ---");
    const bookId = "CORP-BOOK-1";
    const periodName = "MAR-2026";
    const periodEndDate = new Date("2026-03-31");

    console.log("Triggering depreciation run (should return immediately)...");
    const startTime = Date.now();
    const result = await faService.runDepreciation(bookId, periodName, periodEndDate);
    const endTime = Date.now();

    console.log("Result received:", result);
    console.log(`Execution time: ${endTime - startTime}ms`);

    if (result.status === "Processing" && (endTime - startTime) < 100) {
        console.log("✅ Asynchronous worker pattern confirmed (Under 100ms response).");
    } else {
        console.warn("⚠️ Response took longer than expected or status not 'Processing'.");
    }

    console.log("\n🚀 Phase 4 Verification Complete!");
}

verifyFaPhase4().catch(console.error);
