/**
 * GL API Routes - Phase 3
 * Endpoints for GL operations
 */

import { Router } from "express";
import { glPostingEngine } from "../gl/glPostingEngine";
import { dualEntryValidator } from "../gl/dualEntryValidator";
import { glReconciler } from "../gl/glReconciler";
import { auditLogger } from "../gl/auditLogger";
import { metadataRegistry } from "../metadata";

const router = Router();

/**
 * POST /api/gl/post
 * Create GL entries from form data
 */
router.post("/gl/post", async (req, res) => {
  try {
    const { formId, formData, userId, description } = req.body;

    // Get metadata
    const metadata = metadataRegistry.getMetadata(formId);
    if (!metadata) {
      return res.status(404).json({ error: "Form metadata not found" });
    }

    // Create GL entries
    const result = await glPostingEngine.postGLEntries({
      formId,
      formData,
      metadata,
      userId,
      description,
    });

    // Log to audit trail
    if (userId) {
      await auditLogger.logFormSubmission(formId, formData, userId);
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/gl/entries/:formId
 * Get GL entries for a form
 */
router.get("/gl/entries/:formId", (req, res) => {
  try {
    const { formId } = req.params;
    const entries = glPostingEngine.getGLEntriesForForm(formId);
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/gl/account/:account
 * Get GL entries for an account
 */
router.get("/gl/account/:account", (req, res) => {
  try {
    const { account } = req.params;
    const entries = glPostingEngine.getGLEntriesForAccount(account);
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/gl/balance/:account
 * Get account balance
 */
router.get("/gl/balance/:account", (req, res) => {
  try {
    const { account } = req.params;
    const balance = glPostingEngine.getAccountBalance(account);
    res.json(balance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/gl/validate
 * Validate GL entries
 */
router.post("/gl/validate", (req, res) => {
  try {
    const { entries } = req.body;
    const result = dualEntryValidator.validateEntries(entries);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/gl/reconciliation
 * Generate reconciliation report
 */
router.get("/gl/reconciliation", (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(String(startDate));
    const end = new Date(String(endDate));

    const entries = glPostingEngine.getAllGLEntries();
    const report = glReconciler.generateReconciliationReport(entries, start, end);

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/gl/trial-balance
 * Get trial balance
 */
router.get("/gl/trial-balance", (req, res) => {
  try {
    const entries = glPostingEngine.getAllGLEntries();
    const trialBalance = glReconciler.getTrialBalance(entries);
    res.json(trialBalance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/audit/logs
 * Get audit logs
 */
router.get("/audit/logs", (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    let logs: any[] = [];

    if (userId) {
      logs = auditLogger.getLogsByUser(String(userId));
    } else if (startDate && endDate) {
      logs = auditLogger.getLogsByDateRange(new Date(String(startDate)), new Date(String(endDate)));
    } else {
      logs = auditLogger.getAllLogs();
    }

    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/audit/report
 * Generate audit report
 */
router.get("/audit/report", (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(String(startDate) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const end = new Date(String(endDate) || new Date());

    const report = auditLogger.generateAuditReport(start, end);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
