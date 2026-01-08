import { Router } from "express";
import { financeService } from "../services/finance";
import { insertGlAccountSchema, insertGlPeriodSchema, insertGlJournalSchema, insertGlJournalLineSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

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
    const periods = await financeService.listPeriods();
    res.json(periods);
});

router.post("/gl/periods", async (req, res) => {
    const data = insertGlPeriodSchema.parse(req.body);
    const period = await financeService.createPeriod(data);
    res.json(period);
});

router.post("/gl/periods/:id/close", async (req, res) => {
    const period = await financeService.closePeriod(req.params.id);
    res.json(period);
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
    const schema = z.object({
        journal: insertGlJournalSchema,
        lines: z.array(insertGlJournalLineSchema.omit({ journalId: true }))
    });

    const { journal: journalData, lines: linesData } = schema.parse(req.body);

    try {
        const result = await financeService.createJournal(journalData, linesData);
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
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

export default router;
