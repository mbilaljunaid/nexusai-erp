
import { pgTable, varchar, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { maintWorkOrders } from "./maintenance";
import { inventory } from "./scm";

// 10. Work Order Materials (Spare Parts / Consumables)
export const maintWorkOrderMaterials = pgTable("maint_work_order_materials", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workOrderId: varchar("work_order_id").references(() => maintWorkOrders.id).notNull(),

    // Link to Inventory
    inventoryId: varchar("inventory_id").references(() => inventory.id).notNull(),

    // Planning
    plannedQuantity: integer("planned_quantity").default(1),

    // Actuals
    actualQuantity: integer("actual_quantity").default(0),
    unitCost: numeric("unit_cost", { precision: 10, scale: 2 }), // Snapshot cost at issue

    // Status
    isReserved: varchar("is_reserved").default("false"), // "true", "false"
    purchaseRequisitionLineId: varchar("pr_line_id"), // Link to scm_purchase_requisition_lines

    createdAt: timestamp("created_at").default(sql`now()`),
});


export const maintWorkOrderMaterialsRelations = relations(maintWorkOrderMaterials, ({ one }) => ({
    workOrder: one(maintWorkOrders, {
        fields: [maintWorkOrderMaterials.workOrderId],
        references: [maintWorkOrders.id],
    }),
    item: one(inventory, {
        fields: [maintWorkOrderMaterials.inventoryId],
        references: [inventory.id],
    }),
}));

export const insertMaintWorkOrderMaterialSchema = createInsertSchema(maintWorkOrderMaterials);
export type MaintWorkOrderMaterial = typeof maintWorkOrderMaterials.$inferSelect;
