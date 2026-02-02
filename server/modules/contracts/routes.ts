
import { Router } from "express";
import { contractService } from "../../services/ContractService";

const router = Router();

// GET /api/contracts
router.get("/", async (req, res) => {
    try {
        const { limit, offset, status, type, search } = req.query;
        const result = await contractService.listContracts(
            Number(limit) || 20,
            Number(offset) || 0,
            {
                status: status as string,
                type: type as string,
                search: search as string
            }
        );
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/contracts/:id
router.get("/:id", async (req, res) => {
    try {
        const contract = await contractService.getContract(req.params.id);
        if (!contract) return res.status(404).json({ error: "Contract not found" });
        res.json(contract);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/contracts
router.post("/", async (req, res) => {
    try {
        const contract = await contractService.createContract(req.body);
        res.status(201).json(contract);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/contracts/:id
router.patch("/:id", async (req, res) => {
    try {
        const updated = await contractService.updateContract(req.params.id, req.body);
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/contracts/:id/lines
router.post("/:id/lines", async (req, res) => {
    try {
        const data = { ...req.body, contractId: req.params.id };
        const line = await contractService.addLine(data);
        res.status(201).json(line);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/contracts/:id/documents
router.post("/:id/documents", async (req, res) => {
    try {
        const data = { ...req.body, contractId: req.params.id };
        const doc = await contractService.addDocument(data);
        res.status(201).json(doc);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
