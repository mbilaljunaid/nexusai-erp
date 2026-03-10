import { Request, Response } from "express";
import { maintenanceService } from "./services/MaintenanceService";
import { maintenanceCostingService } from "./services/MaintenanceCostingService";
import { maintenancePlanningService } from "./services/MaintenancePlanningService";
import { maintenanceQualityService } from "./services/MaintenanceQualityService";
import { maintenanceAccountingService } from "./services/MaintenanceAccountingService";
import { maintenanceMeterService } from "./services/MaintenanceMeterService";
import { maintenanceLibraryService } from "./services/MaintenanceLibraryService";
import { failureAnalysisService } from "./services/FailureAnalysisService";
import { maintenanceSCMService } from "./services/MaintenanceSCMService";
import { assetHealthService } from "./services/AssetHealthService";
import { projectCostingIntegration } from "../../services/ProjectCostingIntegration"; // External
import { inventoryReorderService } from "../../services/InventoryReorderService"; // External
import { db } from "../../db";
import * as schema from "../../../shared/schema";
import { eq } from "drizzle-orm";

export class MaintenanceController {

    // ==============================================================================
    // 1. WORK ORDERS
    // ==============================================================================

    async listWorkOrders(req: Request, res: Response) {
        try {
            const { limit, offset, status, assignedToId, page, organizationId } = req.query;
            let finalOffset = Number(offset) || 0;
            const finalLimit = Number(limit) || 20;
            const invOrgId = req.headers['x-inventory-org-id'] as string | undefined;

            if (page) {
                finalOffset = (Number(page) - 1) * finalLimit;
            }

            const result = await maintenanceService.listWorkOrders(
                finalLimit,
                finalOffset,
                {
                    status: status as string,
                    assignedToId: assignedToId === 'null' ? null : (assignedToId as string),
                    organizationId: (organizationId as string) || invOrgId,
                    entInventoryOrgId: invOrgId
                }
            );
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getWorkOrder(req: Request, res: Response) {
        try {
            const wo = await maintenanceService.getWorkOrder(req.params.id);
            if (!wo) return res.status(404).json({ error: "Work Order not found" });
            res.json(wo);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createWorkOrder(req: Request, res: Response) {
        try {
            const invOrgId = req.headers['x-inventory-org-id'] as string | undefined;
            const wo = await maintenanceService.createWorkOrder({
                ...req.body,
                ...(invOrgId ? { entInventoryOrgId: invOrgId } : {})
            });
            res.json(wo);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateWorkOrderStatus(req: Request, res: Response) {
        try {
            const wo = await maintenanceService.updateWorkOrderStatus(req.params.id, req.body.status);
            res.json(wo);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateWorkOrderFailure(req: Request, res: Response) {
        try {
            const { problemId, causeId, remedyId } = req.body;
            const wo = await maintenanceService.updateWorkOrderFailure(req.params.id, {
                failureProblemId: problemId,
                failureCauseId: causeId,
                failureRemedyId: remedyId
            });
            res.json(wo);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async addOperation(req: Request, res: Response) {
        try {
            const op = await maintenanceService.addOperation(req.params.id, req.body);
            res.json(op);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateOperation(req: Request, res: Response) {
        try {
            const op = await maintenanceService.updateOperation(req.params.id, req.body);
            res.json(op);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 2. ASSETS (Operational)
    // ==============================================================================

    async listOperationalAssets(req: Request, res: Response) {
        try {
            const accountId = req.query.accountId as string;
            const assets = await maintenanceService.listOperationalAssets({ accountId });
            res.json(assets);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async upsertAssetExtension(req: Request, res: Response) {
        try {
            const ext = await maintenanceService.upsertAssetExtension({ ...req.body, assetId: req.params.id });
            res.json(ext);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAssetHealth(req: Request, res: Response) {
        try {
            if (req.params.id) {
                const health = await assetHealthService.getAssetHealth(req.params.id);
                res.json(health);
            } else {
                const health = await assetHealthService.getFleetHealth();
                res.json(health);
            }
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPredictiveAlerts(req: Request, res: Response) {
        try {
            const alerts = await assetHealthService.getPredictiveAlerts();
            res.json(alerts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getHealthTrends(req: Request, res: Response) {
        try {
            if (!req.params.id) return res.status(400).json({ error: "Asset ID is required" });
            const trends = await assetHealthService.getHealthTrends(req.params.id);
            res.json(trends);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAssetBom(req: Request, res: Response) {
        try {
            // Mock BOM response until DB populated
            res.json([
                { id: "1", itemNumber: "BRG-6205", description: "Ball Bearing", quantity: 2, isCritical: true },
                { id: "2", itemNumber: "FLT-AIR-05", description: "Air Filter", quantity: 1, isCritical: false }
            ]);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }


    // ==============================================================================
    // 3. PREVENTIVE MAINTENANCE
    // ==============================================================================

    async listPMDefinitions(req: Request, res: Response) {
        try {
            const pms = await maintenanceService.listPMDefinitions();
            res.json(pms);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createPMDefinition(req: Request, res: Response) {
        try {
            const pm = await maintenanceService.createPMDefinition(req.body);
            res.json(pm);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async generatePMWorkOrders(req: Request, res: Response) {
        try {
            const count = await maintenanceService.generatePMWorkOrders();
            res.json({ generated: count.length, workOrders: count });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 4. SERVICE REQUESTS
    // ==============================================================================

    async listServiceRequests(req: Request, res: Response) {
        try {
            const srs = await maintenanceService.listServiceRequests();
            res.json(srs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createServiceRequest(req: Request, res: Response) {
        try {
            const sr = await maintenanceService.createServiceRequest(req.body);
            res.json(sr);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async convertSRtoWO(req: Request, res: Response) {
        try {
            const wo = await maintenanceService.convertSRtoWO(req.params.id, req.body);
            res.json(wo);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 5. MATERIALS & SC
    // ==============================================================================

    async addMaterialToWorkOrder(req: Request, res: Response) {
        try {
            const mat = await maintenanceService.addMaterialToWorkOrder(req.params.id, req.body);
            res.json(mat);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async issueMaterial(req: Request, res: Response) {
        try {
            const mat = await maintenanceService.issueMaterial(req.params.id);
            res.json(mat);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async raisePRForMaterial(req: Request, res: Response) {
        try {
            const result = await maintenanceSCMService.raisePRForMaterial(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async checkReorder(req: Request, res: Response) {
        try {
            await inventoryReorderService.checkAndReorder(req.params.id);
            res.json({ success: true, message: "Reorder check complete" });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 6. RESOURCES (Labor)
    // ==============================================================================

    async assignTechnician(req: Request, res: Response) {
        try {
            const resAss = await maintenanceService.assignTechnician(req.params.id, req.body);
            res.json(resAss);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async logLaborHours(req: Request, res: Response) {
        try {
            // body: { hours: 2.5 }
            const resLog = await maintenanceService.logLaborHours(req.params.id, req.body.hours);
            res.json(resLog);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async listTechnicians(req: Request, res: Response) {
        try {
            const techs = await maintenanceService.listTechnicians();
            res.json(techs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async listTechniciansStub(req: Request, res: Response) {
        // Return mock users for now as we might not have users with 'TECHNICIAN' role in seed
        res.json([
            { id: "user-1", username: "john.doe", fullName: "John Doe" },
            { id: "user-2", username: "sarah.connor", fullName: "Sarah Connor" },
            { id: "user-3", username: "mike.ross", fullName: "Mike Ross" }
        ]);
    }

    // ==============================================================================
    // 7. COSTING & FINANCIALS
    // ==============================================================================

    async getWorkOrderCosts(req: Request, res: Response) {
        try {
            const costs = await maintenanceCostingService.getWorkOrderCosts(req.params.id);
            res.json(costs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async postCostsToGL(req: Request, res: Response) {
        try {
            const result = await maintenanceCostingService.postCostsToGL(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async transferCostsToProject(req: Request, res: Response) {
        try {
            // Mock projectId/taskId for demo
            const { projectId, taskId } = req.body;
            const result = await projectCostingIntegration.transferCostsToProjects(req.params.id, projectId || "PROJ-1", taskId || "TASK-1");
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 8. PLANNING & SCHEDULING
    // ==============================================================================

    async getPlanningSchedule(req: Request, res: Response) {
        try {
            const start = new Date(req.query.start as string || new Date().toISOString());
            const end = new Date(req.query.end as string || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
            const schedule = await maintenancePlanningService.getSchedule(start, end);
            res.json(schedule);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPlanningForecast(req: Request, res: Response) {
        try {
            const start = new Date(req.query.start as string || new Date().toISOString());
            const end = new Date(req.query.end as string || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
            const forecast = await maintenancePlanningService.getForecast(start, end);
            res.json(forecast);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async scheduleOperation(req: Request, res: Response) {
        try {
            const scheduledDate = new Date(req.body.scheduledDate);
            const op = await maintenancePlanningService.scheduleOperation(req.params.id, scheduledDate, req.body.workCenterId);
            res.json(op);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getWorkCenters(req: Request, res: Response) {
        try {
            const wcs = await maintenancePlanningService.getWorkCenters();
            res.json(wcs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 9. QUALITY & INSPECTIONS
    // ==============================================================================

    async listInspectionTemplates(req: Request, res: Response) {
        try {
            const tmpls = await maintenanceQualityService.listInspectionTemplates();
            res.json(tmpls);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createInspection(req: Request, res: Response) {
        try {
            const insp = await maintenanceQualityService.createInspection(req.body);
            res.json(insp);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async submitInspectionResults(req: Request, res: Response) {
        try {
            const { results, status } = req.body;
            const insp = await maintenanceQualityService.submitInspectionResults(req.params.id, results, status);
            res.json(insp);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getInspectionsForWorkOrder(req: Request, res: Response) {
        try {
            const insps = await maintenanceQualityService.getInspectionsForWorkOrder(req.params.id);
            res.json(insps);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Permits
    async createPermit(req: Request, res: Response) {
        try {
            const permit = await maintenanceQualityService.createPermit({ ...req.body, workOrderId: req.params.id });
            res.json(permit);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPermitsForWorkOrder(req: Request, res: Response) {
        try {
            const permits = await maintenanceQualityService.getPermitsForWorkOrder(req.params.id);
            res.json(permits);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 10. METERS
    // ==============================================================================

    async createMeter(req: Request, res: Response) {
        try {
            const meter = await maintenanceMeterService.createMeter(req.body);
            res.json(meter);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMetersForAsset(req: Request, res: Response) {
        try {
            const meters = await maintenanceMeterService.getMetersForAsset(req.params.id);
            res.json(meters);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async logMeterReading(req: Request, res: Response) {
        try {
            const { value, source, workOrderId } = req.body;
            const reading = await maintenanceMeterService.logReading(req.params.id, value, source, workOrderId);
            res.json(reading);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMeterReadings(req: Request, res: Response) {
        try {
            const readings = await maintenanceMeterService.getReadingHistory(req.params.id);
            res.json(readings);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 11. LIBRARY
    // ==============================================================================

    async listWorkDefinitions(req: Request, res: Response) {
        try {
            const defs = await maintenanceLibraryService.listWorkDefinitions();
            res.json(defs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createWorkDefinition(req: Request, res: Response) {
        try {
            const def = await maintenanceLibraryService.createWorkDefinition(req.body);
            res.json(def);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async applyWorkDefinition(req: Request, res: Response) {
        try {
            const result = await maintenanceLibraryService.applyWorkDefinition(req.params.workOrderId, req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 12. FAILURE ANALYSIS
    // ==============================================================================

    async listFailureCodes(req: Request, res: Response) {
        try {
            const { type, parentId } = req.query;
            const codes = await failureAnalysisService.listFailureCodes(type as string, parentId as string);
            res.json(codes);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getFailureCodesTree(req: Request, res: Response) {
        try {
            const tree = await failureAnalysisService.getFailureCodesTree();
            res.json(tree);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async upsertFailureCodes(req: Request, res: Response) {
        try {
            const results = await failureAnalysisService.upsertFailureCodes(req.body);
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 13. PERMIT TYPES
    // ==============================================================================

    async getPermitTypes(req: Request, res: Response) {
        try {
            const data = await db.query.maintPermitTypes.findMany({
                where: eq(schema.maintPermitTypes.isActive, true),
                orderBy: (types, { asc }) => [asc(types.name)],
            });

            // Map database fields to frontend expected format
            const permitTypes = data.map((row: any) => ({
                id: row.id,
                name: row.name,
                description: row.description,
                category: row.category,
                requiresApproval: row.requiresApproval ?? true,
                approvalLevels: row.approvalLevels ?? 1,
                validityHours: row.validityHours ?? 8,
                requiredDocuments: row.requiredDocuments || []
            }));

            res.json(permitTypes);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPermitType(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const data = await db.query.maintPermitTypes.findFirst({
                where: eq(schema.maintPermitTypes.id, id),
            });

            if (!data) {
                return res.status(404).json({ error: "Permit type not found" });
            }

            // Map database fields to frontend expected format
            const permitType = {
                id: data.id,
                name: data.name,
                description: data.description,
                category: data.category,
                requiresApproval: data.requiresApproval ?? true,
                approvalLevels: data.approvalLevels ?? 1,
                validityHours: data.validityHours ?? 8,
                requiredDocuments: data.requiredDocuments || []
            };

            res.json(permitType);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

}

export const maintenanceController = new MaintenanceController();
