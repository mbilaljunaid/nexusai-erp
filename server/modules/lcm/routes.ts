import { Router } from "express";
import { lcmController } from "./lcm.controller";

export const lcmRouter = Router();

// Components
lcmRouter.get("/components", lcmController.listCostComponents);
lcmRouter.post("/components", lcmController.createCostComponent);

// Trade Operations
lcmRouter.get("/trade-operations", lcmController.listTradeOperations);
lcmRouter.get("/trade-operations/:id", lcmController.getTradeOperationDetails);
lcmRouter.post("/trade-operations", lcmController.createTradeOperation);
lcmRouter.post("/trade-operations/:id/close", lcmController.closeTradeOperation);
lcmRouter.post("/trade-operations/:id/charges", lcmController.addCharge);

// Allocations
lcmRouter.post("/trade-operations/:id/allocate", lcmController.allocateTradeOperation);
lcmRouter.get("/trade-operations/:id/allocations", lcmController.listAllocations);

// AI Prediction
lcmRouter.post("/trade-operations/:id/predict", lcmController.predictCosts);

// Accounting
lcmRouter.post("/trade-operations/:id/accounting", lcmController.createAccounting);

// Landed Cost Apportionment Batches
lcmRouter.post("/apportionment-batches", lcmController.createApportionmentBatch);
lcmRouter.post("/apportionment-batches/:id/calculate", lcmController.calculateApportionment);
lcmRouter.post("/apportionment-batches/:id/post", lcmController.postApportionmentToCost);
