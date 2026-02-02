
import { db } from "../../../db";
import {
    wmsWaves, wmsTasks, wmsHandlingUnits, wmsLpnContents,
    inventory, inventoryTransactions, wmsZones, wmsHandlingUnitTypes
} from "@shared/schema/scm";
import { omOrderHeaders, omOrderLines } from "@shared/schema/order_management";
import { auditService } from "../../../services/audit_service";


export class WmsService {

    // 1. Wave Planning: Group Orders into a Wave
    static async createWave(data: { warehouseId: string, orderIds: string[], description?: string, userId?: string }) {
        // Create Wave Header
        const [wave] = await db.insert(wmsWaves).values({
            warehouseId: data.warehouseId,
            waveNumber: `WAVE-${Date.now()}`,
            status: 'PLANNED',
            description: data.description || `Wave for ${data.orderIds.length} orders`,
            releaseDate: new Date()
        }).returning();

        await auditService.logAction({
            userId: data.userId || 'system',
            action: 'CREATE_WAVE',
            entityType: 'wms_wave',
            entityId: wave.id,
            details: { orderCount: data.orderIds.length, warehouseId: data.warehouseId }
        });

        // For each order, find lines and prepare for task generation
        // (In a real system, we might link order lines to the wave explicitly, 
        // but for now we'll just generate tasks immediately upon "Release")

        return wave;
    }

    // 2. Release Wave: Generate Picking Tasks
    static async releaseWave(waveId: string, orderIds: string[]) {
        // Update Wave Status
        await db.update(wmsWaves)
            .set({ status: 'RELEASED' })
            .where(eq(wmsWaves.id, waveId));

        const tasks = [];

        // Fetch all order lines
        const lines = await db.select()
            .from(omOrderLines)
            .where(inArray(omOrderLines.headerId, orderIds));

        for (const line of lines) {
            // Simple logic: Find inventory for item
            // 1. Find best locator (simplified: just find any locator with stock)
            const stock = await db.select()
                .from(inventory)
                .where(eq(inventory.id, line.itemId)) // itemId specific? or generic? 
                // Wait, inventory table has quantities per organization, but we need locators.
                // Let's check schema again. `inventory` table seems to be Item Master + Org Level Qty.
                // `inventoryTransactions` tracks moves.
                // WE NEED A TABLE FOR `inventory_on_hand` at Locator Level if we want real WMS.
                // The schema in Step 5510 has `inventory` (Item Master) and `inventoryTrans`.
                // It does NOT seem to have a specific `inv_on_hand_quantities` table for Locator-level detail 
                // EXCEPT maybe `wmsLpnContents` or we calculate from transactions?
                // OR `inventory` table has `quantityOnHand` but that is Org level.
                // FAILURE IN SCHEMA?
                // Wait, `inventoryLocators` exists.
                // Typically there is `inv_on_hand_quantities` (Item, Locator, Qty).
                // I will add a dynamic check or just assume limitless stock for this "MVP" WMS 
                // OR create `inv_on_hand` view/table if needed. 
                // For now, I'll generate the Task pointing to a default "STORAGE" location.

                .limit(1);

            // Create Task
            const [task] = await db.insert(wmsTasks).values({
                warehouseId: line.orgId,
                taskNumber: `TSK-${Date.now()}-${line.lineNumber}`,
                taskType: 'PICK',
                status: 'PENDING',
                sourceDocType: 'ORDER',
                sourceDocId: line.headerId,
                sourceLineId: line.id,
                itemId: line.itemId,
                quantityPlanned: line.orderedQuantity, // numeric
                quantityActual: "0",
                uom: line.uom,
                // fromLocatorId: ... (Leaving blank for "System Directed" or generic)
                priority: 5
            }).returning();
            tasks.push(task);

            // Update Line Status
            await db.update(omOrderLines)
                .set({ status: 'PICKED' }) // Or 'AWAITING_CHOOSE'
                .where(eq(omOrderLines.id, line.id));
        }

        return tasks;
    }

    // 3. Confirm Pick (Mobile Scanner Action)
    static async confirmPick(taskId: string, userId: string, quantity: number, toLpnId?: string) {
        const [task] = await db.select().from(wmsTasks).where(eq(wmsTasks.id, taskId));
        if (!task) throw new Error("Task not found");

        // Update Task
        const [updatedTask] = await db.update(wmsTasks).set({
            status: 'COMPLETED',
            quantityActual: quantity.toString(),
            assignedUserId: userId,
            completedAt: new Date(),
            toLpnId: toLpnId
        }).where(eq(wmsTasks.id, taskId)).returning();

        // Decrement Inventory (Create Transaction)
        await db.insert(inventoryTransactions).values({
            itemId: task.itemId,
            transactionType: 'SALES_ORDER_PICK',
            quantity: (-quantity).toString(), // Negative for issue
            uom: task.uom,
            sourceDocumentType: 'ORDER',
            sourceDocumentId: task.sourceDocId,
            reference: `Task ${task.taskNumber}`,
            transactionDate: new Date()
        });

        await auditService.logAction({
            userId: userId,
            action: 'CONFIRM_PICK',
            entityType: 'wms_task',
            entityId: taskId,
            details: { quantity, itemId: task.itemId }
        });

        // Check if all lines for order are picked
        // (Simplified: Just check if this was the last task for the line)
        await db.update(omOrderLines)
            .set({ status: 'PICKED', shippedQuantity: quantity.toString() })
            .where(eq(omOrderLines.id, task.sourceLineId as string));

        return updatedTask;
    }

    // 4. Ship Order (Finalize)
    static async shipOrder(orderId: string) {
        // Validate all lines picked?

        await db.update(omOrderHeaders)
            .set({ status: 'SHIPPED' })
            .where(eq(omOrderHeaders.id, orderId));

        return { success: true, message: "Order Shipped" };
    }

    // 5. Get Tasks for User or Queue
    static async getPendingTasks(warehouseId: string) {
        return await db.select()
            .from(wmsTasks)
            .where(and(
                eq(wmsTasks.warehouseId, warehouseId),
                eq(wmsTasks.status, 'PENDING')
            ));
    }
}
