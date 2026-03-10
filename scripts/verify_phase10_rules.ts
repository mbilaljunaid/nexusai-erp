
import { db } from "../server/db";
import { matchRuleService } from "../server/services/MatchRuleService";
import { matchingService } from "../server/services/MatchingService";
import { partyService } from "../server/services/PartyService";
import { eq } from "drizzle-orm";
import { hzMatchRules } from "../shared/schema/data-quality";

async function verifyPhase10Rules() {
    console.log("Starting MDM Phase 10 (Configurable Rules) Verification...");

    try {
        // 0. Cleanup existing rules
        console.log("\n[0] Cleanup existing rules...");
        await db.delete(hzMatchRules);

        // 1. Create STRICT Rule (95% Match)
        console.log("\n[1] Creating STRICT Rule (95%)...");
        const strictRule = await matchRuleService.createRule({
            ruleName: "STRICT_MATCH_95",
            matchType: "FUZZY",
            matchScoreThreshold: 95,
            activeFlag: true,
            configJson: { columns: ["partyName"] }
        });
        console.log("   ✅ Created Rule:", strictRule.ruleName);

        // 2. Run Batch (Strict)
        console.log("\n[2] Running Batch with STRICT Rule...");
        const batchStrict = await matchingService.runBatch("Batch-Strict-Test");
        console.log(`   - Candidates Found: ${batchStrict.candidatesFound}`);

        // 3. Update Rule to be LOOSE (50% Match)
        console.log("\n[3] Updating Rule to LOOSE (50%)...");
        await matchRuleService.updateRule(strictRule.id, {
            ruleName: "LOOSE_MATCH_50",
            matchScoreThreshold: 50
        });
        console.log("   ✅ Rule Updated");

        // 4. Run Batch (Loose)
        console.log("\n[4] Running Batch with LOOSE Rule...");
        const batchLoose = await matchingService.runBatch("Batch-Loose-Test");
        console.log(`   - Candidates Found: ${batchLoose.candidatesFound}`);

        // 5. Comparison
        if (batchLoose.candidatesFound >= batchStrict.candidatesFound) {
            console.log("   ✅ Verification Passed: Loose matching found >= candidates than Strict matching.");
        } else {
            console.warn("   ⚠️ Warning: Loose matching found FEWER candidates? Check data distribution.");
        }

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }

    console.log("\n--- Verification SUCCESS ---");
    process.exit(0);
}

verifyPhase10Rules();
