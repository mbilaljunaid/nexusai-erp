import { Router } from "express";
import { contractService } from "../services/ContractService";
import { enforceRBAC } from "../middleware/auth";
import { db } from "../db";
import { contractClauses } from "../../shared/schema/scm";

const router = Router();

// Protected Routes (SCM Write Access Required)

/**
 * List all contracts for a specific supplier
 */
router.get("/contracts/supplier/:id", enforceRBAC("scm_read"), async (req, res) => {
    try {
        const contracts = await contractService.listContractsBySupplier(req.params.id);
        res.json(contracts);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * Get contract details with terms
 */
router.get("/contracts/:id", enforceRBAC("scm_read"), async (req, res) => {
    try {
        const contract = await contractService.getContractDetails(req.params.id);
        if (!contract) return res.status(404).json({ error: "Contract not found" });
        res.json(contract);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * Create a new contract
 */
router.post("/contracts", enforceRBAC("scm_write"), async (req, res) => {
    try {
        const contract = await contractService.createContract(req.body);
        res.json(contract);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * Add clause to contract
 */
router.post("/contracts/:id/terms", enforceRBAC("scm_write"), async (req, res) => {
    try {
        const term = await contractService.addClauseToContract(req.params.id, req.body.clauseId, req.body.amendedText);
        res.json(term);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * Run AI Compliance Analysis
 */
router.post("/contracts/:id/analyze", enforceRBAC("scm_write"), async (req, res) => {
    try {
        const analysis = await contractService.analyzeContractCompliance(req.params.id);
        res.json(analysis);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * Clause Library Browser
 */
router.get("/clauses", enforceRBAC("scm_read"), async (req, res) => {
    try {
        const clauses = await db.select().from(contractClauses);
        res.json(clauses);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * Seed Library (Utility)
 */
router.post("/clauses/seed", enforceRBAC("scm_write"), async (req, res) => {
    try {
        await contractService.seedClauseLibrary();
        res.json({ message: "Library seeded" });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
