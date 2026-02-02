
import { pgTable, varchar, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { faAssets } from "./fixedAssets";
import { inventory } from "./scm";

// 1. Asset Bill of Materials (Spare Parts List)
export const maintAssetBoms = pgTable("maint_asset_boms", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    assetId: varchar("asset_id").references(() => faAssets.id).notNull(),
    inventoryId: varchar("inventory_id").references(() => inventory.id).notNull(),

    quantity: integer("quantity").default(1),
    isCritical: boolean("is_critical").default(false),
    notes: varchar("notes"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const maintAssetBomsRelations = relations(maintAssetBoms, ({ one }) => ({
    asset: one(faAssets, {
        fields: [maintAssetBoms.assetId],
        references: [faAssets.id],
    }),
    item: one(inventory, {
        fields: [maintAssetBoms.inventoryId],
        references: [inventory.id],
    }),
}));

export const insertMaintAssetBomSchema = createInsertSchema(maintAssetBoms);
export type MaintAssetBom = typeof maintAssetBoms.$inferSelect;
