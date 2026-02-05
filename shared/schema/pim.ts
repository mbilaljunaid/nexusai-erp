
import { pgTable, varchar, text, timestamp, boolean, integer, numeric, date } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==========================================
// 1. SYSTEM ITEMS (The Product Master)
// ==========================================
export const egpSystemItems = pgTable("egp_system_items", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    itemNumber: varchar("item_number", { length: 100 }).notNull().unique(), // e.g. "PRJ-001"
    itemName: varchar("item_name").notNull(),
    description: text("description"),

    // Classification
    itemType: varchar("item_type").default("GOODS"), // GOODS, SERVICE
    itemStatus: varchar("item_status").default("ACTIVE"), // ACTIVE, INACTIVE, OBSOLETE

    // Units
    primaryUomCode: varchar("primary_uom_code").notNull(), // e.g. "EA", "BOX", "HR"

    // Inventory
    organizationId: varchar("organization_id").notNull().default("GLOBAL"), // Simplifying for now

    // Versioning
    revision: varchar("revision").default("A"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// 2. ITEM CATEGORIES (Assignment)
// ==========================================
export const egpItemCategories = pgTable("egp_item_categories", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    itemId: varchar("item_id").references(() => egpSystemItems.id).notNull(),
    categoryName: varchar("category_name").notNull(), // e.g. "Electronics", "Consulting"
    categorySet: varchar("category_set").default("DEFAULT"), // Purchasing, Sales, Inventory

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// RELATIONS
// ==========================================
export const egpSystemItemsRelations = relations(egpSystemItems, ({ many }) => ({
    categories: many(egpItemCategories),
}));

export const egpItemCategoriesRelations = relations(egpItemCategories, ({ one }) => ({
    item: one(egpSystemItems, {
        fields: [egpItemCategories.itemId],
        references: [egpSystemItems.id],
    }),
}));

// ==========================================
// Zod Schemas
// ==========================================
export const insertEgpSystemItemSchema = createInsertSchema(egpSystemItems).extend({
    itemNumber: z.string().min(1),
    itemName: z.string().min(1),
    primaryUomCode: z.string().min(1),
});

export const insertEgpItemCategorySchema = createInsertSchema(egpItemCategories);

// Types
export type EgpSystemItem = typeof egpSystemItems.$inferSelect;
export type InsertEgpSystemItem = typeof egpSystemItems.$inferInsert;

export type EgpItemCategory = typeof egpItemCategories.$inferSelect;
export type InsertEgpItemCategory = typeof egpItemCategories.$inferInsert;
