
import { db } from "../db";
import { scmService } from "./SCMService";
import { maintWorkOrderMaterials, maintWorkOrders } from "../../shared/schema/index";
import { eq } from "drizzle-orm";

/**
 * Maintenance SCM Integration Service
 * Handles raising Purchase Requisitions for Work Orders.
 */
class MaintenanceSCMService {
    async raisePRForMaterial(materialRequirementId: string) {
        // 1. Get Material Requirement
        const [mat] = await db.select().from(maintWorkOrderMaterials).where(eq(maintWorkOrderMaterials.id, materialRequirementId));
        if (!mat) throw new Error("Material requirement not found");
        if (mat.purchaseRequisitionLineId) throw new Error("PR already exists for this requirement");

        // 2. Get Work Order for context
        const [wo] = await db.select().from(maintWorkOrders).where(eq(maintWorkOrders.id, mat.workOrderId));

        // 3. Check for existing PR for this WO or create new
        // For simplicity, we create a new PR per requirement or one per WO. 
        // Let's search for an open PR for this WO first.
        let prId: string;
        // In real app, we might search. For now, create new Requisition.
        const pr = await scmService.createRequisition({
            description: `Procurement for Work Order: ${wo.workOrderNumber}`,
            sourceModule: "MAINTENANCE",
            sourceId: wo.id
        });
        prId = pr.id;

        // 4. Create PR Line
        const prLine = await scmService.addRequisitionLine(prId, {
            itemId: mat.inventoryId,
            itemDescription: `Parts for WO ${wo.workOrderNumber}`, // In real app, fetch item name
            quantity: mat.plannedQuantity.toString(),
            needByDate: wo.scheduledStartDate
        });

        // 5. Link WO Material to PR Line
        await db.update(maintWorkOrderMaterials)
            .set({ purchaseRequisitionLineId: prLine.id })
            .where(eq(maintWorkOrderMaterials.id, mat.id));

        return { pr, prLine };
    }
}

export const maintenanceSCMService = new MaintenanceSCMService();
