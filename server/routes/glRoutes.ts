/**
 * GL API Routes - Phase 3
 * Endpoints for GL operations
 */

import { Router } from "express";
import { glPostingEngine } from "../gl/glPostingEngine";
import { financeService } from "../services/finance";
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
 * GET /api/gl/stats
 * Get GL statistics for dashboards
 */
router.get("/gl/stats", async (req, res) => {
  try {
    const stats = await financeService.getGLStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/gl/journals
 * Get list of journals with optional filters
 */
router.get("/gl/journals", async (req, res) => {
  try {
    const { status, ledgerId, search } = req.query;
    const journals = await financeService.listJournals({
      status: status as string,
      ledgerId: ledgerId as string,
      search: search as string
    });
    res.json(journals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/gl/entries/:formId
 * Get GL entries for a form
 */
router.get("/gl/entries/:formId", async (req, res) => {
  try {
    const { formId } = req.params;
    const entries = await glPostingEngine.getGLEntriesForForm(formId);
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/gl/account/:account
 * Get GL entries for an account
 */
router.get("/gl/account/:account", async (req, res) => {
  try {
    const { account } = req.params;
    const entries = await glPostingEngine.getGLEntriesForAccount(account);
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/gl/balance/:account
 * Get account balance
 */
router.get("/gl/balance/:account", async (req, res) => {
  try {
    const { account } = req.params;
    const balance = await glPostingEngine.getAccountBalance(account);
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
router.get("/gl/reconciliation", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(String(startDate));
    const end = new Date(String(endDate));

    const entries = await glPostingEngine.getAllGLEntries();
    const report = glReconciler.generateReconciliationReport(entries, start, end);

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/gl/trial-balance
 * Get trial balance (Compatibility & Reporting)
 */
router.get("/gl/trial-balance", async (req, res) => {
  try {
    const { ledgerId, periodId } = req.query;
    const report = await financeService.calculateTrialBalance(
      (ledgerId as string) || "PRIMARY",
      periodId as string
    );
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/gl/reporting/trial-balance
 * Alias for standardized reporting path
 */
router.get("/gl/reporting/trial-balance", async (req, res) => {
  try {
    const { ledgerId, periodId } = req.query;
    const report = await financeService.calculateTrialBalance(
      (ledgerId as string) || "PRIMARY",
      periodId as string
    );
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/gl/reporting/drill-down/:ccid
 * Get journal lines for a specific balance
 */
router.get("/gl/reporting/drill-down/:ccid", async (req, res) => {
  try {
    const { ccid } = req.params;
    const { periodId } = req.query;
    if (!periodId) return res.status(400).json({ error: "periodId is required for drill-down" });
    const lines = await financeService.getBalanceDrillDown(ccid, periodId as string);
    res.json(lines);
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


/**
 * POST /api/gl/ledgersets
 * Create a new Ledger Set
 */
router.post("/gl/ledgersets", async (req, res) => {
  try {
    const ledgerSet = await financeService.createLedgerSet(req.body);
    res.json(ledgerSet);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/gl/ledgersets/:id/assign
 * Assign a ledger to a set
 */
router.post("/gl/ledgersets/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { ledgerId } = req.body;
    const result = await financeService.assignLedgerToSet(id, ledgerId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/gl/legal-entities
 * Create a new Legal Entity
 */
router.post("/api/gl/legal-entities", async (req, res) => {
  try {
    const legalEntity = await financeService.createLegalEntity(req.body);
    res.json(legalEntity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/gl/coa/structure/:ledgerId
 * Get COA structure (segments) for a ledger
 */
router.get("/gl/coa/structure/:ledgerId", async (req, res) => {
  try {
    const { ledgerId } = req.params;
    const structure = await financeService.getFullCoaStructure(ledgerId);
    res.json(structure);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Period Close Checklist Routes
 */
router.get("/gl/periods/:periodId/tasks", async (req, res) => {
  try {
    const { periodId } = req.params;
    const { ledgerId } = req.query;
    const tasks = await financeService.listCloseTasks(
      (ledgerId as string) || "PRIMARY",
      periodId
    );
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/gl/periods/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await financeService.updateCloseTask(taskId, req.body);
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/gl/reporting/explain-variance
 * AI Action: Explain variance between two periods
 */
router.get("/gl/reporting/explain-variance", async (req, res) => {
  try {
    const { periodId, benchmarkPeriodId, ledgerId } = req.query;
    if (!periodId || !benchmarkPeriodId) {
      return res.status(400).json({ error: "Both periodId and benchmarkPeriodId are required" });
    }
    const explanation = await financeService.explainVariance(
      periodId as string,
      benchmarkPeriodId as string,
      (ledgerId as string) || "PRIMARY"
    );
    res.json(explanation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});



/**
 * GL Configuration Routes (Chunk 8)
 */
router.get("/gl/config/sources", async (req, res) => {
  try {
    const sources = await financeService.listGlJournalSources();
    res.json(sources);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/gl/config/sources", async (req, res) => {
  try {
    const source = await financeService.createGlJournalSource(req.body);
    res.json(source);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/gl/config/categories", async (req, res) => {
  try {
    const categories = await financeService.listGlJournalCategories();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/gl/config/categories", async (req, res) => {
  try {
    const category = await financeService.createGlJournalCategory(req.body);
    res.json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/gl/config/ledger/:ledgerId/controls", async (req, res) => {
  try {
    const { ledgerId } = req.params;
    const controls = await financeService.getGlLedgerControl(ledgerId);
    res.json(controls || {});
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/gl/config/ledger/controls", async (req, res) => {
  try {
    const control = await financeService.upsertGlLedgerControl(req.body);
    res.json(control);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/gl/config/ledger/:ledgerId/autopost-rules", async (req, res) => {
  try {
    const { ledgerId } = req.params;
    const rules = await financeService.listGlAutoPostRules(ledgerId);
    res.json(rules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Intercompany Rules (Chunk 9)
 */
router.get("/gl/config/intercompany-rules", async (req, res) => {
  try {
    const rules = await financeService.listIntercompanyRules();
    res.json(rules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/gl/config/intercompany-rules", async (req, res) => {
  try {
    const rule = await financeService.createIntercompanyRule(req.body);
    res.json(rule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Mass Allocations (Chunk 9)
 */
router.get("/gl/allocations", async (req, res) => {
  try {
    const { ledgerId } = req.query;
    const rules = await financeService.listAllocations(ledgerId as string);
    res.json(rules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/gl/allocations/run", async (req, res) => {
  try {
    const { allocationId, periodName, userId } = req.body;
    const result = await financeService.runAllocation(allocationId, periodName, userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Budgetary Control (Chunk 9)
 */
router.get("/gl/config/budget-rules", async (req, res) => {
  try {
    const { ledgerId } = req.query;
    const rules = await financeService.listBudgetControlRules(ledgerId as string);
    res.json(rules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/gl/config/budget-rules", async (req, res) => {
  try {
    const rule = await financeService.createBudgetControlRule(req.body);
    res.json(rule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/gl/budget-balances", async (req, res) => {
  try {
    const { ledgerId, periodName } = req.query;
    const balances = await financeService.listBudgetBalances(ledgerId as string, periodName as string);
    res.json(balances);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

