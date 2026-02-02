
import { pgTable, varchar, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { maintWorkOrders } from "./maintenance";
import { users } from "./common";

// 11. Work Order Resources (Labor)
export const maintWorkOrderResources = pgTable("maint_work_order_resources", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workOrderId: varchar("work_order_id").references(() => maintWorkOrders.id).notNull(),

    // Technician
    userId: varchar("user_id").references(() => users.id).notNull(),

    // Planning
    plannedHours: numeric("planned_hours", { precision: 5, scale: 2 }).default("0"),

    // Actuals
    actualHours: numeric("actual_hours", { precision: 5, scale: 2 }).default("0"),
    hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }), // Snapshot rate

    // Status
    status: varchar("status").default("ASSIGNED"), // ASSIGNED, IN_PROGRESS, COMPLETED

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const maintWorkOrderResourcesRelations = relations(maintWorkOrderResources, ({ one }) => ({
    workOrder: one(maintWorkOrders, {
        fields: [maintWorkOrderResources.workOrderId],
        references: [maintWorkOrders.id],
    }),
    technician: one(users, {
        fields: [maintWorkOrderResources.userId],
        references: [users.id],
    }),
}));

export const insertMaintWorkOrderResourceSchema = createInsertSchema(maintWorkOrderResources);
export type MaintWorkOrderResource = typeof maintWorkOrderResources.$inferSelect;
