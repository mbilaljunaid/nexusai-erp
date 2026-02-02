import { db } from "../db";
import { hrAuditApprovals } from "@shared/schema/hr_audit";
import { eq, sql, and } from "drizzle-orm";

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
  tenantId?: string;
}

export class ApprovalEngine {
  /**
   * Create approval request
   */
  async createApprovalRequest(
    formId: string,
    recordId: string,
    requestedBy: string,
    approvers: string[],
    requiredApprovals: number = 1,
    tenantId: string = "default_tenant"
  ): Promise<ApprovalRequest> {
    const id = `APR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const requestData = {
      id,
      tenantId,
      formId,
      recordId,
      requestedBy,
      requestedAt: new Date(),
      status: "pending" as const,
      approvers: approvers.map((userId) => ({ userId })),
      requiredApprovals,
      currentApprovals: 0,
    };

    const [inserted] = await db.insert(hrAuditApprovals).values(requestData).returning();
    return inserted as any as ApprovalRequest;
  }

  /**
   * Approve request
   */
  async approveRequest(requestId: string, approverUserId: string, notes?: string): Promise<{ success: boolean; approved?: boolean }> {
    const [request] = await db.select().from(hrAuditApprovals).where(eq(hrAuditApprovals.id, requestId));
    if (!request) {
      return { success: false };
    }

    const approvers = request.approvers as any[];
    const approver = approvers.find((a) => a.userId === approverUserId);
    if (!approver) {
      return { success: false };
    }

    approver.approved = true;
    approver.approvedAt = new Date();
    approver.notes = notes;

    const currentApprovals = request.currentApprovals! + 1;
    const approved = currentApprovals >= request.requiredApprovals!;
    const status = approved ? "approved" : "pending";

    await db.update(hrAuditApprovals)
      .set({
        approvers,
        currentApprovals,
        status,
        updatedAt: new Date()
      } as any)
      .where(eq(hrAuditApprovals.id, requestId));

    return { success: true, approved };
  }

  /**
   * Reject request
   */
  async rejectRequest(requestId: string, approverUserId: string, reason: string): Promise<{ success: boolean }> {
    const [request] = await db.select().from(hrAuditApprovals).where(eq(hrAuditApprovals.id, requestId));
    if (!request) {
      return { success: false };
    }

    await db.update(hrAuditApprovals)
      .set({
        status: "rejected",
        rejectionReason: reason,
        updatedAt: new Date()
      } as any)
      .where(eq(hrAuditApprovals.id, requestId));

    return { success: true };
  }

  /**
   * Get approval request
   */
  async getApprovalRequest(requestId: string): Promise<ApprovalRequest | null> {
    const [request] = await db.select().from(hrAuditApprovals).where(eq(hrAuditApprovals.id, requestId));
    return request as any as ApprovalRequest || null;
  }

  /**
   * Get pending approvals for user
   */
  async getPendingApprovalsForUser(userId: string): Promise<ApprovalRequest[]> {
    // Since approvers is JSONB, we can use JSONB containment or just fetch and filter for now given low volume
    // Ideally: .where(sql`${hrAuditApprovals.approvers} @> ${JSON.stringify([{userId}])}`)
    // For now, simpler fetch and filter or use the containment operator.

    // Containment operator @> check if JSONB contains another JSONB
    const results = await db.select().from(hrAuditApprovals).where(and(
      eq(hrAuditApprovals.status, "pending"),
      sql`${hrAuditApprovals.approvers} @> ${JSON.stringify([{ userId }])}`
    ));

    // Refinement: The containment check might be too broad if we want specifically "not yet approved".
    return results.filter(r => {
      const approver = (r.approvers as any[]).find(a => a.userId === userId);
      return approver && !approver.approved;
    }) as any as ApprovalRequest[];
  }

  /**
   * Get approval requests for form record
   */
  async getApprovalsForRecord(formId: string, recordId: string): Promise<ApprovalRequest[]> {
    const results = await db.select().from(hrAuditApprovals)
      .where(and(eq(hrAuditApprovals.formId, formId), eq(hrAuditApprovals.recordId, recordId)));
    return results as any as ApprovalRequest[];
  }
}

export const approvalEngine = new ApprovalEngine();
