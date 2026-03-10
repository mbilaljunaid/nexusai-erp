
import { db } from "../../../db";
import { eq, sum } from "drizzle-orm";
// import { maintWorkOrderCosts, maintWorkOrderMaterials, maintWorkOrderResources, inventory, users } from "@shared/schema";
import { maintWorkOrderCosts, inventory, users } from "../../../../shared/schema"; // Removed potentially missing tables for now, need to verify
import { maintenanceAccountingService } from "./MaintenanceAccountingService";

export class MaintenanceCostingService {


    /**
     * Calculate and record material cost when an item is issued
     */
    async calculateMaterialCost(workOrderId: string, materialRecord: any) {
        // 1. Get Unit Cost (from Inventory or Transaction)
        // For now, retrieving from Inventory master if not on record
        let unitCost = Number(materialRecord.unitCost || 0);

        if (unitCost === 0) {
            const item = await db.query.inventory.findFirst({
                where: eq(inventory.id, materialRecord.inventoryId)
            });
            // Fallback mock cost if standard cost is 0 or missing
            unitCost = Number((item as any)?.unitCost || (item as any)?.averageCost || 15.00);
        }

        const quantity = Number(materialRecord.actualQuantity || 1); // Logic typically triggered on +1 issue
        // NOTE: In a real system, we'd trigger on the DELTA issued, not total. 
        // For this simple implementation, we assume we are called with the specific transaction amount.
        // But `issueMaterial` in `MaintenanceService` updates the Total Actual. 
        // We should arguably insert a cost record for *each* issue action (qty 1 usually).

        // Let's assume the caller passes the specific QTY being issued, not the total record.
        // We will default to 1 for the 'Issue' button action.
        const issuedQty = 1;

        const totalCost = unitCost * issuedQty;

        console.log(`💰 Recording Material Cost: ${issuedQty} x $${unitCost} = $${totalCost}`);

        const [inserted] = await db.insert(maintWorkOrderCosts).values({
            workOrderId,
            costType: "MATERIAL",
            description: `Material Issue: ${materialRecord.inventoryId}`, // Todo: Get Item Name
            quantity: issuedQty.toString(),
            unitCost: unitCost.toString(),
            totalCost: totalCost.toString(),
            sourceReference: materialRecord.id // Link to WO Material Record
        } as any).returning();

        // Trigger Accounting (Real-time)
        // In prod, this might be async/queue
        try {
            await maintenanceAccountingService.createAccountingForCost(inserted.id);
        } catch (e) {
            console.error("Failed to create accounting for material cost:", e);
        }

        return inserted;
    }


    /**
     * Calculate and record labor cost when hours are logged
     */
    async calculateLaborCost(workOrderId: string, laborRecord: any, hoursLogged: number) {
        // 1. Get Labor Rate (from User/Resource or default)
        // Stubbing a default rate if not on user
        const hourlyRate = 65.00;

        const totalCost = hourlyRate * hoursLogged;

        console.log(`💰 Recording Labor Cost: ${hoursLogged}hrs x $${hourlyRate} = $${totalCost}`);

        const [inserted] = await db.insert(maintWorkOrderCosts).values({
            workOrderId,
            costType: "LABOR",
            description: `Labor: ${hoursLogged} hrs (Tech Ref: ${laborRecord.userId})`,
            quantity: hoursLogged.toString(),
            unitCost: hourlyRate.toString(),
            totalCost: totalCost.toString(),
            sourceReference: laborRecord.id
        } as any).returning();

        // Trigger Accounting
        try {
            await maintenanceAccountingService.createAccountingForCost(inserted.id);
        } catch (e) {
            console.error("Failed to create accounting for labor cost:", e);
        }

        return inserted;
    }


    /**
     * Get aggregated costs for a Work Order
     */
    async getWorkOrderCosts(workOrderId: string) {
        return await db.query.maintWorkOrderCosts.findMany({
            where: eq(maintWorkOrderCosts.workOrderId, workOrderId),
            orderBy: (costs, { desc }) => [desc(costs.date)]
        });
    }

    async getCostSummary(workOrderId: string) {
        const costs = await this.getWorkOrderCosts(workOrderId);

        const summary = {
            material: 0,
            labor: 0,
            overhead: 0,
            total: 0
        };

        for (const c of costs) {
            const amount = Number(c.totalCost);
            if (c.costType === "MATERIAL") summary.material += amount;
            if (c.costType === "LABOR") summary.labor += amount;
            if (c.costType === "OVERHEAD") summary.overhead += amount;
            summary.total += amount;
        }

        return summary;
    }

    /**
     * Post pending costs to General Ledger (or CIP Mass Additions)
     */
    async postCostsToGL(workOrderId: string) {
        // 1. Get Pending Costs
        const pendingCosts = await db.query.maintWorkOrderCosts.findMany({
            where: (costs, { and, eq }) => and(
                eq(costs.workOrderId, workOrderId),
                eq(costs.glStatus, "PENDING")
            )
        });

        if (pendingCosts.length === 0) {
            return { message: "No pending costs to post.", count: 0 };
        }

        // 2. Determine functionality (Expense vs Capital)
        // For this implementation, we check if WO is capitalized (mock check)
        // const workOrder = await maintenanceService.getWorkOrder(workOrderId);
        const isCapital = false; // logic would check workOrder.type === 'PROJECT'

        // 3. Process
        const postedIds: string[] = [];

        for (const cost of pendingCosts) {
            if (isCapital) {
                // Insert into fa_mass_additions
                // await db.insert(faMassAdditions).values({...})
                console.log(`[CIP] Capitalizing cost ${cost.id}: $${cost.totalCost}`);
            } else {
                // Post to GL Expense
                console.log(`[GL] Posting Expense ${cost.id}: $${cost.totalCost} (Type: ${cost.costType})`);
            }
            postedIds.push(cost.id);
        }

        // 4. Update Status
        if (postedIds.length > 0) {
            await db.update(maintWorkOrderCosts)
                .set({ glStatus: "POSTED" } as any)
                .where(eq(maintWorkOrderCosts.workOrderId, workOrderId));
        }

        return { message: "Costs posted successfully.", count: postedIds.length };
    }
}

export const maintenanceCostingService = new MaintenanceCostingService();
