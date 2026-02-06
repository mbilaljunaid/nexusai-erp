"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertEgpItemCategorySchema = exports.insertEgpSystemItemSchema = exports.egpItemCategoriesRelations = exports.egpSystemItemsRelations = exports.egpItemCategories = exports.egpSystemItems = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ==========================================
// 1. SYSTEM ITEMS (The Product Master)
// ==========================================
exports.egpSystemItems = (0, pg_core_1.pgTable)("egp_system_items", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    itemNumber: (0, pg_core_1.varchar)("item_number", { length: 100 }).notNull().unique(), // e.g. "PRJ-001"
    itemName: (0, pg_core_1.varchar)("item_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    // Classification
    itemType: (0, pg_core_1.varchar)("item_type").default("GOODS"), // GOODS, SERVICE
    itemStatus: (0, pg_core_1.varchar)("item_status").default("ACTIVE"), // ACTIVE, INACTIVE, OBSOLETE
    // Units
    primaryUomCode: (0, pg_core_1.varchar)("primary_uom_code").notNull(), // e.g. "EA", "BOX", "HR"
    // Inventory
    organizationId: (0, pg_core_1.varchar)("organization_id").notNull().default("GLOBAL"), // Simplifying for now
    // Versioning
    revision: (0, pg_core_1.varchar)("revision").default("A"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// 2. ITEM CATEGORIES (Assignment)
// ==========================================
exports.egpItemCategories = (0, pg_core_1.pgTable)("egp_item_categories", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    itemId: (0, pg_core_1.varchar)("item_id").references(() => exports.egpSystemItems.id).notNull(),
    categoryName: (0, pg_core_1.varchar)("category_name").notNull(), // e.g. "Electronics", "Consulting"
    categorySet: (0, pg_core_1.varchar)("category_set").default("DEFAULT"), // Purchasing, Sales, Inventory
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// RELATIONS
// ==========================================
exports.egpSystemItemsRelations = (0, drizzle_orm_1.relations)(exports.egpSystemItems, ({ many }) => ({
    categories: many(exports.egpItemCategories),
}));
exports.egpItemCategoriesRelations = (0, drizzle_orm_1.relations)(exports.egpItemCategories, ({ one }) => ({
    item: one(exports.egpSystemItems, {
        fields: [exports.egpItemCategories.itemId],
        references: [exports.egpSystemItems.id],
    }),
}));
// ==========================================
// Zod Schemas
// ==========================================
exports.insertEgpSystemItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.egpSystemItems).extend({
    itemNumber: zod_1.z.string().min(1),
    itemName: zod_1.z.string().min(1),
    primaryUomCode: zod_1.z.string().min(1),
});
exports.insertEgpItemCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.egpItemCategories);
//# sourceMappingURL=pim.js.map