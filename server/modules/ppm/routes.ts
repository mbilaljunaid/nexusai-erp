import { Router } from "express";
import { ppmController } from "./ppm.controller";

export const ppmRouter = Router();

// ----------------------------------------------------
// PROJECT CRUD (BU-SCOPED)
// ----------------------------------------------------
ppmRouter.get("/projects", ppmController.getProjects);
ppmRouter.post("/projects", ppmController.createProject);
ppmRouter.get("/projects/:id", ppmController.getProjectById);

// ----------------------------------------------------
// PORTFOLIO SUMMARY (BU-SCOPED)
// ----------------------------------------------------
ppmRouter.get("/summary", ppmController.getSummary);

// ----------------------------------------------------
// ALLOCATION RULES
// ----------------------------------------------------
ppmRouter.get("/allocation-rules", ppmController.getAllocationRules);
ppmRouter.post("/allocation-rules", ppmController.createAllocationRule);
ppmRouter.put("/allocation-rules/:id", ppmController.updateAllocationRule);
ppmRouter.post("/allocation-rules/:id/run", ppmController.runAllocation);
ppmRouter.post("/allocation-preview", ppmController.getAllocationPreview);

// ----------------------------------------------------
// BURDEN SCHEDULES & RULES
// ----------------------------------------------------
ppmRouter.get("/burden-schedules", ppmController.getBurdenSchedules);
ppmRouter.post("/burden-schedules", ppmController.createBurdenSchedule);
ppmRouter.put("/burden-schedules/:id/tiers", ppmController.updateBurdenTiers);
ppmRouter.post("/burden-schedules/:id/simulate", ppmController.simulateBurdenSchedule);

// ----------------------------------------------------
// PROJECT PERFORMANCE (EVM)
// ----------------------------------------------------
ppmRouter.get("/projects/:id/performance", ppmController.getProjectPerformance);

// ----------------------------------------------------
// COST CAPTURE (IMPORT)
// ----------------------------------------------------
ppmRouter.post("/costs/validate-import", ppmController.validateImportCosts);
ppmRouter.post("/costs/import", ppmController.importCosts);
ppmRouter.get("/expenditures", ppmController.getExpenditures);

// ----------------------------------------------------
// COST PROCESSING (BURDENING & ACCOUNTING)
// ----------------------------------------------------
ppmRouter.post("/costs/:id/distribute", ppmController.distributeCosts);
ppmRouter.post("/costs/:id/burden", ppmController.burdenCosts);

// ----------------------------------------------------
// ASSET CAPITALIZATION (CIP)
// ----------------------------------------------------
ppmRouter.get("/projects/:id/assets", ppmController.getProjectAssets);
ppmRouter.post("/assets/:id/generate-lines", ppmController.generateAssetLines);
ppmRouter.post("/assets/:id/capitalize", ppmController.capitalizeAssets);
ppmRouter.get("/cip/portfolio", ppmController.getPortfolioAssets);
ppmRouter.post("/cip/consolidate", ppmController.consolidateAssets);

// ----------------------------------------------------
// PROJECT BILLING (INVOICING)
// ----------------------------------------------------
ppmRouter.get("/billing/summary", ppmController.getBillingSummary);
ppmRouter.get("/billing/:projectId/events", ppmController.getUnbilledEvents);
ppmRouter.get("/projects/:projectId/invoices", ppmController.getProjectInvoices);
ppmRouter.get("/invoices/:invoiceId/lines", ppmController.getInvoiceLines);
ppmRouter.post("/billing/:projectId/generate-events", ppmController.generateBillingEvents);
ppmRouter.post("/billing/:projectId/generate-invoice", ppmController.generateDraftInvoice);
ppmRouter.post("/invoices/:id/approve", ppmController.approveInvoice);
ppmRouter.post("/invoices/:id/submit-ar", ppmController.submitInvoiceToAr);

// ----------------------------------------------------
// PROJECT PLANNING (BUDGET & CONTROL)
// ----------------------------------------------------
ppmRouter.get("/planning/:projectId/budget", ppmController.getBudgetSummary);
ppmRouter.post("/planning/:projectId/budget", ppmController.createBudgetVersion);
ppmRouter.post("/planning/budget/:versionId/lines", ppmController.addBudgetLines);
ppmRouter.get("/planning/budget/:versionId/lines", ppmController.getBudgetLines);
ppmRouter.post("/planning/budget/:versionId/baseline", ppmController.baselineBudget);
ppmRouter.post("/planning/:projectId/control-rule", ppmController.setControlRule);
ppmRouter.post("/planning/:projectId/funds-check", ppmController.checkFunds);

// ----------------------------------------------------
// INTEGRATIONS (ERP & WEBHOOKS)
// ----------------------------------------------------
ppmRouter.get("/integrations/connections", ppmController.getConnections);
ppmRouter.post("/integrations/configure", ppmController.configureConnection);
ppmRouter.get("/integrations/history", ppmController.getIntegrationHistory);
ppmRouter.post("/integrations/sync", ppmController.syncConnection);
