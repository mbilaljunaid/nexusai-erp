
import { Router } from "express";
import { cashService } from "../services/cash";
import { insertCashBankAccountSchema, insertCashStatementLineSchema } from "@shared/schema";
import { ZodError } from "zod";

const router = Router();

// Bank Accounts
router.get("/accounts", async (req, res) => {
    try {
        const accounts = await cashService.listBankAccounts();
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

// Reconciliation
router.post("/accounts/:id/import", async (req, res) => {
    try {
        // Expects array of lines
        const lines = req.body.lines; // Validate generic array first
        // In real app, we'd parse CSV here.
        // Assuming JSON input for now matching schema
        const results = await cashService.importBankStatement(req.params.id, lines);
        res.json({ message: "Import successful", count: results.length });
    } catch (error) {
        res.status(500).json({ message: "Failed to import statement" });
    }
});

router.post("/accounts/:id/reconcile", async (req, res) => {
    try {
        const result = await cashService.autoReconcile(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Failed to run reconciliation" });
    }
});

export default router;
