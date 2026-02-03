import { db } from "@db";
import { hrAuditApprovals } from "@shared/schema/hr_audit";
import { hrComplianceViolations } from "@shared/schema/hr_compliance";
import { eq, and, sql } from "drizzle-orm";

export class ComplianceApprovalService {
    static async requestRemediationApproval(params: {
        tenantId: string;
        violationId: string;
        requesterId: string;
        approvers: string[];
        workflowId?: string;
        stepOrder?: number;
    }) {
        const [violation] = await db.select()
            .from(hrComplianceViolations)
            .where(and(eq(hrComplianceViolations.id, params.violationId), eq(hrComplianceViolations.tenantId, params.tenantId)))
            .limit(1);

        if (!violation) throw new Error("Violation not found");

        const [approval] = await db.insert(hrAuditApprovals).values({
            tenantId: params.tenantId,
            formId: "COMPLIANCE_REMEDIATION",
            recordId: params.violationId,
            workflowId: params.workflowId || sql`gen_random_uuid()`,
            stepOrder: params.stepOrder || 1,
            requestedBy: params.requesterId,
            status: "pending",
            approvers: params.approvers.map(id => ({ userId: id, approved: false })),
            requiredApprovals: params.approvers.length,
            metadata: {
                violationDescription: violation.description,
                severity: violation.severity
            }
        }).returning();

        return approval;
    }

    static async approveRemediation(approvalId: string, approverId: string, tenantId: string) {
        const [approval] = await db.select()
            .from(hrAuditApprovals)
            .where(and(eq(hrAuditApprovals.id, approvalId), eq(hrAuditApprovals.tenantId, tenantId)))
            .limit(1);

        if (!approval) throw new Error("Approval record not found");

        const approvers = approval.approvers as any[];
        const approverIndex = approvers.findIndex(a => a.userId === approverId);

        if (approverIndex === -1) throw new Error("User is not an authorized approver");
        if (approvers[approverIndex].approved) return approval; // Already approved by this user

        approvers[approverIndex].approved = true;
        approvers[approverIndex].approvedAt = new Date().toISOString();

        const currentApprovals = (approval.currentApprovals || 0) + 1;
        const isFullyApproved = currentApprovals >= (approval.requiredApprovals || 1);

        const [updatedApproval] = await db.update(hrAuditApprovals)
            .set({
                approvers,
                currentApprovals,
                status: isFullyApproved ? "approved" : "pending"
            })
            .where(eq(hrAuditApprovals.id, approvalId))
            .returning();

        if (isFullyApproved) {
            // Trigger escalation logic
            await this.escalateViolation(updatedApproval, tenantId);
        }

        return updatedApproval;
    }

    private static async escalateViolation(approval: any, tenantId: string) {
        // Implementation for Level-11 Escalation Chain
        // If this was Step 1 (Manager), we might need Step 2 (Compliance Officer)
        // For Phase 4, we define a simple rule: If violation is 'CRITICAL', we need a 2-step approval.

        const [violation] = await db.select()
            .from(hrComplianceViolations)
            .where(and(eq(hrComplianceViolations.id, approval.recordId), eq(hrComplianceViolations.tenantId, tenantId)))
            .limit(1);

        if (violation?.severity === "critical" && approval.stepOrder === 1) {
            // Create Step 2 for Compliance Officer
            // In a real system, this would look up the official officer ID
            const officerId = "COMPLIANCE_OFFICER_STUB";

            await this.requestRemediationApproval({
                tenantId,
                violationId: violation.id,
                requesterId: approval.requestedBy,
                approvers: [officerId],
                workflowId: approval.workflowId,
                stepOrder: 2
            });
        } else {
            // Final Approval reached
            await db.update(hrComplianceViolations)
                .set({
                    status: "resolved",
                    resolvedAt: new Date(),
                    resolutionNotes: `Remediation fully approved via workflow ${approval.workflowId}`
                })
                .where(eq(hrComplianceViolations.id, violation.id));
        }
    }
}
