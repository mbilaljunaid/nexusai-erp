import { db } from "../server/db";
import { hrComplianceRules, hrComplianceViolations, hrRiskConfigurations } from "../shared/schema/hr_compliance";
import { hrAuditApprovals } from "../shared/schema/hr_audit";
import { ComplianceRiskService } from "../server/modules/hr/services/ComplianceRiskService";
import { ComplianceApprovalService } from "../server/modules/hr/services/ComplianceApprovalService";
import { eq, and } from "drizzle-orm";

async function verify() {
    console.log("🚀 Starting Verification: Advanced Risk & Workflow Intelligence");
    const tenantId = "verification-tenant-" + Date.now();

    try {
        // 1. Setup Custom Risk Weights
        console.log("--- Step 1: Configuring Risk Weights ---");
        await db.insert(hrRiskConfigurations).values([
            { tenantId, factorKey: "TENURE_VOLATILITY", weight: 50 },
            { tenantId, factorKey: "TRANSACTION_TIMING", weight: 10 },
            { tenantId, factorKey: "ROLE_SENSITIVITY", weight: 40 }
        ]);
        console.log("✅ Custom weights configured (Volatility: 50, Timing: 10, Role: 40)");

        // 2. Test Risk Prediction with Custom Weights
        console.log("--- Step 2: Testing Risk Prediction ---");
        const highVolatilityData = {
            isTenureVolatile: true,
            testHour: 23, // Outside business hours
            role: "finance executive"
        };

        const result = await ComplianceRiskService.predictRisk(tenantId, "TRANSFER", highVolatilityData);
        console.log(`✅ Risk Score Calculated: ${result.score}`);
        console.log(`✅ Risk Heatmap: ${JSON.stringify(result.heatmap)}`);

        if (result.score < 50) {
            throw new Error("Risk score too low for high-volatility data with 50% weight!");
        }

        // 3. Setup Violation for Multi-Step Approval
        console.log("--- Step 3: Testing Escalation Workflow ---");
        const [violation] = await db.insert(hrComplianceViolations).values({
            tenantId,
            ruleId: "dummy-rule",
            ruleName: "Critical Data Transfer",
            severity: "critical",
            status: "open",
            entityType: "PERSON",
            entityId: "P-001",
            description: "High risk transfer detected"
        }).returning();

        // Start Step 1 Approval
        const approval1 = await ComplianceApprovalService.requestRemediationApproval({
            tenantId,
            violationId: violation.id,
            requesterId: "USER-1",
            approvers: ["APPROVER-1"],
            workflowId: "WF-" + Date.now(),
            stepOrder: 1
        });
        console.log(`✅ Step 1 Approval Created: ${approval1.id}`);

        // Approve Step 1
        await ComplianceApprovalService.approveRemediation(approval1.id, "APPROVER-1", tenantId);
        console.log("✅ Step 1 Approved");

        // Verify Escalation to Step 2
        const secondStep = await db.query.hrAuditApprovals.findFirst({
            where: and(
                eq(hrAuditApprovals.workflowId, approval1.workflowId!),
                eq(hrAuditApprovals.stepOrder, 2)
            )
        });

        if (!secondStep) {
            throw new Error("Escalation failed: Step 2 not created for critical violation!");
        }
        console.log(`✅ Step 2 Escalated Successfully: ${secondStep.id} (Approver: ${secondStep.approvers[0].userId})`);

        // Approve Step 2 (Final)
        await ComplianceApprovalService.approveRemediation(secondStep.id, secondStep.approvers[0].userId, tenantId);
        console.log("✅ Step 2 Approved");

        // Verify Violation Resolution
        const resolvedViolation = await db.query.hrComplianceViolations.findFirst({
            where: eq(hrComplianceViolations.id, violation.id)
        });

        if (resolvedViolation?.status !== "resolved") {
            throw new Error(`Violation status incorrect: ${resolvedViolation?.status}`);
        }
        console.log("✅ Violation Resolve Successfully after Step 2");

        console.log("\n✨ Verification Complete: Phase 4 Core Logic Validated.");

    } catch (e) {
        console.error("❌ Verification Failed:", e);
        process.exit(1);
    }
}

verify();
