
import { db } from "../server/db";
import { financeService } from "../server/services/finance";
import { glCrossValidationRules, glLedgers, glCodeCombinations } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyGlMasterData() {
    console.log("Starting GL Master Data Verification...");

    try {
        // 1. Setup Data - Create Ledger with Random Name
        const ledger = await financeService.createLedger({
            name: `Test CVR Ledger ${Date.now()}`,
            currency: "USD",
            coaId: "DEFAULT",
            calendarId: "Monthly",
            ledgerType: "PRIMARY",
            description: "Automated Test Ledger"
        });
        console.log("✅ Created Validation Ledger:", ledger.id);

        // 2. Create CVR Rule (Mocking the DB insert since service doesn't have create method exposed yet for CVR in this chunk)
        // Rule: Condition: Segment1='1000' (Company), Validation: Segment2='9000' (Cost Center must be 9000)
        // Error if Company 1000 used with anything else.
        await db.insert(glCrossValidationRules).values({
            ledgerId: ledger.id,
            ruleName: "Company 1000 Restriction",
            description: "Company 1000 only allows Cost Center 9000",
            isEnabled: true,
            conditionFilter: "Segment1=1000",
            validationFilter: "Segment2=9000",
            errorAction: "Error",
            errorMessage: "Company 1000 must use Cost Center 9000"
        });
        console.log("✅ Created Cross-Validation Rule");

        // 3. Create Code Combinations (Mocking existence)
        // Valid CCID
        const validCode = `1000-9000-${Date.now()}`;
        const [ccValid] = await db.insert(glCodeCombinations).values({
            code: validCode,
            ledgerId: ledger.id,
            segment1: "1000",
            segment2: "9000",
            segment3: "10000", // Cash
            enabledFlag: true
        }).returning();

        // Invalid CCID
        const invalidCode = `1000-8000-${Date.now()}`;
        const [ccInvalid] = await db.insert(glCodeCombinations).values({
            code: invalidCode,
            ledgerId: ledger.id,
            segment1: "1000",
            segment2: "8000", // Violation!
            segment3: "10000",
            enabledFlag: true
        }).returning();

        // 4. Test Validation - Should Pass
        console.log("Testing Valid Combination...");
        const validLines: any[] = [{
            accountId: ccValid.id,
            debit: "100",
            credit: "0",
            description: "Valid Line"
        }];
        await financeService.validateCrossValidationRules(validLines, ledger.id);
        console.log("✅ Valid Combination Passed");

        // 5. Test Validation - Should Fail
        console.log("Testing Invalid Combination...");
        const invalidLines: any[] = [{
            accountId: ccInvalid.id,
            debit: "100",
            credit: "0",
            description: "Invalid Line"
        }];

        try {
            await financeService.validateCrossValidationRules(invalidLines, ledger.id);
            console.error("❌ Invalid Combination FAILED to throw error!");
            process.exit(1);
        } catch (e: any) {
            if (e.message.includes("Company 1000 must use Cost Center 9000")) {
                console.log("✅ Invalid Combination correctly blocked:", e.message);
            } else {
                console.error("❌ Unexpected Error Message:", e.message);
                process.exit(1);
            }
        }

        console.log("✅ GL Master Data & CVR Algorithm Verification Complete!");
        process.exit(0);

    } catch (error) {
        console.error("Verification Failed:", error);
        process.exit(1);
    }
}

verifyGlMasterData();
