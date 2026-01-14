import { Express, Request, Response } from "express";
import { manufacturingService } from "../../services/ManufacturingService";
import {
    insertProductionOrderSchema, insertBomSchema, insertRoutingSchema,
    insertWorkCenterSchema, insertResourceSchema, insertProductionTransactionSchema,
    insertQualityInspectionSchema, insertProductionCalendarSchema,
    insertShiftSchema, insertStandardOperationSchema,
    insertCostElementSchema, insertStandardCostSchema,
    insertOverheadRuleSchema
} from "../../../shared/schema";
import { manufacturingCostingService } from "../../services/ManufacturingCostingService";

export function registerManufacturingRoutes(app: Express) {
    // Work Orders
    app.get("/api/manufacturing/work-orders", async (req, res) => {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;

            const result = await manufacturingService.listWorkOrders(limit, offset, { startDate, endDate });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/work-orders", async (req, res) => {
        try {
            const parseResult = insertProductionOrderSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const order = await manufacturingService.createWorkOrder(parseResult.data);
            res.status(201).json(order);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.patch("/api/manufacturing/work-orders/:id/status", async (req, res) => {
        try {
            const { status } = req.body;
            if (!status) return res.status(400).json({ error: "Status is required" });
            const order = await manufacturingService.updateWorkOrderStatus(req.params.id, status);
            res.json(order);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Engineering: BOM
    app.get("/api/manufacturing/bom", async (req, res) => {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;
            const boms = await manufacturingService.listBoms(limit, offset);
            res.json(boms);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/manufacturing/bom/:id", async (req, res) => {
        try {
            const bom = await manufacturingService.getBom(req.params.id);
            if (!bom) return res.status(404).json({ error: "BOM not found" });
            res.json(bom);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/bom", async (req, res) => {
        try {
            const result = await manufacturingService.createBom(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Engineering: Routings
    app.get("/api/manufacturing/routings", async (req, res) => {
        try {
            const routings = await manufacturingService.getRoutings();
            res.json(routings);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/manufacturing/routings/:id", async (req, res) => {
        try {
            const routing = await manufacturingService.getRouting(req.params.id);
            if (!routing) return res.status(404).json({ error: "Routing not found" });
            res.json(routing);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/routings", async (req, res) => {
        try {
            const result = await manufacturingService.createRouting(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Setup: Work Centers
    app.get("/api/manufacturing/work-centers", async (req, res) => {
        try {
            const centers = await manufacturingService.getWorkCenters();
            res.json(centers);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/work-centers", async (req, res) => {
        try {
            const parseResult = insertWorkCenterSchema.safeParse(req.body);
            if (!parseResult.success) return res.status(400).json({ error: parseResult.error });
            const result = await manufacturingService.createWorkCenter(parseResult.data);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Setup: Resources
    app.get("/api/manufacturing/resources", async (req, res) => {
        try {
            const resources = await manufacturingService.getResources();
            res.json(resources);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/resources", async (req, res) => {
        try {
            const parseResult = insertResourceSchema.safeParse(req.body);
            if (!parseResult.success) return res.status(400).json({ error: parseResult.error });
            const result = await manufacturingService.createResource(parseResult.data);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Setup: Calendars & Shifts (L8)
    app.get("/api/manufacturing/calendars", async (req, res) => {
        try {
            const calendars = await manufacturingService.getCalendars();
            res.json(calendars);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/calendars", async (req, res) => {
        try {
            const parseResult = insertProductionCalendarSchema.safeParse(req.body);
            if (!parseResult.success) return res.status(400).json({ error: parseResult.error });
            const result = await manufacturingService.createCalendar(parseResult.data);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/manufacturing/calendars/:id/shifts", async (req, res) => {
        try {
            const shifts = await manufacturingService.getShifts(req.params.id);
            res.json(shifts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/shifts", async (req, res) => {
        try {
            const parseResult = insertShiftSchema.safeParse(req.body);
            if (!parseResult.success) return res.status(400).json({ error: parseResult.error });
            const result = await manufacturingService.createShift(parseResult.data);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Standardization: Standard Operations (L9)
    app.get("/api/manufacturing/standard-operations", async (req, res) => {
        try {
            const ops = await manufacturingService.getStandardOperations();
            res.json(ops);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/standard-operations", async (req, res) => {
        try {
            const parseResult = insertStandardOperationSchema.safeParse(req.body);
            if (!parseResult.success) return res.status(400).json({ error: parseResult.error });
            const result = await manufacturingService.createStandardOperation(parseResult.data);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Transactions
    app.post("/api/manufacturing/transactions", async (req, res) => {
        try {
            const parseResult = insertProductionTransactionSchema.safeParse(req.body);
            if (!parseResult.success) return res.status(400).json({ error: parseResult.error });
            const result = await manufacturingService.recordTransaction(parseResult.data);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Quality
    app.get("/api/manufacturing/inspections", async (req, res) => {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;
            const results = await manufacturingService.listInspections(limit, offset);
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/inspections", async (req, res) => {
        try {
            const parseResult = insertQualityInspectionSchema.safeParse(req.body);
            if (!parseResult.success) return res.status(400).json({ error: parseResult.error });
            const result = await manufacturingService.createInspection(parseResult.data);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.patch("/api/manufacturing/inspections/:id", async (req, res) => {
        try {
            const { status, findings } = req.body;
            const result = await manufacturingService.updateInspectionStatus(req.params.id, status, findings);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // ========== COSTING & WIP (L20) ==========

    // Cost Elements
    app.get("/api/manufacturing/cost-elements", async (req, res) => {
        try {
            const elements = await manufacturingService.getCostElements(); // Need to implement this in service too
            res.json(elements);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/cost-elements", async (req, res) => {
        try {
            const parseResult = insertCostElementSchema.safeParse(req.body);
            if (!parseResult.success) return res.status(400).json({ error: parseResult.error });
            const result = await manufacturingService.createCostElement(parseResult.data);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Standard Costs
    app.get("/api/manufacturing/standard-costs", async (req, res) => {
        try {
            const costs = await manufacturingService.getStandardCosts();
            res.json(costs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/standard-costs/rollup", async (req, res) => {
        try {
            const { productId } = req.body;
            if (!productId) return res.status(400).json({ error: "Product ID is required" });
            const totalCost = await manufacturingCostingService.calculateStandardCost(productId);
            res.json({ productId, totalCost });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // WIP Balances
    app.get("/api/manufacturing/wip-balances", async (req, res) => {
        try {
            const balances = await manufacturingService.getWipBalances();
            res.json(balances);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Variance Journals
    app.get("/api/manufacturing/variance-journals", async (req, res) => {
        try {
            const journals = await manufacturingService.getVarianceJournals();
            res.json(journals);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });
}
