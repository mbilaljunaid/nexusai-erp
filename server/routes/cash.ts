
import { Router } from "express";
import { cashService } from "../services/cash";
import { cashImportService } from "../services/cash-import.service";
import { cashForecastService } from "../services/cash-forecast.service";
import { cashRevaluationService } from "../services/cash-revaluation.service";
import { insertCashBankAccountSchema, insertCashStatementLineSchema, insertCashTransactionSchema } from "@shared/schema";
import { ZodError } from "zod";
import multer from "multer";

const router = Router();

// Bank Accounts
router.get("/accounts", async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const accounts = await cashService.listBankAccounts(userId);
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: "Failed to list bank accounts" });
    }
});

router.post("/accounts", async (req, res) => {
    try {
        const data = insertCashBankAccountSchema.parse(req.body);
        const account = await cashService.createBankAccount({
            ...data,
            currentBalance: data.currentBalance
        } as any);
        res.status(201).json(account);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ message: "Invalid account data", errors: error.errors });
        } else {
            res.status(500).json({ message: "Failed to create bank account" });
        }
    }
});

// Cash Position / Dashboard
router.get("/position", async (req, res) => {
    try {
        const position = await cashService.getCashPosition();
        res.json(position);
    } catch (error) {
        res.status(500).json({ message: "Failed to get cash position" });
    }
});

router.get("/forecast", async (req, res) => {
    try {
        const { days } = req.query;
        const forecast = await cashForecastService.generateForecast(new Date(), Number(days) || 5);
        res.json(forecast);
    } catch (error) {
        res.status(500).json({ message: "Failed to generate cash forecast" });
    }
});

// Reconciliation
const upload = multer({ storage: multer.memoryStorage() });

router.post("/statements/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const bankAccountId = req.body.bankAccountId;
        const format = req.body.format || "CSV";

        if (!bankAccountId) {
            return res.status(400).json({ message: "Bank Account ID is required" });
        }

        const userId = req.headers['x-user-id'] as string || "system";
        const result = await cashService.importBankStatement(
            bankAccountId,
            req.file.buffer.toString('utf-8'),
            userId
        );

        res.json({ message: "Import successful", ...result });
    } catch (error) {
        console.error("Import error:", error);
        res.status(500).json({ message: "Failed to import statement: " + (error as Error).message });
    }
});

router.post("/accounts/:id/reconcile", async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string || "system";
        const result = await cashService.autoReconcile(req.params.id, userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Failed to run reconciliation" });
    }
});

router.post("/reconcile/manual", async (req, res) => {
    try {
        const { bankAccountId, lineIds, transactionIds } = req.body;
        const userId = req.headers['x-user-id'] as string || "system";

        if (!bankAccountId || !lineIds || !transactionIds) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const result = await cashService.manualReconcile(bankAccountId, lineIds, transactionIds, userId);
        res.json({ message: "Manual match successful", group: result });
    } catch (error) {
        console.error("Manual reconcile error:", error);
        res.status(500).json({ message: (error as Error).message });
    }
});

router.post("/reconcile/unmatch", async (req, res) => {
    try {
        const { matchingGroupId } = req.body;
        if (!matchingGroupId) return res.status(400).json({ message: "Missing Group ID" });

        await cashService.unmatchGroup(matchingGroupId);
        res.json({ message: "Unmatched successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to unmatch" });
    }
});

router.get("/accounts/:id/statement-lines", async (req, res) => {
    try {
        const lines = await cashService.listStatementLines(req.params.id);
        res.json(lines);
    } catch (error) {
        res.status(500).json({ message: "Failed to list statement lines" });
    }
});

router.get("/accounts/:id/transactions", async (req, res) => {
    try {
        const transactions = await cashService.listTransactions(req.params.id);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Failed to list transactions" });
    }
});

router.post("/transactions", async (req, res) => {
    try {
        const data = insertCashTransactionSchema.parse(req.body);
        const txn = await cashService.createTransaction(data);
        res.status(201).json(txn);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
        } else {
            res.status(500).json({ message: "Failed to create transaction" });
        }
    }
});

// Reconciliation Rules
router.get("/reconciliation-rules", async (req, res) => {
    try {
        const ledgerId = req.query.ledgerId as string || "PRIMARY";
        const rules = await cashService.listReconciliationRules(ledgerId);
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: "Failed to list reconciliation rules" });
    }
});

router.post("/reconciliation-rules", async (req, res) => {
    try {
        const rule = await cashService.createReconciliationRule(req.body);
        res.status(201).json(rule);
    } catch (error) {
        res.status(500).json({ message: "Failed to create reconciliation rule" });
    }
});

router.patch("/reconciliation-rules/:id", async (req, res) => {
    try {
        const rule = await cashService.updateReconciliationRule(req.params.id, req.body);
        res.json(rule);
    } catch (error) {
        res.status(500).json({ message: "Failed to update reconciliation rule" });
    }
});

router.delete("/reconciliation-rules/:id", async (req, res) => {
    try {
        await cashService.deleteReconciliationRule(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete reconciliation rule" });
    }
});

// Revaluation
router.post("/accounts/:id/revalue", async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string || "system";
        const result = await cashRevaluationService.postRevaluation(req.params.id, userId);
        res.json(result);
    } catch (error) {
        console.error("Revaluation error:", error);
        res.status(500).json({ message: "Failed to process revaluation: " + (error as Error).message });
    }
});

// Reconciliation Summary
router.get("/reconcile/summary", async (req, res) => {
    try {
        const ledgerId = req.query.ledgerId as string || "PRIMARY";
        const summary = await cashService.getReconciliationSummary(ledgerId);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: "Failed to get reconciliation summary" });
    }
});

export default router;

