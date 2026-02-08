// @ts-nocheck
import { Router } from "express";
// insertContractSchema is exported from shared/schema (via contracts.ts)
// We might need to make a partial schema for the DTO if it differs significantly
import { ContractService } from "../../services/ContractService";
import { z } from "zod";

export const contractRoutes = Router();

// Validation Schema for API Input (matches Frontend form)
const createContractDto = z.object({
    title: z.string().min(1),
    type: z.string().optional(),
    totalValue: z.number().or(z.string()).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
});

// LIST - PAGINATED
contractRoutes.get("/", async (req, res) => {
    try {
        const accountId = req.query.accountId as string;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const result = await ContractService.getAllContracts(accountId, page, limit);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// EXPIRING
contractRoutes.get("/expiring", async (req, res) => {
    try {
        const result = await ContractService.getExpiringContracts();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE
contractRoutes.post("/", async (req, res) => {
    try {
        const data = createContractDto.parse(req.body);
        const result = await ContractService.createContract(data);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// GET ONE
contractRoutes.get("/:id", async (req, res) => {
    try {
        const result = await ContractService.getContract(req.params.id);
        if (!result) return res.status(404).json({ error: "Contract not found" });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE
contractRoutes.patch("/:id", async (req, res) => {
    try {
        const result = await ContractService.updateContract(req.params.id, req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
