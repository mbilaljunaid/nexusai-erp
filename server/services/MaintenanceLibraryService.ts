
import { db } from "../db";
import { eq } from "drizzle-orm";
import { maintWorkDefinitions, maintWorkDefinitionOperations, maintWorkDefinitionMaterials, maintWorkOrderOperations, maintWorkOrderCosts } from "@shared/schema";
import { maintenanceService } from "./MaintenanceService";

export class MaintenanceLibraryService {

    // === Definitions ===

    async createWorkDefinition(data: Omit<typeof maintWorkDefinitions.$inferInsert, "id">) {
        const [def] = await db.insert(maintWorkDefinitions).values(data).returning();
        return def;
    }

    async addOperationToDefinition(data: typeof maintWorkDefinitionOperations.$inferInsert) {
        return await db.insert(maintWorkDefinitionOperations).values(data).returning();
    }

    async addMaterialToDefinition(data: typeof maintWorkDefinitionMaterials.$inferInsert) {
        return await db.insert(maintWorkDefinitionMaterials).values(data).returning();
    }

    async getWorkDefinition(id: string) {
        return await db.query.maintWorkDefinitions.findFirst({
            where: eq(maintWorkDefinitions.id, id),
            with: {
                operations: true,
                materials: true
            }
        });
    }

    async listWorkDefinitions() {
        return await db.select().from(maintWorkDefinitions);
    }

    /**
     * applyWorkDefinition
     * Copies the template operations and materials to an actual Work Order.
     */
    async applyWorkDefinition(workOrderId: string, definitionId: string) {
        console.log(`[LIBRARY] Applying definition ${definitionId} to WO ${workOrderId}...`);

        const def = await this.getWorkDefinition(definitionId);
        if (!def) throw new Error("Work Definition not found");

        // 1. Copy Operations
        if (def.operations) {
            for (const op of def.operations) {
                await maintenanceService.addOperation(workOrderId, {
                    sequence: op.sequenceNumber,
                    description: op.name + (op.description ? " - " + op.description : ""),
                    workCenterId: null
                });

            }
        }

        // 2. Copy Materials (As Planned Costs? Or Requirements?)
        // Currently existing WO schema implies "Estimated Costs" or "Requirements".
        // For MVP we won't auto-issue, but we could create "Planned Material" entries if that table existed.
        // Since we only have `maintWorkOrderCosts` (Actuals), we might just log a note or wait for Requirement module.
        // IMPROVEMENT: Create `maintWorkOrderRequirements` table later.

        // For now, let's just return success. Operations are the main value add here.

        return { success: true, message: `Applied ${def.name} with ${def.operations.length} operations.` };
    }
}

export const maintenanceLibraryService = new MaintenanceLibraryService();
