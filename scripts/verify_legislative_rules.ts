import "dotenv/config";
import { ComplianceEngineService } from "../server/modules/hr/services/ComplianceEngineService";
import { db } from "../server/db";
import { hrComplianceRules } from "../shared/schema/hr_compliance";
import { eq } from "drizzle-orm";

async function verifyLegislativeRules() {
    console.log("Starting Tier-1 Localization & Rule Metadata Verification...");
    const tenantId = "test-tenant-" + Date.now();

    try {
        // 1. Setup Legislative Rules
        console.log("Seeding Legislative Rules...");

        // US SSN Rule
        const [usRule] = await db.insert(hrComplianceRules).values({
            tenantId,
            code: "US_SSN_FMT",
            name: "US Social Security Number Format",
            severity: "high",
            category: "REGULATORY",
            legislationCode: "US",
            automationLevel: "full",
            ruleLogic: { type: "IDENTIFICATION" },
            effectiveDate: new Date()
        }).returning();

        // UK NIN Rule
        const [ukRule] = await db.insert(hrComplianceRules).values({
            tenantId,
            code: "UK_NIN_FMT",
            name: "UK National Insurance Format",
            severity: "high",
            category: "REGULATORY",
            legislationCode: "UK",
            automationLevel: "full",
            ruleLogic: { type: "IDENTIFICATION" },
            effectiveDate: new Date()
        }).returning();

        // Time Trigger Rule (Probation Check)
        const [timeRule] = await db.insert(hrComplianceRules).values({
            tenantId,
            code: "PROBATION_EXPIRE",
            name: "Probation Period Review",
            severity: "medium",
            category: "POLICY",
            legislationCode: "GLOBAL",
            automationLevel: "full",
            ruleLogic: {
                type: "TIME_TRIGGER",
                dateField: "hireDate",
                operator: "GREATER_THAN",
                value: 90
            },
            effectiveDate: new Date()
        }).returning();

        console.log("Rules seeded successfully.");

        // 2. Run Evaluations
        console.log("\n--- Testing US SSN Logic ---");
        const usEvaluationValid = await ComplianceEngineService.evaluateTransaction(tenantId, "PERSON", "P1", { nationalId: "123-45-6789" }, "US");
        console.log("Valid US SSN Result (Expected COMPLIANT):", usEvaluationValid.find(r => r.ruleId === usRule.id)?.isCompliant);

        const usEvaluationInvalid = await ComplianceEngineService.evaluateTransaction(tenantId, "PERSON", "P1", { nationalId: "123456789" }, "US");
        console.log("Invalid US SSN Result (Expected NON_COMPLIANT):", usEvaluationInvalid.find(r => r.ruleId === usRule.id)?.isCompliant);

        console.log("\n--- Testing UK NIN Logic ---");
        const ukEvaluationValid = await ComplianceEngineService.evaluateTransaction(tenantId, "PERSON", "P2", { nationalId: "QQ123456C" }, "UK");
        console.log("Valid UK NIN Result (Expected COMPLIANT):", ukEvaluationValid.find(r => r.ruleId === ukRule.id)?.isCompliant);

        const ukEvaluationInvalid = await ComplianceEngineService.evaluateTransaction(tenantId, "PERSON", "P2", { nationalId: "INVALID" }, "UK");
        console.log("Invalid UK NIN Result (Expected NON_COMPLIANT):", ukEvaluationInvalid.find(r => r.ruleId === ukRule.id)?.isCompliant);

        console.log("\n--- Testing Time Trigger (Tenure) ---");
        const oldHire = new Date();
        oldHire.setDate(oldHire.getDate() - 100); // 100 days ago (> 90)

        const timeEvaluationTriggered = await ComplianceEngineService.evaluateTransaction(tenantId, "PERSON", "P3", { hireDate: oldHire.toISOString() });
        console.log("Tenure > 90 days Result (Expected NON_COMPLIANT):", timeEvaluationTriggered.find(r => r.ruleId === timeRule.id)?.isCompliant);

        const recentHire = new Date();
        recentHire.setDate(recentHire.getDate() - 30); // 30 days ago (< 90)
        const timeEvaluationSafe = await ComplianceEngineService.evaluateTransaction(tenantId, "PERSON", "P4", { hireDate: recentHire.toISOString() });
        console.log("Tenure < 90 days Result (Expected COMPLIANT):", timeEvaluationSafe.find(r => r.ruleId === timeRule.id)?.isCompliant);

        console.log("\n--- Verification Complete ---");

    } catch (error) {
        console.error("Error during verification:", error);
    } finally {
        process.exit(0);
    }
}

verifyLegislativeRules();
