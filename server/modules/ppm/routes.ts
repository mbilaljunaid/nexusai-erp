import { Router } from "express";
import { ppmController } from "./ppm.controller";

export const ppmRouter = Router();

// ----------------------------------------------------
// PROJECT PERFORMANCE (EVM)
// ----------------------------------------------------
ppmRouter.get("/projects/:id/performance", ppmController.getProjectPerformance);

// ----------------------------------------------------
// COST CAPTURE (IMPORT)
// ----------------------------------------------------
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

// ----------------------------------------------------
// PROJECT BILLING (INVOICING)
// ----------------------------------------------------
ppmRouter.get("/billing/:projectId/events", ppmController.getUnbilledEvents);
ppmRouter.get("/projects/:projectId/invoices", ppmController.getProjectInvoices);
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
ppmRouter.post("/planning/budget/:versionId/baseline", ppmController.baselineBudget);
ppmRouter.post("/planning/:projectId/control-rule", ppmController.setControlRule);
ppmRouter.post("/planning/:projectId/funds-check", ppmController.checkFunds);
