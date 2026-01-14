import { Express, Request, Response } from "express";
import { manufacturingService } from "../../services/ManufacturingService";
import {
    insertProductionOrderSchema, insertBomSchema, insertRoutingSchema,
    insertWorkCenterSchema, insertResourceSchema, insertProductionTransactionSchema,
    insertQualityInspectionSchema
} from "../../../shared/schema";

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
}
