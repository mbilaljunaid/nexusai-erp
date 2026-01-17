
import { db } from "@db";
import { wmsTasks, wmsWaves, wmsZones, wmsHandlingUnits, inventoryTransactions, inventory, inventoryLocators } from "@shared/schema/scm";
import { omOrderLines } from "@shared/schema/order_management";
import { eq, and, desc, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export class WmsTaskService {

    // --- Task Execution ---

    async createTask(data: typeof wmsTasks.$inferInsert) {
        const [task] = await db.insert(wmsTasks).values(data).returning();
        return task;
    }

    async listTasks(filters: { warehouseId?: string, taskType?: string, status?: string }) {
        let query = db.select().from(wmsTasks);

        // Build dynamic filters
        const conditions = [];
        if (filters.warehouseId) conditions.push(eq(wmsTasks.warehouseId, filters.warehouseId));
        if (filters.taskType) conditions.push(eq(wmsTasks.taskType, filters.taskType));
        if (filters.status) conditions.push(eq(wmsTasks.status, filters.status));

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as any;
        }

        return await query.orderBy(desc(wmsTasks.createdAt));
    }

    async completeTask(taskId: string, userId: string, actualQuantity: number, toLocatorId?: string) {
        return await db.transaction(async (tx) => {
            // 1. Get Task
            const [task] = await tx.select().from(wmsTasks).where(eq(wmsTasks.id, taskId));
            if (!task) throw new Error("Task not found");
            if (task.status === "COMPLETED") throw new Error("Task already completed");

            // 2. Update Task Status
            const [updatedTask] = await tx.update(wmsTasks)
                .set({
                    status: "COMPLETED",
                    quantityActual: actualQuantity.toString(),
                    completedAt: new Date(),
                    assignedUserId: userId,
                    toLocatorId: toLocatorId || task.toLocatorId // Use provided or planned
                })
                .where(eq(wmsTasks.id, taskId))
                .returning();

            // 3. Create Inventory Transaction (Movement)
            // If it's a PICK or PUTAWAY, we update on-hand inventory.
            // NOTE: This logic assumes 'inventoryTransactions' triggers updates to 'inventory' / 'on_hand_balance' 
            // via triggers or another service. For now, we record the transaction.

            let transactionType = "TRANSFER";
            if (task.taskType === "RECEIVE") transactionType = "RECEIPT";
            if (task.taskType === "PICK") transactionType = "ISSUE";
            // Actually PICK is usually Transfer to Staging, or Issue if ship confirm. 
            // For simplified WMS, PICK = Transfer from Storage to Staging/Pack.

            await tx.insert(inventoryTransactions).values({
                itemId: task.itemId,
                transactionType: task.taskType,
                quantity: actualQuantity.toString(),
                transactionDate: new Date(),
                reference: task.taskNumber,
            });

            // 4. Update Source Document (Order Line) if applicable
            if (task.taskType === 'PICK' && (task.sourceDocType === 'ORDER' || task.sourceDocType === 'WAVE') && task.sourceLineId) {
                await tx.update(omOrderLines)
                    .set({ status: 'PICKED' })
                    .where(eq(omOrderLines.id, task.sourceLineId));
            }

            return updatedTask;
        });
    }

    // --- Intelligence (Stubs for Phase 29.2) ---

    async suggestPutawayLocation(itemId: string, warehouseId: string): Promise<string | null> {
        // 1. Consolidation Strategy: Check if item already exists in a bin
        // (Simple heuristic: checking distinct locations from recent transactions)
        const consolidationCandidate = await db.selectDistinct({ locatorId: inventoryTransactions.locatorId })
            .from(inventoryTransactions)
            .where(eq(inventoryTransactions.itemId, itemId))
            .limit(1); // Just take the first one found for now

        if (consolidationCandidate.length > 0 && consolidationCandidate[0].locatorId) {
            return consolidationCandidate[0].locatorId;
        }

        // 2. Empty Bin Strategy: Find a locator in a "STORAGE" zone
        const emptyCandidates = await db.select({ id: inventoryLocators.id })
            .from(inventoryLocators)
            .innerJoin(wmsZones, eq(inventoryLocators.zoneId, wmsZones.id))
            .where(and(
                eq(wmsZones.warehouseId, warehouseId),
                eq(wmsZones.zoneType, 'STORAGE')
            ))
            .limit(1);

        if (emptyCandidates.length > 0) {
            return emptyCandidates[0].id;
        }

        // 3. Fallback: Return null (User must select)
        return null;
    }
}

export const wmsTaskService = new WmsTaskService();
