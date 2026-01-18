
import { Router } from "express";
import { lcmService } from "./lcm.service";
import { lcmAllocationService } from "./lcm-allocation.service";
import { lcmAiService } from "./lcm-ai.service";
import { lcmAccountingService } from "./lcm-accounting.service";

export const lcmRoutes = Router();

// Components
lcmRoutes.get("/components", async (req, res) => {
    try {
        const results = await lcmService.listCostComponents();
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

lcmRoutes.post("/components", async (req, res) => {
    try {
        const result = await lcmService.createCostComponent(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Trade Operations
lcmRoutes.get("/trade-operations", async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const results = await lcmService.listTradeOperations(page, limit);
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

lcmRoutes.get("/trade-operations/:id", async (req, res) => {
    try {
        const result = await lcmService.getTradeOperationDetails(req.params.id);
        if (!result) return res.status(404).json({ error: "Trade Operation not found" });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

lcmRoutes.post("/trade-operations", async (req, res) => {
    try {
        // Supports partial creation or full creation
        const result = await lcmService.createTradeOperationWithLines({
            header: req.body,
            shipmentLines: [] // Logic to pull lines can be added here or separate endpoint
        });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

lcmRoutes.post("/trade-operations/:id/charges", async (req, res) => {
    try {
        const result = await lcmService.addCharge({ ...req.body, tradeOperationId: req.params.id });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Allocations
lcmRoutes.post("/trade-operations/:id/allocate", async (req, res) => {
    try {
        const result = await lcmAllocationService.allocateTradeOperation(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

lcmRoutes.get("/trade-operations/:id/allocations", async (req, res) => {
    try {
        const result = await lcmAllocationService.listAllocations(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// AI Prediction
lcmRoutes.post("/trade-operations/:id/predict", async (req, res) => {
    try {
        const result = await lcmAiService.predictCosts(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
// Accounting
lcmRoutes.post("/trade-operations/:id/accounting", async (req, res) => {
    try {
        const result = await lcmAccountingService.createAccounting(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
