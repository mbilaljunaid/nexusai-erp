
import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { maintWorkOrderCosts, ppmExpenditureItems, ppmTasks } from "@shared/schema";

export class ProjectCostingIntegrationService {

    /**
     * Transfer Maintenance Costs to PPM (Project Portfolio Management)
     * This creates "Expenditure Items" in the Project Module.
     */
    async transferCostsToProjects(workOrderId: string, projectId: string, taskId: string) {
        // 1. Get Costs that are POSTED to GL but NOT Capitalized yet
        // In this simplified model, we assume "POSTED" in Maintenance means ready for Projects if ProjectID is present.
        // A real system would have a separate 'ProjectInterfaceStatus'.

        const costs = await db.query.maintWorkOrderCosts.findMany({
            where: (c, { eq }) => eq(c.workOrderId, workOrderId)
        });

        let transferredCount = 0;

        for (const cost of costs) {
            // Check if already transferred (deduplication logic needed in real world)
            // Here we blindly insert for demonstration of flow

            await db.insert(ppmExpenditureItems).values({
                taskId: taskId,
                expenditureTypeId: "MAINTENANCE_CHARGE", // Hardcoded type
                expenditureItemDate: new Date(),
                quantity: cost.quantity || "1",
                rawCost: cost.totalCost,
                transactionSource: "MAINTENANCE",
                transactionReference: `WO-${workOrderId}-COST-${cost.id}`,
                status: "UNCOSTED"
            });

            console.log(`[Project Integration] Transferred Cost ${cost.id} ($${cost.totalCost}) to Project ${projectId}`);
            transferredCount++;
        }

        return { transferredCount };
    }
}

export const projectCostingIntegration = new ProjectCostingIntegrationService();
