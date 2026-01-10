import { Router } from "express";
import { financeService } from "../services/finance";
import {
    insertGlAccountSchema, insertGlPeriodSchema, insertGlJournalSchema,
    insertGlJournalLineSchema, glAllocations, insertGlLegalEntitySchema,
    insertGlLedgerRelationshipSchema, insertGlLedgerSchema
} from "@shared/schema";
import { z } from "zod";
import { db } from "../db";
import { eq } from "drizzle-orm";

const router = Router();

router.use((req, res, next) => {
    console.log(`[FinanceRouter] ${req.method} ${req.path}`);
    next();
});

// GL Accounts
router.get("/gl/accounts", async (req, res) => {
    const accounts = await financeService.listAccounts();
    res.json(accounts);
});

router.post("/gl/accounts", async (req, res) => {
    const data = insertGlAccountSchema.parse(req.body);
    const account = await financeService.createAccount(data);
    res.json(account);
});

// GL Periods
router.get("/gl/periods", async (req, res) => {
    const ledgerId = req.query.ledgerId as string | undefined;
    const periods = await financeService.listPeriods(ledgerId);
    res.json(periods);
});

router.post("/gl/periods", async (req, res) => {
    const data = insertGlPeriodSchema.parse(req.body);
    const period = await financeService.createPeriod(data);
    res.json(period);
});

router.post("/gl/periods/:id/close", async (req, res) => {
    const userId = (req.user as any)?.id || "system";
    const context = { ipAddress: req.ip, sessionId: req.sessionID };
    const period = await financeService.closePeriod(req.params.id, userId, context);
    res.json(period);
});

router.post("/gl/periods/:id/reopen", async (req, res) => {
    const userId = (req.user as any)?.id || "system";
    const context = { ipAddress: req.ip, sessionId: req.sessionID };
    const period = await financeService.reopenPeriod(req.params.id, userId, context);
    res.json(period);
});

router.get("/gl/periods/:id/exceptions", async (req, res) => {
    const exceptions = await financeService.getPeriodExceptions(req.params.id);
    res.json(exceptions);
});

// GL Statistics
router.get("/gl/stats", async (req, res) => {
    const stats = await financeService.getGLStats();
    res.json(stats);
});

// GL Journals
router.get("/gl/journals", async (req, res) => {
    const periodId = req.query.periodId as string | undefined;
    const journals = await financeService.listJournals(periodId);
    res.json(journals);
});

router.get("/gl/journals/:id/lines", async (req, res) => {
    const lines = await financeService.getJournalLines(req.params.id);
    res.json(lines);
});

