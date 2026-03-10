
import { db } from "../db";
import { egpSystemItems, egpItemCategories, InsertEgpSystemItem, InsertEgpItemCategory } from "../../shared/schema";
import { eq, desc, like, or, sql } from "drizzle-orm";

export class ItemService {

    /**
     * Create a new Item
     */
    async createItem(item: InsertEgpSystemItem) {
        // Simple check for uniqueness on itemNumber is handled by DB constraint unique()
        const [newItem] = await db.insert(egpSystemItems).values(item).returning();
        return newItem;
    }

    /**
     * Get Item by ID (with Categories)
     */
    async getItemById(id: string) {
        const item = await db.query.egpSystemItems.findFirst({
            where: eq(egpSystemItems.id, id),
            with: {
                categories: true
            }
        });
        return item;
    }

    /**
     * Search Items
     */
    async searchItems(query?: string) {
        if (!query) {
            return await db.select().from(egpSystemItems).limit(50).orderBy(desc(egpSystemItems.createdAt));
        }

        const searchPattern = `%${query.toLowerCase()}%`;
        return await db.select().from(egpSystemItems)
            .where(or(
                like(sql`lower(${egpSystemItems.itemNumber})`, searchPattern),
                like(sql`lower(${egpSystemItems.itemName})`, searchPattern),
                like(sql`lower(${egpSystemItems.description})`, searchPattern)
            ))
            .limit(50);
    }

    /**
     * Add Category to Item
     */
    async addCategory(data: InsertEgpItemCategory) {
        const [cat] = await db.insert(egpItemCategories).values(data).returning();
        return cat;
    }
}

export const itemService = new ItemService();
