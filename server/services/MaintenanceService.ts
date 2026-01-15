
import { db } from "../db";
import {
    maintWorkOrders, maintWorkDefinitions, maintWorkOrderOperations, maintAssetsExtension,
    faAssets, maintWorkDefinitionOperations, maintPMDefinitions, maintServiceRequests,
    maintWorkOrderMaterials, inventory, maintWorkOrderResources,
    insertMaintWorkOrderSchema, insertMaintOperationSchema


} from "@shared/schema";
import { eq, and, desc, sql, lt, or, isNull } from "drizzle-orm";
import { maintenanceCostingService } from "./MaintenanceCostingService";

// Import Schema Definitions locally if they were in same file, but we use strict imports for services.
// Actually updating the shared/schema/index.ts is key here, OR we assume maintenance.ts is the aggregator.
// Let's check shared/schema/index.ts content via view first or just blindly append export here if this file is the definition file.
// The previous files suggest maintenance.ts DEFINES table objects.
// Wait, I created maintenance_sr.ts separately. I need to export it from shared/schema/index.ts



export class MaintenanceService {

    /**
     * Get Work Order Detail
     */
    async getWorkOrder(id: string) {
        return await db.query.maintWorkOrders.findFirst({
            where: eq(maintWorkOrders.id, id),
            with: {
                asset: true,
                operations: {
                    orderBy: desc(maintWorkOrderOperations.sequence)
                },
                materials: true,
                resources: { with: { technician: true } } // Include Resources + Technician details
            }
        });
    }

    /**
     * List Work Orders
     */
    async listWorkOrders(limit?: number, offset?: number) {
        return await db.query.maintWorkOrders.findMany({
            with: {
                asset: true,
                operations: true
            },
            limit,
            offset,
            orderBy: desc(maintWorkOrders.createdAt)
        });
    }


    /**
     * Create Work Order
     */
    async createWorkOrder(data: any) {
        // 1. Generate Number if not provided
        if (!data.workOrderNumber) {
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            const random = Math.floor(Math.random() * 1000);
            data.workOrderNumber = `WO-${dateStr}-${random}`;
        }

        // 2. Validate
        const woData = insertMaintWorkOrderSchema.parse(data);

        // 3. Create Header
        const [wo] = await db.insert(maintWorkOrders).values(woData).returning();

        // 4. If Work Definition provided, copy operations
        if (data.workDefinitionId) {
            await this.explodeWorkDefinition(wo.id, data.workDefinitionId);
        }

        return wo;
    }

    /**
     * Explode Work Definition into WO Operations
     */
    private async explodeWorkDefinition(workOrderId: string, workDefinitionId: string) {
        const ops = await db.select().from(maintWorkDefinitionOperations)
            .where(eq(maintWorkDefinitionOperations.workDefinitionId, workDefinitionId));

        for (const op of ops) {
            await db.insert(maintWorkOrderOperations).values({
                workOrderId,
                sequence: op.sequence,
                description: op.description,
                status: "PENDING"
            });
        }
    }

    /**
     * Update Work Order Status (State Machine)
     */
    async updateWorkOrderStatus(id: string, status: string) {
        // 1. Validation Logic
        if (status === "COMPLETED") {
            const pendingOps = await db.select().from(maintWorkOrderOperations)
                .where(and(
                    eq(maintWorkOrderOperations.workOrderId, id),
                    eq(maintWorkOrderOperations.status, "PENDING")
                ));

            if (pendingOps.length > 0) {
                throw new Error("Cannot complete Work Order with pending operations.");
            }
        }

        return await db.update(maintWorkOrders)
            .set({
                status,
                updatedAt: new Date(),
                actualCompletionDate: status === "COMPLETED" ? new Date() : undefined,
                actualStartDate: status === "IN_PROGRESS" ? new Date() : undefined
            })
            .where(eq(maintWorkOrders.id, id))
            .returning();
    }

    /**
     * Add Operation to Work Order
     */
    async addOperation(workOrderId: string, data: any) {
        // Validate sequence uniqueness? For now, we allow append.
        return await db.insert(maintWorkOrderOperations).values({
            workOrderId,
            ...data,
            status: "PENDING"
        }).returning();
    }

