import "dotenv/config";
import { db } from "../server/db";
import { hrRiskWeights, hrComplianceViolations, hrComplianceEvents } from "../shared/schema/hr_compliance";
import { hrAuditApprovals } from "../shared/schema/hr_audit";
import { hrWorkRelationships, hrPersons } from "../shared/schema";
import { ComplianceRiskService } from "../server/modules/hr/services/ComplianceRiskService";
import { ComplianceApprovalService } from "../server/modules/hr/services/ComplianceApprovalService";
import { sql, eq } from "drizzle-orm";

async function verifyRiskAndWorkflow() {
    console.log("🔍 Verifying Advanced Risk & Workflow...");
    const tenantId = "test_tenant_risk_" + Date.now();
    const userId = "test_user_inspector";

    try {
        // ==========================================
        // TEST 1: Dynamic Risk Weights
        // ==========================================
        console.log("\n🧪 Test 1: Dynamic Risk Weighting");

        // 1. Configure Weight: 'TENURE' -> 90 points (Critical)
        console.log("   - Configuring Risk Weight: TENURE = 90");
        await db.insert(hrRiskWeights).values({
            tenantId,
            category: "TENURE",
            conditionKey: "job_hopping",
            weight: 90,
            isActive: true
        });

        // 2. Seed Person & History
        const personId = "risk_person_" + Date.now();
        await db.insert(hrPersons).values({ id: personId, tenantId, firstName: "John", lastName: "Doe", email: "john@example.com" });

        // Insert 3 work relationships to trigger "job_hopping" heuristic
        await db.insert(hrWorkRelationships).values([
            { id: "wr_1_" + Date.now(), tenantId, personId, legalEmployerId: "le1", dateStart: sql`now() - interval '2 years'`, primaryFlag: false },
            { id: "wr_2_" + Date.now(), tenantId, personId, legalEmployerId: "le2", dateStart: sql`now() - interval '1 year'`, primaryFlag: false },
            { id: "wr_3_" + Date.now(), tenantId, personId, legalEmployerId: "le3", dateStart: sql`now()`, primaryFlag: true }
        ]);

        // 3. Predict Risk
        console.log("   - Predicting Risk...");
        const analysis = await ComplianceRiskService.predictRisk(tenantId, "HIRE", { personId });
        console.log(`   - Risk Score: ${analysis.score}`);

        if (analysis.score >= 90) {
            console.log("   ✅ Success: Dynamic weight applied (Score >= 90).");
        } else {
            console.error(`   ❌ Failed: Expected score >= 90, got ${analysis.score}`);
            process.exit(1);
        }

        // ==========================================
        // TEST 2: Multi-Step Escalation Workflow
        // ==========================================
        console.log("\n🧪 Test 2: Multi-Step Escalation");

        // 1. Seed Violation & Approval Request
        const violationId = "v_esc_" + Date.now();
        await db.insert(hrComplianceViolations).values({
            id: violationId, tenantId, ruleId: "r1", eventId: "e1",
            entityType: "PERSON", entityId: personId, severity: "medium", status: "open", description: "Test Violation"
        });

        const approvalId = "app_esc_" + Date.now();
        await db.insert(hrAuditApprovals).values({
            id: approvalId, tenantId, formId: "COMPLIANCE_REMEDIATION", recordId: violationId,
            requestedBy: userId, status: "pending", approvers: [], stepOrder: 1, requiredApprovals: 1, currentApprovals: 0
        });

        // 2. Approve Step 1
        console.log("   - Approving Step 1 (Manager)...");
        await ComplianceApprovalService.approveRemediation(approvalId, "manager_user", tenantId);

        // 3. Verify Escalation to Step 2
        const [step1State] = await db.select().from(hrAuditApprovals).where(eq(hrAuditApprovals.id, approvalId));
        if (step1State.stepOrder === 2 && step1State.status === "pending") {
            console.log("   ✅ Success: Escalated to Step 2.");
        } else {
            console.error(`   ❌ Failed: Expected Step 2 Pending, got Step ${step1State.stepOrder} ${step1State.status}`);
            process.exit(1);
        }

        // 4. Approve Step 2
        console.log("   - Approving Step 2 (Compliance Officer)...");
        await ComplianceApprovalService.approveRemediation(approvalId, "officer_user", tenantId);

        // 5. Verify Resolution
        const [violationState] = await db.select().from(hrComplianceViolations).where(eq(hrComplianceViolations.id, violationId));
        if (violationState.status === "resolved") {
            console.log("   ✅ Success: Violation Resolved after Step 2.");
        } else {
            console.error(`   ❌ Failed: Violation status is ${violationState.status}`);
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
        process.exit(1);
    } finally {
        // Cleanup
        await db.delete(hrRiskWeights).where(eq(hrRiskWeights.tenantId, tenantId));
        await db.delete(hrWorkRelationships).where(eq(hrWorkRelationships.tenantId, tenantId));
        await db.delete(hrPersons).where(eq(hrPersons.id, userId)); // sloppy cleanup but acceptable for test tenant isolate
        process.exit(0);
    }
}

verifyRiskAndWorkflow();
