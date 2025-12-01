/**
 * Workflow API Routes - Phase 4
 */

import { Router } from "express";
import { workflowEngine } from "../workflow/workflowEngine";
import { approvalEngine } from "../workflow/approvalEngine";
import { notificationEngine } from "../workflow/notificationEngine";
import { metadataRegistry } from "../metadata";

const router = Router();

/**
 * POST /api/workflow/initialize
 * Initialize workflow for a record
 */
router.post("/workflow/initialize", (req, res) => {
  try {
    const { formId, recordId, userId } = req.body;
    const metadata = metadataRegistry.getMetadata(formId);

    if (!metadata) {
      return res.status(404).json({ error: "Form not found" });
    }

    const state = workflowEngine.initializeWorkflow(formId, recordId, metadata, userId);
    res.json(state);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/workflow/transition
 * Transition to next status
 */
router.post("/workflow/transition", async (req, res) => {
  try {
    const { formId, recordId, toStatus, userId } = req.body;
    const metadata = metadataRegistry.getMetadata(formId);

    const result = await workflowEngine.transitionStatus(formId, recordId, toStatus, userId, metadata);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/workflow/:formId/:recordId
 * Get workflow state
 */
router.get("/workflow/:formId/:recordId", (req, res) => {
  try {
    const { formId, recordId } = req.params;
    const state = workflowEngine.getWorkflowState(formId, recordId);

    if (!state) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    res.json(state);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/workflow/form/:formId
 * Get all workflow states for form
 */
router.get("/workflow/form/:formId", (req, res) => {
  try {
    const { formId } = req.params;
    const states = workflowEngine.getWorkflowStatesForForm(formId);
    res.json(states);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/approval/request
 * Create approval request
 */
router.post("/approval/request", (req, res) => {
  try {
    const { formId, recordId, requestedBy, approvers, requiredApprovals } = req.body;
    const request = approvalEngine.createApprovalRequest(
      formId,
      recordId,
      requestedBy,
      approvers,
      requiredApprovals || 1
    );

    // Send approval notifications
    const recipients = approvers.filter((a: string) => a !== requestedBy);
    notificationEngine.sendNotification(requestedBy, "approval_requested", { formId, recordId }, recipients);

    res.json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/approval/:requestId/approve
 * Approve request
 */
router.post("/approval/:requestId/approve", (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId, notes } = req.body;

    const result = approvalEngine.approveRequest(requestId, userId, notes);
    if (!result.success) {
      return res.status(404).json({ error: "Approval request not found" });
    }

    // Send notifications
    const request = approvalEngine.getApprovalRequest(requestId);
    if (request && result.approved) {
      notificationEngine.sendNotification(request.requestedBy, "form_approved", {
        approverName: userId,
        formId: request.formId,
        recordId: request.recordId,
      });
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/approval/:requestId/reject
 * Reject request
 */
router.post("/approval/:requestId/reject", (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId, reason } = req.body;

    const result = approvalEngine.rejectRequest(requestId, userId, reason);
    if (!result.success) {
      return res.status(404).json({ error: "Approval request not found" });
    }

    // Send notifications
    const request = approvalEngine.getApprovalRequest(requestId);
    if (request) {
      notificationEngine.sendNotification(request.requestedBy, "form_rejected", {
        approverName: userId,
        reason,
        formId: request.formId,
        recordId: request.recordId,
      });
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/approval/pending/:userId
 * Get pending approvals for user
 */
router.get("/approval/pending/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const pending = approvalEngine.getPendingApprovalsForUser(userId);
    res.json(pending);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/notifications/:userId
 * Get notifications for user
 */
router.get("/notifications/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const { unreadOnly } = req.query;
    const notifications = notificationEngine.getNotificationsForUser(userId, unreadOnly === "true");
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/:notificationId/read
 * Mark notification as read
 */
router.post("/notifications/:notificationId/read", (req, res) => {
  try {
    const { notificationId } = req.params;
    const success = notificationEngine.markAsRead(notificationId);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/notifications/:userId/count
 * Get unread notification count
 */
router.get("/notifications/:userId/count", (req, res) => {
  try {
    const { userId } = req.params;
    const count = notificationEngine.getUnreadCount(userId);
    res.json({ unreadCount: count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
