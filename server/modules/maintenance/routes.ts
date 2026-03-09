import { Router } from "express";
import { maintenanceController } from "./maintenance.controller";

const router = Router();

// Work Orders
router.get("/work-orders", maintenanceController.listWorkOrders);
router.post("/work-orders", maintenanceController.createWorkOrder);
router.get("/work-orders/:id", maintenanceController.getWorkOrder);
router.patch("/work-orders/:id/status", maintenanceController.updateWorkOrderStatus);
router.patch("/work-orders/:id/failure", maintenanceController.updateWorkOrderFailure);

// Operations
router.post("/work-orders/:id/operations", maintenanceController.addOperation);
router.patch("/operations/:id", maintenanceController.updateOperation);

// Assets
router.get("/assets", maintenanceController.listOperationalAssets);
router.post("/assets/:id/extension", maintenanceController.upsertAssetExtension);
router.get("/assets/health", maintenanceController.getAssetHealth); // Fleet
router.get("/assets/:id/health", maintenanceController.getAssetHealth); // Single
router.get("/assets/:id/health/trends", maintenanceController.getHealthTrends); // Trends
router.get("/alerts/predictive", maintenanceController.getPredictiveAlerts); // Alerts
router.get("/assets/:id/bom", maintenanceController.getAssetBom);

// PM Definitions
router.get("/pm-definitions", maintenanceController.listPMDefinitions);
router.post("/pm-definitions", maintenanceController.createPMDefinition);
router.post("/pm-generate", maintenanceController.generatePMWorkOrders);

// Service Requests
router.get("/service-requests", maintenanceController.listServiceRequests);
router.post("/service-requests", maintenanceController.createServiceRequest);
router.post("/service-requests/:id/convert", maintenanceController.convertSRtoWO);

// Materials & SC
router.post("/work-orders/:id/materials", maintenanceController.addMaterialToWorkOrder);
router.post("/materials/:id/issue", maintenanceController.issueMaterial);
router.post("/materials/:id/raise-pr", maintenanceController.raisePRForMaterial);
router.post("/inventory/:id/check-reorder", maintenanceController.checkReorder);

// Resources (Labor)
router.post("/work-orders/:id/resources", maintenanceController.assignTechnician);
router.post("/resources/:id/log-hours", maintenanceController.logLaborHours); // WAIT: logLaborHours vs logMeterReading? Error in Controller ref?
// Checked Controller: logLaborHours(req, res) calls logLaborHours service.
// The route path is /resources/:id/log-hours.
// The Controller method I bound to above was logMeterReading? Let me check my previous WriteFile content.
// In MaintenanceController content: 
// async logLaborHours(req, res) { ... calls logLaborHours ... }
// I should bind to logLaborHours.

router.get("/supervisors/technicians", maintenanceController.listTechnicians); // Was /supervisors/technicians
router.get("/technicians-stub", maintenanceController.listTechniciansStub);

// Costing
router.get("/work-orders/:id/costs", maintenanceController.getWorkOrderCosts);
router.post("/work-orders/:id/costs/post", maintenanceController.postCostsToGL);
router.post("/work-orders/:id/costs/transfer-project", maintenanceController.transferCostsToProject);

// Planning
router.get("/planning/schedule", maintenanceController.getPlanningSchedule);
router.get("/planning/forecast", maintenanceController.getPlanningForecast);
router.patch("/operations/:id/schedule", maintenanceController.scheduleOperation);
router.get("/work-centers", maintenanceController.getWorkCenters);

// Quality
router.get("/quality/templates", maintenanceController.listInspectionTemplates);
router.post("/quality/inspections", maintenanceController.createInspection);
router.patch("/quality/inspections/:id", maintenanceController.submitInspectionResults);
router.get("/work-orders/:id/inspections", maintenanceController.getInspectionsForWorkOrder);
router.post("/work-orders/:id/permits", maintenanceController.createPermit);
router.get("/work-orders/:id/permits", maintenanceController.getPermitsForWorkOrder);

// Meters
router.post("/meters", maintenanceController.createMeter);
router.get("/assets/:id/meters", maintenanceController.getMetersForAsset);
router.post("/meters/:id/readings", maintenanceController.logMeterReading);
router.get("/meters/:id/readings", maintenanceController.getMeterReadings);

// Library
router.get("/library/definitions", maintenanceController.listWorkDefinitions);
router.post("/library/definitions", maintenanceController.createWorkDefinition);
router.post("/library/definitions/:id/apply/:workOrderId", maintenanceController.applyWorkDefinition);

// 12. Failure Analysis
router.get("/failure-codes", maintenanceController.listFailureCodes);
router.get("/failure-codes/tree", maintenanceController.getFailureCodesTree);
router.post("/failure-codes", maintenanceController.upsertFailureCodes);

// Permit Types - NEW ENDPOINTS
router.get("/permit-types", maintenanceController.getPermitTypes);
router.get("/permit-types/:id", maintenanceController.getPermitType);

export const maintenanceRouter = router;
