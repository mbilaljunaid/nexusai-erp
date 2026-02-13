import { Router } from "express";
import { storage } from "../storage";
import { expensePolicyService } from "../services/ExpensePolicyService";
import type { ExpenseReport, ExpenseLine } from "@shared/schema";
import receiptsAnalyticsRouter from "./expense-receipts-analytics";


const router = Router();

// ============================================================================
// EXPENSE REPORT CRUD
// ============================================================================

/**
 * POST /api/expenses
 * Create new expense report
 */
router.post("/", async (req, res) => {
  try {
    const { userId, tenantId } = req.auth!;
    const { title, description, employeeId } = req.body;

    const report = await storage.createExpenseReport(tenantId, {
      employeeId: employeeId || userId,
      title: title || "New Expense Report",
      description,
      status: "DRAFT",
      totalAmount: "0",
      createdBy: userId,
    });

    res.json(report);
  } catch (error: any) {
    console.error("Error creating expense report:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/expenses
 * List expense reports with filters
 */
router.get("/", async (req, res) => {
  try {
    const { tenantId, userId } = req.auth!;
    const { status, employeeId, startDate, endDate } = req.query;

    let reports = await storage.listExpenseReports(tenantId);

    // Filter by employee (default to current user if not manager)
    if (employeeId) {
      reports = reports.filter((r) => r.employeeId === employeeId);
    } else {
      // TODO: Check if user is manager, if not, filter to own reports
      reports = reports.filter((r) => r.employeeId === userId);
    }

    // Filter by status
    if (status) {
      reports = reports.filter((r) => r.status === status);
    }

    // Filter by date range
    if (startDate) {
      reports = reports.filter(
        (r) => new Date(r.createdAt) >= new Date(startDate as string)
      );
    }
    if (endDate) {
      reports = reports.filter(
        (r) => new Date(r.createdAt) <= new Date(endDate as string)
      );
    }

    res.json(reports);
  } catch (error: any) {
    console.error("Error listing expense reports:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/expenses/:id
 * Get single expense report with lines
 */
router.get("/:id", async (req, res) => {
  try {
    const { tenantId } = req.auth!;
    const { id } = req.params;

    const report = await storage.getExpenseReport(tenantId, id);
    if (!report) {
      return res.status(404).json({ error: "Expense report not found" });
    }

    // Get expense lines for this report
    const lines = await storage.listExpenseLines(tenantId, id);

    res.json({ ...report, lines });
  } catch (error: any) {
    console.error("Error getting expense report:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/expenses/:id
 * Update expense report
 */
router.patch("/:id", async (req, res) => {
  try {
    const { tenantId, userId } = req.auth!;
    const { id } = req.params;
    const updates = req.body;

    const existing = await storage.getExpenseReport(tenantId, id);
    if (!existing) {
      return res.status(404).json({ error: "Expense report not found" });
    }

    // Only allow updates if in DRAFT or by owner
    if (existing.status !== "DRAFT" && existing.employeeId !== userId) {
      return res.status(403).json({ error: "Cannot modify submitted expense report" });
    }

    const updated = await storage.updateExpenseReport(tenantId, id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    res.json(updated);
  } catch (error: any) {
    console.error("Error updating expense report:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/expenses/:id
 * Delete expense report (draft only)
 */
router.delete("/:id", async (req, res) => {
  try {
    const { tenantId, userId } = req.auth!;
    const { id } = req.params;

    const existing = await storage.getExpenseReport(tenantId, id);
    if (!existing) {
      return res.status(404).json({ error: "Expense report not found" });
    }

    // Only allow deletion if DRAFT and by owner
    if (existing.status !== "DRAFT") {
      return res.status(403).json({ error: "Can only delete draft expense reports" });
    }
    if (existing.employeeId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await storage.deleteExpenseReport(tenantId, id);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting expense report:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// WORKFLOW ACTIONS
// ============================================================================

/**
 * POST /api/expenses/:id/submit
 * Submit expense report for approval
 */
router.post("/:id/submit", async (req, res) => {
  try {
    const { tenantId, userId } = req.auth!;
    const { id } = req.params;

    const report = await storage.getExpenseReport(tenantId, id);
    if (!report) {
      return res.status(404).json({ error: "Expense report not found" });
    }

    if (report.employeeId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (report.status !== "DRAFT") {
      return res.status(400).json({ error: "Can only submit draft reports" });
    }

    // Get expense lines and validate
    const lines = await storage.listExpenseLines(tenantId, id);
    if (lines.length === 0) {
      return res.status(400).json({ error: "Cannot submit empty expense report" });
    }

    // Validate each line against policies
    const violations: string[] = [];
    for (const line of lines) {
      const validation = await expensePolicyService.validateLine(tenantId, line);
      if (!validation.isValid) {
        violations.push(...validation.violations);
      }
    }

    if (violations.length > 0) {
      return res.status(400).json({
        error: "Policy violations detected",
        violations,
      });
    }

    // Update status
    const updated = await storage.updateExpenseReport(tenantId, id, {
      status: "SUBMITTED",
      submitDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.json(updated);
  } catch (error: any) {
    console.error("Error submitting expense report:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/expenses/:id/approve
 * Approve expense report
 */
router.post("/:id/approve", async (req, res) => {
  try {
    const { tenantId, userId } = req.auth!;
    const { id } = req.params;
    const { comments } = req.body;

    const report = await storage.getExpenseReport(tenantId, id);
    if (!report) {
      return res.status(404).json({ error: "Expense report not found" });
    }

    if (report.status !== "SUBMITTED") {
      return res.status(400).json({ error: "Can only approve submitted reports" });
    }

    // SoD Check: Cannot approve own expense
    if (report.employeeId === userId) {
      return res.status(403).json({ error: "Cannot approve your own expense report (SoD violation)" });
    }

    // TODO: Check manager hierarchy / approval authority

    const updated = await storage.updateExpenseReport(tenantId, id, {
      status: "APPROVED",
      approvedBy: userId,
      approvalDate: new Date().toISOString(),
      approvalComments: comments,
      updatedAt: new Date().toISOString(),
    });

    // TODO: Trigger AP invoice creation

    res.json(updated);
  } catch (error: any) {
    console.error("Error approving expense report:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/expenses/:id/reject
 * Reject expense report
 */
router.post("/:id/reject", async (req, res) => {
  try {
    const { tenantId, userId } = req.auth!;
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const report = await storage.getExpenseReport(tenantId, id);
    if (!report) {
      return res.status(404).json({ error: "Expense report not found" });
    }

    if (report.status !== "SUBMITTED") {
      return res.status(400).json({ error: "Can only reject submitted reports" });
    }

    // SoD Check
    if (report.employeeId === userId) {
      return res.status(403).json({ error: "Cannot reject your own expense report" });
    }

    const updated = await storage.updateExpenseReport(tenantId, id, {
      status: "REJECTED",
      rejectedBy: userId,
      rejectionReason: reason,
      rejectionDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.json(updated);
  } catch (error: any) {
    console.error("Error rejecting expense report:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/expenses/:id/recall
 * Recall submitted expense report
 */
router.post("/:id/recall", async (req, res) => {
  try {
    const { tenantId, userId } = req.auth!;
    const { id } = req.params;

    const report = await storage.getExpenseReport(tenantId, id);
    if (!report) {
      return res.status(404).json({ error: "Expense report not found" });
    }

    if (report.employeeId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (report.status !== "SUBMITTED") {
      return res.status(400).json({ error: "Can only recall submitted reports" });
    }

    const updated = await storage.updateExpenseReport(tenantId, id, {
      status: "DRAFT",
      submitDate: null,
      updatedAt: new Date().toISOString(),
    });

    res.json(updated);
  } catch (error: any) {
    console.error("Error recalling expense report:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// EXPENSE LINES
// ============================================================================

/**
 * POST /api/expenses/:id/lines
 * Add expense line to report
 */
router.post("/:id/lines", async (req, res) => {
  try {
    const { tenantId, userId } = req.auth!;
    const { id } = req.params;
    const lineData = req.body;

    const report = await storage.getExpenseReport(tenantId, id);
    if (!report) {
      return res.status(404).json({ error: "Expense report not found" });
    }

    if (report.status !== "DRAFT") {
      return res.status(403).json({ error: "Cannot add lines to non-draft report" });
    }

    const line = await storage.createExpenseLine(tenantId, {
      ...lineData,
      reportId: id,
      createdBy: userId,
    });

    // Recalculate report total
    const lines = await storage.listExpenseLines(tenantId, id);
    const total = lines.reduce((sum, l) => sum + Number(l.amount || 0), 0);
    await storage.updateExpenseReport(tenantId, id, {
      totalAmount: total.toString(),
      updatedAt: new Date().toISOString(),
    });

    res.json(line);
  } catch (error: any) {
    console.error("Error creating expense line:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/expenses/:id/lines/:lineId
 * Update expense line
 */
router.patch("/:id/lines/:lineId", async (req, res) => {
  try {
    const { tenantId } = req.auth!;
    const { id, lineId } = req.params;
    const updates = req.body;

    const report = await storage.getExpenseReport(tenantId, id);
    if (!report) {
      return res.status(404).json({ error: "Expense report not found" });
    }

    if (report.status !== "DRAFT") {
      return res.status(403).json({ error: "Cannot modify non-draft report" });
    }

    const updated = await storage.updateExpenseLine(tenantId, lineId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    // Recalculate total
    const lines = await storage.listExpenseLines(tenantId, id);
    const total = lines.reduce((sum, l) => sum + Number(l.amount || 0), 0);
    await storage.updateExpenseReport(tenantId, id, {
      totalAmount: total.toString(),
      updatedAt: new Date().toISOString(),
    });

    res.json(updated);
  } catch (error: any) {
    console.error("Error updating expense line:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/expenses/:id/lines/:lineId
 * Delete expense line
 */
router.delete("/:id/lines/:lineId", async (req, res) => {
  try {
    const { tenantId } = req.auth!;
    const { id, lineId } = req.params;

    const report = await storage.getExpenseReport(tenantId, id);
    if (!report) {
      return res.status(404).json({ error: "Expense report not found" });
    }

    if (report.status !== "DRAFT") {
      return res.status(403).json({ error: "Cannot delete lines from non-draft report" });
    }

    await storage.deleteExpenseLine(tenantId, lineId);

    // Recalculate total
    const lines = await storage.listExpenseLines(tenantId, id);
    const total = lines.reduce((sum, l) => sum + Number(l.amount || 0), 0);
    await storage.updateExpenseReport(tenantId, id, {
      totalAmount: total.toString(),
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting expense line:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/expenses/:id/lines/:lineId/validate
 * Validate expense line against policies
 */
router.post("/:id/lines/:lineId/validate", async (req, res) => {
  try {
    const { tenantId } = req.auth!;
    const { id, lineId } = req.params;

    const line = await storage.getExpenseLine(tenantId, lineId);
    if (!line) {
      return res.status(404).json({ error: "Expense line not found" });
    }

    const validation = await expensePolicyService.validateLine(tenantId, line);
    const isDuplicate = await expensePolicyService.detectDuplicates(tenantId, line);

    res.json({
      ...validation,
      isDuplicate,
    });
  } catch (error: any) {
    console.error("Error validating expense line:", error);
    res.status(500).json({ error: error.message });
  }
});

// Mount receipts and analytics routes
router.use("/", receiptsAnalyticsRouter);

export default router;
