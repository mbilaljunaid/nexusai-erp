
import { db } from "@db";
import { wmsTasks } from "@shared/schema/scm";
import { eq, and, sql, desc, gte } from "drizzle-orm";

export class WmsLaborService {

    // Get aggregated metrics for last 24h
    async getProductivityMetrics(warehouseId: string) {
        // Mocking user names for now as we don't have a users table join ready in this service context easily
        // In real app, we join with 'users' table.

        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const tasksByUser = await db.select({
            userId: wmsTasks.assignedUserId,
            count: sql<number>`count(*)`.mapWith(Number),
        })
            .from(wmsTasks)
            .where(and(
                eq(wmsTasks.warehouseId, warehouseId),
                eq(wmsTasks.status, "COMPLETED"),
                gte(wmsTasks.completedAt, last24h)
            ))
            .groupBy(wmsTasks.assignedUserId)
            .orderBy(desc(sql`count(*)`));

        return tasksByUser.map(r => ({
            userId: r.userId || "Unassigned",
            userName: r.userId === 'current-user-id' ? 'Current User' : `User ${r.userId ? r.userId.substring(0, 4) : 'Unknown'}`,
            tasksCompleted: r.count,
            efficiencyScore: Math.min(100, Math.round((r.count / 50) * 100)) // Mock efficiency: 50 tasks = 100%
        }));
    }
}

export const wmsLaborService = new WmsLaborService();
