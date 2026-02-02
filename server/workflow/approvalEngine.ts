/**
 * Approval Engine - Phase 4
 * Manages approval workflows and decisions
 */

export interface ApprovalRequest {
  id: string;
  formId: string;
  recordId: string;
  requestedBy: string;
  requestedAt: Date;
  status: "pending" | "approved" | "rejected";
  approvers: { userId: string; approved?: boolean; approvedAt?: Date; notes?: string }[];
  requiredApprovals: number;
  currentApprovals: number;
  rejectionReason?: string;
}

export class ApprovalEngine {
  private approvalRequests: Map<string, ApprovalRequest> = new Map();

  /**
   * Create approval request
   */
  createApprovalRequest(
    formId: string,
    recordId: string,
    requestedBy: string,
    approvers: string[],
    requiredApprovals: number = 1
  ): ApprovalRequest {
    const request: ApprovalRequest = {
      id: `APR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      formId,
      recordId,
      requestedBy,
      requestedAt: new Date(),
      status: "pending",
      approvers: approvers.map((userId) => ({ userId })),
      requiredApprovals,
      currentApprovals: 0,
    };

    this.approvalRequests.set(request.id, request);
    return request;
  }

  /**
   * Approve request
   */
  approveRequest(requestId: string, approverUserId: string, notes?: string): { success: boolean; approved?: boolean } {
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      return { success: false };
    }

    const approver = request.approvers.find((a) => a.userId === approverUserId);
    if (!approver) {
      return { success: false };
    }

    approver.approved = true;
    approver.approvedAt = new Date();
    approver.notes = notes;
    request.currentApprovals++;

    // Check if all required approvals obtained
    const approved = request.currentApprovals >= request.requiredApprovals;
    if (approved) {
      request.status = "approved";
    }

    return { success: true, approved };
  }

  /**
   * Reject request
   */
  rejectRequest(requestId: string, approverUserId: string, reason: string): { success: boolean } {
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      return { success: false };
    }

    request.status = "rejected";
    request.rejectionReason = reason;

    return { success: true };
  }

  /**
   * Get approval request
   */
  getApprovalRequest(requestId: string): ApprovalRequest | null {
    return this.approvalRequests.get(requestId) || null;
  }

  /**
   * Get pending approvals for user
   */
  getPendingApprovalsForUser(userId: string): ApprovalRequest[] {
    const pending: ApprovalRequest[] = [];
    for (const request of this.approvalRequests.values()) {
      if (
        request.status === "pending" &&
        request.approvers.some((a) => a.userId === userId && !a.approved)
      ) {
        pending.push(request);
      }
    }
    return pending;
  }

  /**
   * Get approval requests for form record
   */
  getApprovalsForRecord(formId: string, recordId: string): ApprovalRequest[] {
    const requests: ApprovalRequest[] = [];
    for (const request of this.approvalRequests.values()) {
      if (request.formId === formId && request.recordId === recordId) {
        requests.push(request);
      }
    }
    return requests;
  }
}

export const approvalEngine = new ApprovalEngine();
