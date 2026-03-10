import { db } from "../server/db";
import {
    hrComplianceRules,
    hrComplianceEvents,
    hrComplianceViolations
} from "../shared/schema/hr_compliance";
import { ComplianceEngineService } from "../server/modules/hr/services/ComplianceEngineService";
import { eq } from "drizzle-orm";

async function verifyCompliance() {
    console.log("🚀 Starting Compliance Engine Verification...");
    const tenantId = "test-tenant-" + Date.now();

    try {
        // 1. Create a "Minimum Age" rule
        console.log("Creating mock compliance rule...");
        const [rule] = await db.insert(hrComplianceRules).values({
            tenantId,
            code: "MIN_AGE_18",
            name: "Minimum Legal Working Age",
            severity: "critical",
            automationLevel: "full",
            ruleLogic: { type: "MIN_AGE", threshold: 18 },
            effectiveDate: new Date(),
            isActive: true,
        }).returning();

        // 2. Simulate a Hire Transaction with a 15-year old (Violates Rule)
        console.log("Simulating non-compliant hire transaction (Age 15)...");
        const birthDate = new Date();
        birthDate.setFullYear(birthDate.getFullYear() - 15);

        const evaluationResults = await ComplianceEngineService.evaluateTransaction(
            tenantId,
            "PERSON",
            "mock-person-id",
            { dateOfBirth: birthDate.toISOString() }
        );

        console.log("Evaluation Results:", evaluationResults);

        // 3. Verify Violation in DB
        const violations = await db.select().from(hrComplianceViolations).where(eq(hrComplianceViolations.tenantId, tenantId));

        if (violations.length > 0) {
            console.log("✅ Success: Violation recorded correctly!");
            console.log("Violation Details:", violations[0].description);
        } else {
            console.error("❌ Failure: No violation recorded despite rule breach.");
            process.exit(1);
        }

        // 4. Cleanup
        console.log("Cleaning up test data...");
        await db.delete(hrComplianceViolations).where(eq(hrComplianceViolations.tenantId, tenantId));
        await db.delete(hrComplianceEvents).where(eq(hrComplianceEvents.tenantId, tenantId));
        await db.delete(hrComplianceRules).where(eq(hrComplianceRules.id, rule.id));

        console.log("✨ Verification Complete!");
    } catch (error) {
        console.error("❌ Error during verification:", error);
        process.exit(1);
    }
}

verifyCompliance();