router.post("/gl/journals", async (req, res) => {
    // Expects { journal: ..., lines: [...] }
    try {
        const schema = z.object({
            journal: insertGlJournalSchema,
            lines: z.array(insertGlJournalLineSchema.omit({ journalId: true }))
        });

        const { journal: journalData, lines: linesData } = schema.parse(req.body);

        const userId = (req.user as any)?.id || "system";
        const context = { ipAddress: req.ip, sessionId: req.sessionID };
        const result = await financeService.createJournal(journalData, linesData, userId, context);
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});



router.post("/gl/journals/:id/post", async (req, res) => {
    try {
        const userId = (req.user as any)?.id || "system";
        const context = { ipAddress: req.ip, sessionId: req.sessionID };
        const result = await financeService.postJournal(req.params.id, userId, context);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Reporting
router.get("/gl/trial-balance", async (req, res) => {
    const periodId = req.query.periodId as string | undefined;
    const report = await financeService.calculateTrialBalance(periodId);
    res.json(report);
});

// Advanced GL: Code Combination Generator
router.post("/gl/ccid/validate", async (req, res) => {
    try {
        const { ledgerId, segmentString } = req.body;
        if (!ledgerId || !segmentString) {
            return res.status(400).json({ error: "ledgerId and segmentString are required" });
        }

        const ccid = await financeService.getOrCreateCodeCombination(ledgerId, segmentString);
        res.json(ccid);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

// ================= ADVANCED GL ROUTES (PHASE 2) =================

// Batches
router.post("/gl/batches", async (req, res) => {
    try {
        const { batchName, description, periodId } = req.body;
        const batch = await financeService.createBatch(batchName, description, periodId);
        res.json(batch);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Journal Approvals
router.post("/gl/journals/:id/submit-approval", async (req, res) => {
    try {
        const { approverId } = req.body;
        if (!approverId) throw new Error("approverId is required");
        const approval = await financeService.submitForApproval(req.params.id, approverId);
        res.json(approval);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Journal Reversal
router.post("/gl/journals/:id/reverse", async (req, res) => {
    try {
        const reversal = await financeService.reverseJournal(req.params.id);
        res.json(reversal);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// ================= AGENTIC AI ROUTES (CHUNK 4) =================

// Anomaly Detection
router.get("/gl/anomalies", async (req, res) => {
    try {
        const anomalies = await financeService.detectAnomalies();
        res.json(anomalies);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Variance Analysis
router.get("/gl/variance-analysis", async (req, res) => {
    try {
        const { periodId, benchmarkPeriodId } = req.query;
        if (!periodId || !benchmarkPeriodId) {
            return res.status(400).json({ message: "periodId and benchmarkPeriodId are required" });
        }
        const variances = await financeService.explainVariance(periodId as string, benchmarkPeriodId as string);
        res.json(variances);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Audit Logs
router.get("/gl/audit-logs", async (req, res) => {
    try {
        const logs = await financeService.listAuditLogs();
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Mass Allocations
router.get("/gl/allocations", async (req, res) => {
    try {
        const ledgerId = (req.query.ledgerId as string) || "primary-ledger-001";
        const allocations = await db.select().from(glAllocations).where(eq(glAllocations.ledgerId, ledgerId));
        res.json(allocations);
    } catch (error) {
        res.status(500).json({ error: "Failed to list allocations" });
    }
});

router.post("/gl/allocations", async (req, res) => {
    try {
        const [allocation] = await db.insert(glAllocations).values(req.body).returning();
        res.status(201).json(allocation);
    } catch (error) {
        res.status(500).json({ error: "Failed to create allocation" });
    }
});

router.post("/gl/allocations/:id/run", async (req, res) => {
    try {
        const { periodName } = req.body;
        if (!periodName) return res.status(400).json({ error: "Period Name is required" });

        const result = await financeService.runAllocation(req.params.id, periodName);
        res.json(result);
    } catch (error: any) {
        console.error("Allocation Run Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Advanced GL Routes (Phase 4)
router.post("/gl/revaluations/run", async (req, res) => {
    try {
        const { ledgerId, periodName, currencyCode } = req.body;
        const result = await financeService.runRevaluation(ledgerId, periodName, currencyCode);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/gl/recurring-journals", async (req, res) => {
    try {
        const payload = { ...req.body };
        if (payload.nextRunDate && typeof payload.nextRunDate === 'string') {
            payload.nextRunDate = new Date(payload.nextRunDate);
        }

        const result = await financeService.createRecurringJournal(payload);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/gl/recurring-journals", async (req, res) => {
    try {
        const ledgerId = (req.query.ledgerId as string) || "primary-ledger-001";
        const result = await financeService.listRecurringJournals(ledgerId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/gl/recurring-journals/process", async (req, res) => {
    try {
        const { ledgerId } = req.body;
        const result = await financeService.processRecurringJournals(ledgerId);
        res.json({ processed: result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/gl/journals/:id/toggle-auto-reverse", async (req, res) => {
    try {
        const result = await financeService.toggleAutoReverse(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/gl/auto-reversals/process", async (req, res) => {
    try {
        const { ledgerId, periodName } = req.body;
        const result = await financeService.processAutoReversals(ledgerId, periodName); // Reverse journals INTO this period
        res.json({ reversedJournalIds: result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/gl/reconciliation/:ledgerId", async (req, res) => {
    try {
        const { ledgerId } = req.params;
        const periodName = req.query.periodName as string;
        if (!periodName) return res.status(400).json({ error: "periodName required" });
        const result = await financeService.getReconciliationSummary(ledgerId, periodName);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Legal Entities
router.get("/gl/legal-entities", async (req, res) => {
    const entities = await financeService.listLegalEntities();
    res.json(entities);
});

router.post("/gl/legal-entities", async (req, res) => {
    const data = insertGlLegalEntitySchema.parse(req.body);
    const entity = await financeService.createLegalEntity(data);
    res.json(entity);
});

router.patch("/gl/legal-entities/:id", async (req, res) => {
    const entity = await financeService.updateLegalEntity(req.params.id, req.body);
    res.json(entity);
});

// Ledger Relationships
router.get("/gl/ledger-relationships", async (req, res) => {
    const relationships = await financeService.listLedgerRelationships();
    res.json(relationships);
});

router.post("/gl/ledger-relationships", async (req, res) => {
    const data = insertGlLedgerRelationshipSchema.parse(req.body);
    const relationship = await financeService.createLedgerRelationship(data);
    res.json(relationship);
});

// Ledgers
router.get("/gl/ledgers", async (req, res) => {
    const ledgers = await financeService.listLedgers();
    res.json(ledgers);
});

router.post("/gl/ledgers", async (req, res) => {
    const data = insertGlLedgerSchema.parse(req.body);
    const ledger = await financeService.createLedger(data);
    res.json(ledger);
});

router.get("/gl/ledgers/:id", async (req, res) => {
    const ledger = await financeService.getLedger(req.params.id);
    res.json(ledger);
});

export default router;
