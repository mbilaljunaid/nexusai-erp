import { db } from "@db";
import { hrAuditApprovals } from "@shared/schema/hr_audit";
import { hrComplianceViolations } from "@shared/schema/hr_compliance";
import { eq, and } from "drizzle-orm";

export class ComplianceApprovalService {
    static async requestRemediationApproval(params: {
        tenantId: string;
        violationId: string;
        requesterId: string;
        approvers: string[];
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

    static async escalateViolation(approvalId: string, tenantId: string, notes: string) {
        const [approval] = await db.select()
            .from(hrAuditApprovals)
            .where(and(eq(hrAuditApprovals.id, approvalId), eq(hrAuditApprovals.tenantId, tenantId)))
            .limit(1);

        if (!approval) throw new Error("Approval record not found");

        // Logic: Increment step order, reset approvals for next step
        const nextStep = (approval.stepOrder || 1) + 1;
        const history = (approval.statusHistory as any[]) || [];
        history.push({
            step: approval.stepOrder,
            status: "escalated",
            timestamp: new Date(),
            notes
        });

        // Reset approvers for next step (in a real system, we'd fetch the next approver ID based on rules)
        // For now, allow any compliance officer to pick it up (empty approvers list or re-assign)
        // Let's assume the UI passes the new approver, but here we just reset state for the demo

        await db.update(hrAuditApprovals)
            .set({
                stepOrder: nextStep,
                status: "pending",
                currentApprovals: 0,
                approvers: [], // Clear previous approvers so new ones can be added/claimed
                statusHistory: history,
                metadata: {
                    ...approval.metadata as object,
                    escalatedFromStep: approval.stepOrder
                }
            })
            .where(eq(hrAuditApprovals.id, approvalId));

        return { success: true, nextStep };
    }

    static async approveRemediation(approvalId: string, approverId: string, tenantId: string) {
        const [approval] = await db.select()
            .from(hrAuditApprovals)
            .where(and(eq(hrAuditApprovals.id, approvalId), eq(hrAuditApprovals.tenantId, tenantId)))
            .limit(1);

        if (!approval) throw new Error("Approval record not found");

        const approvers = (approval.approvers as any[]) || [];
        // If approvers list is empty (pool), add this user as an approver
        let approverIndex = approvers.findIndex(a => a.userId === approverId);

        if (approverIndex === -1) {
            // Allow ad-hoc approval if it's an open pool (e.g. after escalation)
            approvers.push({ userId: approverId, approved: false });
            approverIndex = approvers.length - 1;
        }

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
            // Check if we need to escalate or resolve
            // Simple rule: If Step 1, Escalate. If Step 2, Resolve.
            // In a real system, this would be config-driven.
            if ((approval.stepOrder || 1) < 2) {
                await this.escalateViolation(approvalId, tenantId, "Auto-escalated to Level 2 Compliance Officer");
            } else {
                // Final Step Reached -> Resolve Violation
                await db.update(hrComplianceViolations)
                    .set({
                        status: "resolved",
                        resolvedAt: new Date(),
                        resolutionNotes: `Remediation approved via workflow ${approvalId} (Step ${approval.stepOrder})`
                    })
                    .where(eq(hrComplianceViolations.id, approval.recordId as string));
            }
        }

        return updatedApproval;
    }
}
