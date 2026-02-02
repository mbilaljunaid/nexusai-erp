import { pgTable, text, timestamp, varchar, boolean, integer, numeric, uuid, date, pgEnum } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

import { createInsertSchema } from "drizzle-zod";
import { users } from "./common";
import { maintWorkOrders } from "./maintenance";

export const maintCostTypeEnum = pgEnum("maint_cost_type", [
    "MATERIAL",
    "LABOR",
    "OVERHEAD",
    "OUTSIDE_PROCESSING"
]);

export const maintGlStatusEnum = pgEnum("maint_gl_status", [
    "PENDING",
    "POSTED",
    "ERROR"
]);

export const maintWorkOrderCosts = pgTable("maint_work_order_costs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workOrderId: varchar("work_order_id").references(() => maintWorkOrders.id).notNull(),
    costType: varchar("cost_type", { length: 30 }).notNull(), // MATERIAL, LABOR...
    description: text("description"), // e.g. "Bearing 6205 x 2"
    quantity: numeric("quantity"),
    unitCost: numeric("unit_cost"),
    totalCost: numeric("total_cost").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    sourceReference: varchar("source_reference"), // ID of material issue or labor log
    date: timestamp("date").defaultNow(),
    glStatus: varchar("gl_status", { length: 20 }).default("PENDING"),
    createdAt: timestamp("created_at").defaultNow(),
});


export const maintWorkOrderCostsRelations = relations(maintWorkOrderCosts, ({ one }) => ({
    workOrder: one(maintWorkOrders, {
        fields: [maintWorkOrderCosts.workOrderId],
        references: [maintWorkOrders.id],
    }),
}));

export const insertMaintWorkOrderCostSchema = createInsertSchema(maintWorkOrderCosts);
