// @ts-nocheck
import { Request, Response } from "express";
import { manufacturingService } from "./services/ManufacturingService";
import { manufacturingPlanningService } from "./services/ManufacturingPlanningService";
import { manufacturingProcessService } from "./services/ManufacturingProcessService";
import { manufacturingCostingService } from "./services/ManufacturingCostingService";
import { costAnomalyService } from "../../services/CostAnomalyService"; // Assuming this stays or moves later? It's in root services list.
import { costPredicter } from "../../services/CostPredicter"; // Same
import { db } from "../../db";
import { costAnomalies, insertProductionOrderSchema, insertBomSchema, insertRoutingSchema, insertWorkCenterSchema, insertResourceSchema, insertProductionTransactionSchema, insertQualityInspectionSchema, insertProductionCalendarSchema, insertShiftSchema, insertStandardOperationSchema, insertCostElementSchema, insertStandardCostSchema, insertOhRuleSchema, insertDemandForecastSchema, insertMrpPlanSchema, formulas, recipes, manufacturingBatches } from "@shared/schema";
import { desc, eq, sql } from "drizzle-orm";

export class ManufacturingController {

    // ==============================================================================
    // 1. WORK ORDERS
    // ==============================================================================

    async listWorkOrders(req: Request, res: Response) {
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
    }

