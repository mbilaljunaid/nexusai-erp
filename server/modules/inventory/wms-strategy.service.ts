
import { db } from "@db";
import { wmsStrategies } from "@shared/schema/scm";
import { eq, and } from "drizzle-orm";

export class WmsStrategyService {

    async listStrategies(warehouseId: string) {
        return await db.select().from(wmsStrategies).where(eq(wmsStrategies.warehouseId, warehouseId));
    }

    async createStrategy(data: typeof wmsStrategies.$inferInsert) {
        const [strat] = await db.insert(wmsStrategies).values(data).returning();
        return strat;
    }

    async toggleStrategy(id: string, isActive: boolean) {
        const [strat] = await db.update(wmsStrategies)
            .set({ isActive })
            .where(eq(wmsStrategies.id, id))
            .returning();
        return strat;
    }

    // This would be used by WmsTaskService
    async getActiveStrategy(warehouseId: string, type: string) {
        const [strat] = await db.select()
            .from(wmsStrategies)
            .where(and(
                eq(wmsStrategies.warehouseId, warehouseId),
                eq(wmsStrategies.type, type),
                eq(wmsStrategies.isActive, true)
            ))
            .limit(1);
        return strat;
    }
}

export const wmsStrategyService = new WmsStrategyService();
