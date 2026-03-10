import { Router } from "express";
import { revenueController } from "./revenue.controller";

export const revenueRouter = Router();

// Accounting Setup
revenueRouter.get("/config/accounting", revenueController.getAccountingConfig);
revenueRouter.post("/config/accounting", revenueController.updateAccountingConfig);

// Contracts (Workbench)
revenueRouter.get("/contracts", revenueController.getContracts);
revenueRouter.get("/contracts/:id", revenueController.getContractDetails);
revenueRouter.get("/contracts/:id/history", revenueController.getContractHistory);
revenueRouter.post("/contracts/:id/modify", revenueController.modifyContract);

// Source Events
revenueRouter.get("/events", revenueController.getEvents);
revenueRouter.post("/events", revenueController.ingestEvent);
revenueRouter.post("/jobs/process-events", revenueController.processEventsJob);

// SSP & Rules
revenueRouter.post("/ssp/books", revenueController.createSspBook);
revenueRouter.get("/ssp/books", revenueController.getSspBooks);
revenueRouter.post("/ssp/lines", revenueController.addSspLine);
revenueRouter.put("/ssp/lines/:id", revenueController.updateSspLine);
revenueRouter.delete("/ssp/lines/:id", revenueController.deleteSspLine);
revenueRouter.get("/ssp/books/:id/lines", revenueController.getSspLines);

revenueRouter.get("/rules/identification", revenueController.getIdentificationRules);
revenueRouter.post("/rules/identification", revenueController.createIdentificationRule);
revenueRouter.get("/rules/pob", revenueController.getPobRules);
revenueRouter.post("/rules/pob", revenueController.createPobRule);

// Reporting
revenueRouter.get("/reporting/waterfall", revenueController.getWaterfall);
revenueRouter.get("/reporting/deferred", revenueController.getDeferredMatrix);
revenueRouter.get("/forecasting/projection", revenueController.getForecast);

// Period Management
revenueRouter.get("/periods", revenueController.getPeriods);
revenueRouter.post("/periods/close", revenueController.closePeriod);
revenueRouter.post("/periods/:id/sweep", revenueController.sweepPeriod);
revenueRouter.post("/periods/auto-sweep", revenueController.autoSweepPeriod);

// Audit
revenueRouter.get("/audit/trace/:sourceId", revenueController.getAuditTrace);