    async createWorkOrder(req: Request, res: Response) {
        try {
            const parseResult = insertProductionOrderSchema.required().safeParse(req.body); // Ensure parsing
            // Check original route: used insertProductionOrderSchema.
            // Zod schemas usually allow stripping unknown.
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const order = await manufacturingService.createWorkOrder(parseResult.data as any);
            res.status(201).json(order);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateWorkOrderStatus(req: Request, res: Response) {
        try {
            const { status } = req.body;
            if (!status) return res.status(400).json({ error: "Status is required" });
            const order = await manufacturingService.updateWorkOrderStatus(req.params.id, status);
            res.json(order);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 2. ENGINEERING (BOM & ROUTING)
    // ==============================================================================

    async listBoms(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;
            const boms = await manufacturingService.listBoms(limit, offset);
            res.json(boms);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getBom(req: Request, res: Response) {
        try {
            const bom = await manufacturingService.getBom(req.params.id);
            if (!bom) return res.status(404).json({ error: "BOM not found" });
            res.json(bom);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createBom(req: Request, res: Response) {
        try {
            // In route: manufacturingService.createBom(req.body)
            // req.body should match { header, items }
            const result = await manufacturingService.createBom(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async listRoutings(req: Request, res: Response) {
        try {
            const routings = await manufacturingService.getRoutings();
            res.json(routings);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getRouting(req: Request, res: Response) {
        try {
            const routing = await manufacturingService.getRouting(req.params.id);
            if (!routing) return res.status(404).json({ error: "Routing not found" });
            res.json(routing);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createRouting(req: Request, res: Response) {
        try {
            const result = await manufacturingService.createRouting(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }


    // ==============================================================================
    // 3. SETUP (Work Centers, Resources, Calendars)
    // ==============================================================================

    async listWorkCenters(req: Request, res: Response) {
        try {
            const centers = await manufacturingService.getWorkCenters();
            res.json(centers);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createWorkCenter(req: Request, res: Response) {
        try {
            const result = await manufacturingService.createWorkCenter(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async listResources(req: Request, res: Response) {
        try {
            const resources = await manufacturingService.getResources();
            res.json(resources);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createResource(req: Request, res: Response) {
        try {
            const result = await manufacturingService.createResource(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async listCalendars(req: Request, res: Response) {
        try {
            const calendars = await manufacturingService.getCalendars();
            res.json(calendars);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createCalendar(req: Request, res: Response) {
        try {
            const result = await manufacturingService.createCalendar(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async listShifts(req: Request, res: Response) {
        try {
            const shifts = await manufacturingService.getShifts(req.params.id);
            res.json(shifts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createShift(req: Request, res: Response) {
        try {
            // Note: In routes.ts it used insertShiftSchema.safeParse
            const result = await manufacturingService.createShift(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async listStandardOperations(req: Request, res: Response) {
        try {
            const ops = await manufacturingService.getStandardOperations();
            res.json(ops);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createStandardOperation(req: Request, res: Response) {
        try {
            const result = await manufacturingService.createStandardOperation(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 4. TRANSACTIONS
    // ==============================================================================

    async recordTransaction(req: Request, res: Response) {
        try {
            const result = await manufacturingService.recordTransaction(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 5. QUALITY (Inspections & LIMS)
    // ==============================================================================

    async listInspections(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;
            const results = await manufacturingService.listInspections(limit, offset);
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createInspection(req: Request, res: Response) {
        try {
            const result = await manufacturingService.createInspection(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateInspectionStatus(req: Request, res: Response) {
        try {
            const { status, findings } = req.body;
            const result = await manufacturingService.updateInspectionStatus(req.params.id, status, findings);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getQualityResults(req: Request, res: Response) {
        try {
            const results = await manufacturingProcessService.getQualityResults(req.params.inspectionId);
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async saveQualityResults(req: Request, res: Response) {
        try {
            await manufacturingProcessService.saveQualityResults(req.params.inspectionId, req.body);
            res.sendStatus(201);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }


    // ==============================================================================
    // 6. COSTING (Elements, Standard, WIP, Journals)
    // ==============================================================================

    async getCostElements(req: Request, res: Response) {
        try {
            const elements = await manufacturingService.getCostElements();
            res.json(elements);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createCostElement(req: Request, res: Response) {
        try {
            const result = await manufacturingService.createCostElement(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getStandardCosts(req: Request, res: Response) {
        try {
            const costs = await manufacturingService.getStandardCosts();
            res.json(costs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async calculateStandardCostRollup(req: Request, res: Response) {
        try {
            const { productId } = req.body;
            if (!productId) return res.status(400).json({ error: "Product ID is required" });
            const totalCost = await manufacturingCostingService.calculateStandardCost(productId);
            res.json({ productId, totalCost });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getWipBalances(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;
            const balances = await manufacturingService.getWipBalances(limit, offset);
            res.json(balances);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getVarianceJournals(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;
            const journals = await manufacturingService.getVarianceJournals(limit, offset, { startDate, endDate });
            res.json(journals);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Cost AI
    async getCostAnomalies(req: Request, res: Response) {
        try {
            const results = await db.select().from(costAnomalies)
                .orderBy(desc(costAnomalies.createdAt))
                .limit(50);
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCostPrediction(req: Request, res: Response) {
        try {
            const result = await costPredicter.predictStandardCost(req.params.productId);
            if (!result) return res.status(404).json({ error: "No prediction data available for this item" });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 7. PLANNING (Forecasts, MRP)
    // ==============================================================================

    async getDemandForecasts(req: Request, res: Response) {
        try {
            const forecasts = await manufacturingPlanningService.getDemandForecasts();
            res.json(forecasts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createDemandForecast(req: Request, res: Response) {
        try {
            const validated = insertDemandForecastSchema.parse(req.body);
            const result = await manufacturingPlanningService.createDemandForecast(validated);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMrpPlans(req: Request, res: Response) {
        try {
            const plans = await manufacturingPlanningService.getMrpPlans();
            res.json(plans);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createMrpPlan(req: Request, res: Response) {
        try {
            const validated = insertMrpPlanSchema.parse(req.body);
            const result = await manufacturingPlanningService.createMrpPlan(validated);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async runMrpPlan(req: Request, res: Response) {
        try {
            const result = await manufacturingPlanningService.runMRP(req.params.id);
            res.json({ success: true, recommendations: result });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMrpRecommendations(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;
            const result = await manufacturingPlanningService.getRecommendations(req.params.id, limit, offset);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }


    // ==============================================================================
    // 8. PROCESS (Formulas, Recipes, Batches)
    // ==============================================================================

    async listFormulas(req: Request, res: Response) {
        try {
            const allFormulas = await db.query.formulas.findMany(); // Assuming manufacturingProcessService exposes this or use DB driven service
            // manufacturingProcessService doesn't have listFormulas, so using DB direct or will utilize service later.
            // Let's stick to using DB if service doesn't have it, or expand Service. 
            // Previous processRoutes.ts used `db.query.formulas.findMany()`.
            // Ideally should be in service, but Controller can failover for simple reads if not stricter.
            // Strict Mode: Use db here as Controller has access, but planned to move to Service. 
            // For now, mirroring previous logic.
            res.json(allFormulas);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createFormula(req: Request, res: Response) {
        try {
            const [newFormula] = await db.insert(formulas).values(req.body).returning();
            res.json(newFormula);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async listRecipes(req: Request, res: Response) {
        try {
            const allRecipes = await db.query.recipes.findMany();
            res.json(allRecipes);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createRecipe(req: Request, res: Response) {
        try {
            const [newRecipe] = await db.insert(recipes).values(req.body).returning();
            res.json(newRecipe);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async listBatches(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;

            const items = await db.query.manufacturingBatches.findMany({
                limit,
                offset,
                orderBy: (batches, { desc }) => [desc(batches.createdAt)]
            });

            const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(manufacturingBatches);
            res.json({ items, total: Number(countResult.count) });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getBatchGenealogy(req: Request, res: Response) {
        try {
            const lotNumber = req.query.lotNumber as string;
            if (!lotNumber) return res.status(400).json({ error: "Lot number is required" });
            const result = await manufacturingProcessService.getBatchGenealogy(lotNumber);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async releaseBatch(req: Request, res: Response) {
        try {
            const { recipeId, quantity } = req.body;
            const batch = await manufacturingProcessService.releaseBatch(recipeId, quantity);
            res.json(batch);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async recordBatchYield(req: Request, res: Response) {
        try {
            const { productId, quantity, type } = req.body;
            await manufacturingProcessService.recordYield(req.params.id, productId, quantity, type);
            res.sendStatus(200);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async closeBatch(req: Request, res: Response) {
        try {
            const result = await manufacturingProcessService.closeBatch(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const manufacturingController = new ManufacturingController();
