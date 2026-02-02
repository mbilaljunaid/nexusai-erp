import { Request, Response } from "express";
import { lcmService } from "./lcm.service";
import { lcmAllocationService } from "./lcm-allocation.service";
import { lcmAiService } from "./lcm-ai.service";
import { lcmAccountingService } from "./lcm-accounting.service";

export class LcmController {
    // Components
    listCostComponents = async (req: Request, res: Response) => {
        try {
            const results = await lcmService.listCostComponents();
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    createCostComponent = async (req: Request, res: Response) => {
        try {
            const result = await lcmService.createCostComponent(req.body);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Trade Operations
    listTradeOperations = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const results = await lcmService.listTradeOperations(page, limit);
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    getTradeOperationDetails = async (req: Request, res: Response) => {
        try {
            const result = await lcmService.getTradeOperationDetails(req.params.id);
            if (!result) return res.status(404).json({ error: "Trade Operation not found" });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    createTradeOperation = async (req: Request, res: Response) => {
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
    }

    closeTradeOperation = async (req: Request, res: Response) => {
        try {
            const result = await lcmService.closeTradeOperation(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    addCharge = async (req: Request, res: Response) => {
        try {
            const result = await lcmService.addCharge({ ...req.body, tradeOperationId: req.params.id });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Allocations
    allocateTradeOperation = async (req: Request, res: Response) => {
        try {
            const result = await lcmAllocationService.allocateTradeOperation(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    listAllocations = async (req: Request, res: Response) => {
        try {
            const result = await lcmAllocationService.listAllocations(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // AI Prediction
    predictCosts = async (req: Request, res: Response) => {
        try {
            const result = await lcmAiService.predictCosts(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Accounting
    createAccounting = async (req: Request, res: Response) => {
        try {
            const result = await lcmAccountingService.createAccounting(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const lcmController = new LcmController();
