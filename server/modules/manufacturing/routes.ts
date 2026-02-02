import { Router } from "express";
import { manufacturingController } from "./manufacturing.controller";

const router = Router();

// Work Orders
// Was /api/manufacturing/work-orders in monolithic express app.
// If imported as module router, prefix is likely handled by main app (check routes.ts).
// In NexusAI, main routes.ts usually mounts modules.
// Let's assume this router handles subpaths.
router.get("/work-orders", manufacturingController.listWorkOrders);
router.post("/work-orders", manufacturingController.createWorkOrder);
router.patch("/work-orders/:id/status", manufacturingController.updateWorkOrderStatus);

// Engineering: BOM
router.get("/bom", manufacturingController.listBoms);
router.post("/bom", manufacturingController.createBom);
router.get("/bom/:id", manufacturingController.getBom);

// Engineering: Routings
router.get("/routings", manufacturingController.listRoutings);
router.post("/routings", manufacturingController.createRouting);
router.get("/routings/:id", manufacturingController.getRouting);

// Setup: Centers, Resources, Calendars
router.get("/work-centers", manufacturingController.listWorkCenters);
router.post("/work-centers", manufacturingController.createWorkCenter);
router.get("/resources", manufacturingController.listResources);
router.post("/resources", manufacturingController.createResource);
router.get("/calendars", manufacturingController.listCalendars);
router.post("/calendars", manufacturingController.createCalendar);
router.get("/calendars/:id/shifts", manufacturingController.listShifts);
router.post("/shifts", manufacturingController.createShift); // Note: path was root /shifts? Or nested? Main app had /api/manufacturing/shifts. So /shifts here.
router.get("/standard-operations", manufacturingController.listStandardOperations);
router.post("/standard-operations", manufacturingController.createStandardOperation);

// Transactions
router.post("/transactions", manufacturingController.recordTransaction);

// Quality
router.get("/inspections", manufacturingController.listInspections);
router.post("/inspections", manufacturingController.createInspection);
router.patch("/inspections/:id", manufacturingController.updateInspectionStatus);
// Process Quality (LIMS)
router.get("/quality-results/:inspectionId", manufacturingController.getQualityResults);
router.post("/quality-results/:inspectionId", manufacturingController.saveQualityResults);

// Costing
router.get("/cost-elements", manufacturingController.getCostElements);
router.post("/cost-elements", manufacturingController.createCostElement);
router.get("/standard-costs", manufacturingController.getStandardCosts);
router.post("/standard-costs/rollup", manufacturingController.calculateStandardCostRollup);
router.get("/wip-balances", manufacturingController.getWipBalances);
router.get("/variance-journals", manufacturingController.getVarianceJournals);

// Cost AI
router.get("/cost-anomalies", manufacturingController.getCostAnomalies);
router.get("/cost-predictions/:productId", manufacturingController.getCostPrediction);

// Planning
// Main app mounted planningRoutes at /api/manufacturing/planning
// So these should be prefixed with /planning unless we mount this router at /api/manufacturing
// If using single router for module:
router.get("/planning/forecasts", manufacturingController.getDemandForecasts);
router.post("/planning/forecasts", manufacturingController.createDemandForecast);
router.get("/planning/mrp-plans", manufacturingController.getMrpPlans);
router.post("/planning/mrp-plans", manufacturingController.createMrpPlan);
router.post("/planning/mrp-plans/:id/run", manufacturingController.runMrpPlan);
router.get("/planning/mrp-plans/:id/recommendations", manufacturingController.getMrpRecommendations);

// Process (Formulas, Recipes, Batches)
router.get("/formulas", manufacturingController.listFormulas);
router.post("/formulas", manufacturingController.createFormula);
router.get("/recipes", manufacturingController.listRecipes);
router.post("/recipes", manufacturingController.createRecipe);
router.get("/batches", manufacturingController.listBatches);
router.get("/batches/genealogy", manufacturingController.getBatchGenealogy);
router.post("/batches/release", manufacturingController.releaseBatch);
router.post("/batches/:id/yield", manufacturingController.recordBatchYield);
router.post("/batches/:id/close", manufacturingController.closeBatch);

export const manufacturingRouter = router;
