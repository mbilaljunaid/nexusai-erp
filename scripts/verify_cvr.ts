
import "dotenv/config";
import { db } from "../server/db";
import { glCrossValidationRules, glJournals, glJournalLines } from "../shared/schema/finance";
import { financeService } from "../server/services/finance";
import { eq } from "drizzle-orm";

async function verifyCVR() {
    console.log("Starting CVR Verification...");

    const ledgerId = "PRIMARY"; // Assuming default
    const ruleName = "BLOCK_EXPENSE_CC100";

    // 1. Clean up previous test
    const existing = await db.select().from(glCrossValidationRules).where(eq(glCrossValidationRules.ruleName, ruleName));
    if (existing.length > 0) {
        await financeService.deleteCrossValidationRule(existing[0].id);
        console.log("Cleaned up previous rule.");
    }

    // 2. Create CVR: Block Cost Center 100 for all Expenses (5000-5999)
    // Condition: Segment2=100
    // Validation: Segment3=5000-5999 (Exclude/Block this)

    // NOTE: Our logic in finance.ts checks: 
    // if matches(condition) AND matches(exclude) -> FAIL.

    await financeService.createCrossValidationRule({
        ruleName,
        ledgerId,
        description: "Test Rule",
        includeFilter: "segment2=100",
        excludeFilter: "segment3=5000-5999",
        errorMessage: "Cannot charge expenses to CC 100",
        errorAction: "Error",
        isEnabled: true
    });
    console.log("Created Blocking Rule.");

    // 3. Test PASS Case (CC 200, Exp 5000)
    console.log("Testing PASS case (CC 200)...");
    const resPass = await financeService.validateCodeCombination(ledgerId, {
        segment1: "01", segment2: "200", segment3: "5000"
    });
    if (!resPass.isValid) console.error("PASS Case Failed!", resPass.error);
    else console.log("PASS Case OK.");

    // 4. Test FAIL Case (CC 100, Exp 5000)
    console.log("Testing FAIL case (CC 100)...");
    const resFail = await financeService.validateCodeCombination(ledgerId, {
        segment1: "01", segment2: "100", segment3: "5000"
    });

    if (!resFail.isValid) {
        console.log("SUCCESS: Blocked invalid combination as expected.");
        console.log("Error Message:", resFail.error);
    } else {
        console.error("FAILURE: Invalid combination was ALLOWED!");
        process.exit(1);
    }

    // 5. Cleanup
    const newRules = await db.select().from(glCrossValidationRules).where(eq(glCrossValidationRules.ruleName, ruleName));
    if (newRules.length > 0) await financeService.deleteCrossValidationRule(newRules[0].id);

    console.log("Verification Complete.");
}

verifyCVR().catch(console.error);
