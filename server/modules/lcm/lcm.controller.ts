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
            const inventoryOrgId = req.headers['x-inventory-org-id'] as string | undefined;
            const results = await lcmService.listTradeOperations(page, limit, inventoryOrgId);
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
            const inventoryOrgId = req.headers['x-inventory-org-id'] as string | undefined;
            // Supports partial creation or full creation
            const result = await lcmService.createTradeOperationWithLines({
                header: { ...req.body, ...(inventoryOrgId ? { entInventoryOrgId: inventoryOrgId } : {}) },
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

    // Apportionment Batches (Landed Cost Apportionment)
    createApportionmentBatch = async (req: Request, res: Response) => {
        try {
            // MVP Backend flow: Return a generated Batch ID with DRAFT status
            const batch = {
                id: `b${Date.now()}`,
                batchNumber: `LCB-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                ...req.body,
                status: 'DRAFT',
                receiptLineCount: 0
            };
            res.status(201).json(batch);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    calculateApportionment = async (req: Request, res: Response) => {
        try {
            // MVP Backend flow: Simulate calculation success
            res.json({ success: true, status: 'CALCULATED', message: "Charges distributed to PO receipt lines." });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    postApportionmentToCost = async (req: Request, res: Response) => {
        try {
            // MVP Backend flow: Simulate posting success
            res.json({ success: true, status: 'POSTED', message: "Landed cost unit adjustments applied." });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const lcmController = new LcmController();
