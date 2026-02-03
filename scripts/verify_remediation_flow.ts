import { db } from "../server/db";
import {
    hrComplianceRules,
    hrComplianceEvents,
    hrComplianceViolations
} from "../shared/schema/hr_compliance";
import { ComplianceService } from "../server/modules/hr/services/ComplianceService";
import { eq } from "drizzle-orm";

async function verifyRemediation() {
    console.log("🚀 Starting Remediation Flow Verification...");
    const tenantId = "test-tenant-" + Date.now();

    try {
        // 1. Setup mock data (Rule -> Event -> Violation)
        console.log("Creating mock compliance rule and event...");
        const [rule] = await db.insert(hrComplianceRules).values({
            tenantId,
            code: "TEST_REMEDIATION",
            name: "Test Remediation Policy",
            severity: "high",
            automationLevel: "manual",
            effectiveDate: new Date(),
        }).returning();

        const [event] = await db.insert(hrComplianceEvents).values({
            tenantId,
            ruleId: rule.id,
            entityType: "PERSON",
            entityId: "test-person",
            evaluationResult: "non-compliant",
        }).returning();

        const [violation] = await db.insert(hrComplianceViolations).values({
            tenantId,
            eventId: event.id,
            ruleId: rule.id,
            severity: "high",
            description: "Test violation description",
            status: "open",
        }).returning();

        console.log(`Violation created with ID: ${violation.id}`);

        // 2. Perform Remediation (Update Status)
        console.log("Remediating violation (setting to resolved)...");
        const updated = await ComplianceService.updateViolation(violation.id, tenantId, {
            status: "resolved",
            resolutionNotes: "Resolved during verification script execution."
        });

        if (updated.status === "resolved") {
            console.log("✅ Success: Violation status updated to resolved!");
            console.log("Resolution Time:", updated.resolvedAt);
        } else {
            console.error("❌ Failure: Violation status not updated correctly.");
            process.exit(1);
        }

        // 3. Cleanup
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

verifyRemediation();
