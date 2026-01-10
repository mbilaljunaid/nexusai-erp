import { Router } from "express";
import { financeService } from "../services/finance";
import { reportingService } from "../services/reporting";
import {
    insertGlAccountSchema, insertGlPeriodSchema, insertGlJournalSchema,
    insertGlJournalLineSchema, glAllocations, insertGlLegalEntitySchema,
    insertGlLedgerRelationshipSchema, insertGlLedgerSchema,
    insertGlValueSetSchema, insertGlCoaStructureSchema, insertGlSegmentSchema,
    insertGlSegmentValueSchema, insertGlSegmentHierarchySchema,
    insertGlCrossValidationRuleSchema, insertGlDataAccessSetSchema, insertGlDataAccessSetAssignmentSchema
} from "@shared/schema";
import { z } from "zod";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { storage } from "../storage";

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

// FSG Reporting
router.get("/gl/fsg/row-sets", async (req, res) => {
    const ledgerId = req.query.ledgerId as string;
    if (!ledgerId) return res.status(400).json({ error: "ledgerId required" });
    const sets = await storage.listFsgRowSets(ledgerId);
    res.json(sets);
});

router.post("/gl/fsg/row-sets", async (req, res) => {
    const set = await storage.createFsgRowSet(req.body);
    res.json(set);
});

router.get("/gl/fsg/column-sets", async (req, res) => {
    const ledgerId = req.query.ledgerId as string;
    if (!ledgerId) return res.status(400).json({ error: "ledgerId required" });
    const sets = await storage.listFsgColumnSets(ledgerId);
    res.json(sets);
});

router.post("/gl/fsg/column-sets", async (req, res) => {
    const set = await storage.createFsgColumnSet(req.body);
    res.json(set);
});

// FSG Rows (Children of Row Sets)
router.get("/gl/fsg/row-sets/:id/rows", async (req, res) => {
    const rows = await storage.getFsgRows(req.params.id);
    res.json(rows);
});

router.post("/gl/fsg/rows", async (req, res) => {
    // Expected body: { rowSetId, sequence, description, rowType, ... }
    const row = await storage.createFsgRow(req.body);
    res.json(row);
});

router.get("/gl/fsg/column-sets/:id/columns", async (req, res) => {
    const cols = await storage.getFsgColumns(req.params.id);
    res.json(cols);
});

router.post("/gl/fsg/columns", async (req, res) => {
    const col = await storage.createFsgColumn(req.body);
    res.json(col);
});

router.get("/gl/fsg/reports", async (req, res) => {
    const ledgerId = req.query.ledgerId as string;
    const reports = await storage.listReportDefinitions(ledgerId);
    res.json(reports);
});

router.post("/gl/fsg/reports", async (req, res) => {
    const report = await storage.createReportDefinition(req.body);
    res.json(report);
});

router.post("/gl/fsg/generate", async (req, res) => {
    try {
        const { reportId, ledgerId, periodName, format } = req.body;
        if (!reportId || !ledgerId || !periodName) {
            return res.status(400).json({ error: "Missing required params" });
        }
        const result = await reportingService.generateFsgReport(reportId, ledgerId, periodName, format);
        res.json(result);
    } catch (e: any) {
        console.error("FSG Generation Error:", e);
        res.status(500).json({ error: e.message });
    }
});

router.post("/gl/fsg/schedules", async (req, res) => {
    try {
        const schedule = await reportingService.scheduleReport(req.body);
        res.json(schedule);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
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

// Master Data (Chunk 4)

// Value Sets
router.get("/gl/value-sets", async (req, res) => {
    const valueSets = await financeService.listValueSets();
    res.json(valueSets);
});

router.post("/gl/value-sets", async (req, res) => {
    const data = insertGlValueSetSchema.parse(req.body);
    const valueSet = await financeService.createValueSet(data);
    res.json(valueSet);
});

// CoA Structures
router.get("/gl/coa-structures", async (req, res) => {
    const structures = await financeService.listCoaStructures();
    res.json(structures);
});

router.post("/gl/coa-structures", async (req, res) => {
    const data = insertGlCoaStructureSchema.parse(req.body);
    const structure = await financeService.createCoaStructure(data);
    res.json(structure);
});

// Segments
router.get("/gl/segments", async (req, res) => {
    const coaStructureId = req.query.coaStructureId as string;
    if (!coaStructureId) return res.status(400).json({ error: "coaStructureId required" });
    const segments = await financeService.listSegments(coaStructureId);
    res.json(segments);
});

router.post("/gl/segments", async (req, res) => {
    const data = insertGlSegmentSchema.parse(req.body);
    const segment = await financeService.createSegment(data);
    res.json(segment);
});

// Segment Values
router.get("/gl/segment-values", async (req, res) => {
    const valueSetId = req.query.valueSetId as string;
    if (!valueSetId) return res.status(400).json({ error: "valueSetId required" });
    const values = await financeService.listSegmentValues(valueSetId);
    res.json(values);
});

router.post("/gl/segment-values", async (req, res) => {
    const data = insertGlSegmentValueSchema.parse(req.body);
    const value = await financeService.createSegmentValue(data);
    res.json(value);
});

router.get("/gl/segment-hierarchies", async (req, res) => {
    const valueSetId = req.query.valueSetId as string;
    if (!valueSetId) return res.status(400).json({ error: "valueSetId required" });
    const hierarchies = await financeService.listSegmentHierarchies(valueSetId);
    res.json(hierarchies);
});

router.post("/gl/segment-hierarchies", async (req, res) => {
    const data = insertGlSegmentHierarchySchema.parse(req.body);
    const hierarchy = await financeService.createSegmentHierarchy(data);
    res.json(hierarchy);
});

// CVR & Security (Chunk 4 Part 2)

// Cross-Validation Rules
router.get("/gl/cvr", async (req, res) => {
    const ledgerId = req.query.ledgerId as string;
    if (!ledgerId) return res.status(400).json({ error: "ledgerId required" });
    const rules = await financeService.listCrossValidationRules(ledgerId);
    res.json(rules);
});

router.post("/gl/cvr", async (req, res) => {
    const data = insertGlCrossValidationRuleSchema.parse(req.body);
    const rule = await financeService.createCrossValidationRule(data);
    res.json(rule);
});

// Data Access Sets
router.get("/gl/access-sets", async (req, res) => {
    const sets = await financeService.listDataAccessSets();
    res.json(sets);
});

router.post("/gl/access-sets", async (req, res) => {
    const data = insertGlDataAccessSetSchema.parse(req.body);
    const set = await financeService.createDataAccessSet(data);
    res.json(set);
});

router.post("/gl/access-set-assignments", async (req, res) => {
    const data = insertGlDataAccessSetAssignmentSchema.parse(req.body);
    const assignment = await financeService.createDataAccessSetAssignment(data);
    res.json(assignment);
});

export default router;