    /**
     * Update/Complete Operation
     */
    async updateOperation(opId: string, data: any) {
        // If completing, set timestamp
        if (data.status === "COMPLETED") {
            data.completedAt = new Date();
        }

        return await db.update(maintWorkOrderOperations)
            .set(data)
            .where(eq(maintWorkOrderOperations.id, opId))
            .returning();
    }

    /**
     * Create/Update Operational Asset Extension
     */
    async upsertAssetExtension(data: { assetId: string, criticality: string, maintainable: boolean, locationId?: string }) {
        const existing = await db.select().from(maintAssetsExtension).where(eq(maintAssetsExtension.assetId, data.assetId));

        if (existing.length > 0) {
            return await db.update(maintAssetsExtension)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(maintAssetsExtension.assetId, data.assetId))
                .returning();
        } else {
            return await db.insert(maintAssetsExtension).values(data as any).returning();
        }
    }

    /**
     * List Operational Assets (Joined)
     */
    async listOperationalAssets() {
        return await db.select({
            id: faAssets.id,
            assetNumber: faAssets.assetNumber,
            description: faAssets.description,
            criticality: maintAssetsExtension.criticality,
            maintainable: maintAssetsExtension.maintainable,
            locationId: maintAssetsExtension.locationId
        })
            .from(faAssets)
            .leftJoin(maintAssetsExtension, eq(faAssets.id, maintAssetsExtension.assetId));
    }

    // --- Preventive Maintenance ---

    /**
     * Create PM Definition
     */
    async createPMDefinition(data: any) {
        return await db.insert(maintPMDefinitions).values(data).returning();
    }

    /**
     * List PM Definitions
     */
    async listPMDefinitions() {
        return await db.query.maintPMDefinitions.findMany({
            with: {
                asset: true,
                workDefinition: true
            },
            orderBy: desc(maintPMDefinitions.createdAt)
        });
    }

    /**
     * Generate PM Work Orders (The Scheduler)
     * This looks for PM definitions that are due based on Time.
     */
    async generatePMWorkOrders() {
        const now = new Date();
        const generatedWos = [];

        // Find Active PMs where (LastGenerated + Frequency <= Now) OR (LastGenerated IS NULL AND EffectiveStart + Frequency <= Now)
        // Simplified Logic: Fetch all active time-based PMs and filter in code for flexibility (or complex SQL query)

        const candidates = await db.query.maintPMDefinitions.findMany({
            where: and(
                eq(maintPMDefinitions.active, true),
                eq(maintPMDefinitions.triggerType, "TIME")
            )
        });

        for (const pm of candidates) {
            let nextDue: Date | null = null;
            const baseDate = pm.lastGeneratedDate ? new Date(pm.lastGeneratedDate) : new Date(pm.effectiveStartDate || now);

            // Calculate Next Due
            if (pm.frequency && pm.frequencyUom) {
                nextDue = new Date(baseDate);
                if (pm.frequencyUom === "DAY") nextDue.setDate(nextDue.getDate() + pm.frequency);
                if (pm.frequencyUom === "WEEK") nextDue.setDate(nextDue.getDate() + (pm.frequency * 7));
                if (pm.frequencyUom === "MONTH") nextDue.setMonth(nextDue.getMonth() + pm.frequency);
                if (pm.frequencyUom === "YEAR") nextDue.setFullYear(nextDue.getFullYear() + pm.frequency);
            }

            // Check if Due
            if (nextDue && nextDue <= now) {
                console.log(`PM ${pm.name} is due (Due: ${nextDue.toISOString()})`);

                // create WO
                const wo = await this.createWorkOrder({
                    description: `PM: ${pm.name}`,
                    assetId: pm.assetId,
                    type: "PREVENTIVE", // Enum match
                    workDefinitionId: pm.workDefinitionId,
                    priority: "NORMAL",
                    scheduledStartDate: nextDue,
                    status: "DRAFT" // Created in draft for review, or can be RELEASED
                });

                // Update PM Last Generated
                await db.update(maintPMDefinitions)
                    .set({ lastGeneratedDate: now }) // Set to execution time
                    .where(eq(maintPMDefinitions.id, pm.id));

                generatedWos.push(wo);
            }
        }

        return generatedWos;
    }


    // --- Service Requests (Breakdown) ---

    async createServiceRequest(data: any) {
        // Auto-generate Request Number if not provided
        if (!data.requestNumber) {
            const count = await db.select({ count: sql<number>`count(*)` }).from(maintServiceRequests);
            data.requestNumber = `SR-${new Date().getFullYear()}-${Number(count[0].count) + 1}`;
        }
        return await db.insert(maintServiceRequests).values(data).returning();
    }

    async listServiceRequests() {
        return await db.query.maintServiceRequests.findMany({
            with: {
                asset: true,
                requester: true,
                workOrder: true
            },
            orderBy: desc(maintServiceRequests.createdAt)
        });
    }

    async convertSRtoWO(srId: string, woData: any) {
        // Fetch SR to get Asset ID
        const sr = await db.query.maintServiceRequests.findFirst({
            where: eq(maintServiceRequests.id, srId)
        });

        if (!sr) throw new Error("Service Request not found");

        // 1. Create WO (Corrective)
        const wo = await this.createWorkOrder({
            ...woData,
            assetId: sr.assetId, // Mandatory from SR
            type: "CORRECTIVE",
            description: woData.description || `Corrective Work for SR: ${sr.requestNumber}`
        });

        // 2. Link SR to WO and Update Status
        await db.update(maintServiceRequests)
            .set({
                workOrderId: wo.id,
                status: "CONVERTED",
                updatedAt: new Date()
            })
            .where(eq(maintServiceRequests.id, srId));

        return wo;
    }


    // --- Supply Chain Integration (Materials) ---

    async addMaterialToWorkOrder(workOrderId: string, data: any) {
        // Data: inventoryId, plannedQuantity
        return await db.insert(maintWorkOrderMaterials).values({
            workOrderId,
            ...data
        }).returning();
    }

    async issueMaterial(materialId: string) {
        // 1. Get Material Requirement
        const mat = await db.query.maintWorkOrderMaterials.findFirst({
            where: eq(maintWorkOrderMaterials.id, materialId)
        });
        if (!mat) throw new Error("Material record not found");

        if (mat.actualQuantity >= mat.plannedQuantity) {
            throw new Error("Material already fully issued");
        }

        // 2. Decrement Inventory (Simple logic)
        // In real SCM, we'd create an inventory_transaction
        // Check availability first
        const item = await db.query.inventory.findFirst({
            where: eq(inventory.id, mat.inventoryId)
        });

        if (!item || (item.quantity || 0) < 1) {
            throw new Error(`Insufficient stock for item ${mat.inventoryId}`);
        }

        // 3. Update Inventory
        await db.update(inventory)
            .set({ quantity: (item.quantity || 0) - 1 })
            .where(eq(inventory.id, item.id));

        // 4. Update WO Material Actuals
        const [updatedMat] = await db.update(maintWorkOrderMaterials)
            .set({
                actualQuantity: (mat.actualQuantity || 0) + 1,
                unitCost: "0", // Placeholder if cost not in item
                // In production, we'd fetch cost from item
            })
            .where(eq(maintWorkOrderMaterials.id, materialId))
            .returning();

        // 5. Trigger Costing
        await maintenanceCostingService.calculateMaterialCost(updatedMat.workOrderId, updatedMat);

        return updatedMat;

    }


    // --- Resource Management (Labor) ---

    async assignTechnician(workOrderId: string, data: any) {
        // Data: userId, plannedHours
        return await db.insert(maintWorkOrderResources).values({
            workOrderId,
            ...data,
            status: "ASSIGNED"
        }).returning();
    }

    async logLaborHours(assignmentId: string, hours: number) {
        // 1. Get Assignment
        const assign = await db.query.maintWorkOrderResources.findFirst({
            where: eq(maintWorkOrderResources.id, assignmentId)
        });
        if (!assign) throw new Error("Assignment record not found");

        const newTotal = Number(assign.actualHours || 0) + Number(hours);

        // 2. Update Actuals
        const [updatedRes] = await db.update(maintWorkOrderResources)
            .set({
                actualHours: newTotal.toString(),
                status: "IN_PROGRESS", // Or COMPLETED if logic dictates
                // timestamp?
            })
            .where(eq(maintWorkOrderResources.id, assignmentId))
            .returning();

        // 3. Trigger Costing
        await maintenanceCostingService.calculateLaborCost(updatedRes.workOrderId, updatedRes, hours);

        return updatedRes;
    }

}





export const maintenanceService = new MaintenanceService();
