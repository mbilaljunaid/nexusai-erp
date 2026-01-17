
import { db } from "@db";
import { wmsZones } from "@shared/schema/scm";
import { eq, and, desc } from "drizzle-orm";

export class WmsMasterDataService {

    // --- ZONES ---

    async listZones(warehouseId: string) {
        return await db.select()
            .from(wmsZones)
            .where(eq(wmsZones.warehouseId, warehouseId))
            .orderBy(desc(wmsZones.priority));
    }

    async createZone(data: typeof wmsZones.$inferInsert) {
        const [zone] = await db.insert(wmsZones).values(data).returning();
        return zone;
    }

    async updateZone(id: string, data: Partial<typeof wmsZones.$inferInsert>) {
        const [zone] = await db.update(wmsZones)
            .set(data)
            .where(eq(wmsZones.id, id))
            .returning();
        return zone;
    }

    async deleteZone(id: string) {
        // TODO: Check for dependencies (Locators) before delete?
        // For V1, simple delete.
        await db.delete(wmsZones).where(eq(wmsZones.id, id));
        return { success: true };
    }
}

export const wmsMasterDataService = new WmsMasterDataService();
