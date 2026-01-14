import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import { inventory, type InsertInventory } from "@shared/schema";

export class ScmService {
    async listInventory() {
        return await db.select().from(inventory).orderBy(inventory.itemName);
    }

    async createInventoryItem(data: InsertInventory) {
        const [result] = await db.insert(inventory).values(data).returning();
        return result;
    }

    async getInventoryItem(id: string) {
        const [result] = await db.select().from(inventory).where(eq(inventory.id, id)).limit(1);
        return result;
    }
}

export const scmService = new ScmService();
