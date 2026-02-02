import { Request, Response } from "express";
import { db } from "@db";
import {
    hrChecklists, hrChecklistItems, hrAllocatedChecklists, hrAllocatedTasks,
    insertAllocatedChecklistSchema, insertAllocatedTaskSchema
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export class ChecklistController {

    // --- Template Management ---

    async getAvailableChecklists(req: Request, res: Response) {
        try {
            const lists = await db.select().from(hrChecklists).where(eq(hrChecklists.status, "ACTIVE"));
            res.json(lists);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch checklists" });
        }
    }

    // --- Allocation & Runtime ---

    async assignChecklist(req: Request, res: Response) {
        // Body: { personId, checklistId, initiatorId }
        try {
            const { personId, checklistId, initiatorId, tenantId } = req.body;

            return await db.transaction(async (tx) => {
                // 1. Create Allocation
                const [allocation] = await tx.insert(hrAllocatedChecklists).values({
                    tenantId,
                    personId,
                    checklistId,
                    status: "IN_PROGRESS",
                    initiatorId: initiatorId || "system"
                }).returning();

                // 2. Fetch Items from Template
                const items = await tx.select().from(hrChecklistItems)
                    .where(eq(hrChecklistItems.checklistId, checklistId));

                // 3. Create Allocated Tasks
                if (items.length > 0) {
                    const tasksData = items.map(item => ({
                        tenantId,
                        allocatedChecklistId: allocation.id,
                        checklistItemId: item.id,
                        taskName: item.taskName,
                        status: "PENDING"
                    }));
                    await tx.insert(hrAllocatedTasks).values(tasksData);
                }

                res.status(201).json(allocation);
            });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: "Failed to assign checklist" });
        }
    }

    async getPersonChecklists(req: Request, res: Response) {
        try {
            const { personId } = req.params;
            // Fetch allocations with checklist details
            // NOTE: Drizzle relations would make this easier, using manual join/query for now if relations aren't setup

            // Simple fetch of allocations
            const allocations = await db.select({
                allocation: hrAllocatedChecklists,
                template: hrChecklists
            })
                .from(hrAllocatedChecklists)
                .leftJoin(hrChecklists, eq(hrAllocatedChecklists.checklistId, hrChecklists.id))
                .where(eq(hrAllocatedChecklists.personId, personId));

            res.json(allocations);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch person checklists" });
        }
    }

    async getChecklistTasks(req: Request, res: Response) {
        try {
            const { allocationId } = req.params;
            const tasks = await db.select()
                .from(hrAllocatedTasks)
                .where(eq(hrAllocatedTasks.allocatedChecklistId, allocationId))
                .orderBy(desc(hrAllocatedTasks.createdAt)); // or sequence if we copied it

            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch tasks" });
        }
    }

    async updateTaskStatus(req: Request, res: Response) {
        try {
            const { taskId } = req.params;
            const { status } = req.body;

            const [updated] = await db.update(hrAllocatedTasks)
                .set({
                    status,
                    completedAt: status === 'DONE' ? new Date() : null
                })
                .where(eq(hrAllocatedTasks.id, taskId))
                .returning();

            // TODO: Recalculate Checklist Progress %

            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: "Failed to update task" });
        }
    }
}

export const checklistController = new ChecklistController();
