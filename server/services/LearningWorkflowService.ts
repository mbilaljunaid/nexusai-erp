
import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { hrmLearningEnrollments, hrmLearningOfferings } from "@shared/schema/talent_learning";
import { ApprovalService } from "./ApprovalService";
import { AuditService } from "./AuditService";

export class LearningWorkflowService {

    // Request Approval for Enrollment
    static async requestApproval(enrollmentId: string, requesterId: string, tenantId: string) {
        // 1. Get Enrollment Details
        const enrollment = await db.query.hrmLearningEnrollments.findFirst({
            where: eq(hrmLearningEnrollments.id, enrollmentId)
        });

        if (!enrollment) throw new Error("Enrollment not found");
        if (enrollment.status !== "PENDING_APPROVAL") {
            // If already enrolled, no need, but if "Requested", good.
            // We assume caller sets it to PENDING_APPROVAL first or we do it here.
        }

        // 2. Create Request
        const request = await ApprovalService.createRequest(
            "LEARNING_ENROLLMENT",
            enrollmentId,
            requesterId,
            "Enrollment Approval Required" // Ideally let user provide reason
        );

        // 3. Update Enrollment Status
        await db.update(hrmLearningEnrollments)
            .set({ status: "PENDING_APPROVAL" })
            .where(eq(hrmLearningEnrollments.id, enrollmentId));

        await AuditService.log(tenantId, "APPROVAL_REQUESTED", "ENROLLMENT", enrollmentId, { request: request.id }, requesterId);

        return request;
    }

    // Approve/Reject
    static async decideRequest(requestId: string, approverId: string, decision: "APPROVE" | "REJECT", comments?: string, tenantId?: string) {
        let request;
        if (decision === "APPROVE") {
            request = await ApprovalService.approveRequest(requestId, approverId, comments);

            // Activate Enrollment
            await db.update(hrmLearningEnrollments)
                .set({ status: "ENROLLED" })
                .where(eq(hrmLearningEnrollments.id, request.entityId));

            if (tenantId) await AuditService.log(tenantId, "ENROLLMENT_APPROVED", "ENROLLMENT", request.entityId, { decision, comments }, approverId);

        } else {
            request = await ApprovalService.rejectRequest(requestId, approverId, comments);

            // Reject Enrollment
            await db.update(hrmLearningEnrollments)
                .set({ status: "REJECTED" })
                .where(eq(hrmLearningEnrollments.id, request.entityId));

            if (tenantId) await AuditService.log(tenantId, "ENROLLMENT_REJECTED", "ENROLLMENT", request.entityId, { decision, comments }, approverId);
        }
        return request;
    }
}
