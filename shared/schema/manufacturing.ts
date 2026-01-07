import { pgTable, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== MANUFACTURING MODULE ==========
export const bom = pgTable("bom", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    bomNumber: varchar("bom_number").notNull().unique(),
    productId: varchar("product_id"),
    quantity: integer("quantity"),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBomSchema = createInsertSchema(bom).omit({ id: true, createdAt: true }).extend({
    bomNumber: z.string().min(1),
    productId: z.string().optional(),
    quantity: z.number().optional(),
    status: z.string().optional(),
});

export type InsertBom = z.infer<typeof insertBomSchema>;
export type Bom = typeof bom.$inferSelect;

export const workCenters = pgTable("work_centers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    capacity: integer("capacity"),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWorkCenterSchema = createInsertSchema(workCenters).omit({ id: true, createdAt: true }).extend({
    name: z.string().min(1),
    description: z.string().optional(),
    capacity: z.number().optional(),
    status: z.string().optional(),
});

export type InsertWorkCenter = z.infer<typeof insertWorkCenterSchema>;
export type WorkCenter = typeof workCenters.$inferSelect;

export const productionOrders = pgTable("production_orders", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    orderNumber: varchar("order_number").notNull().unique(),
    productId: varchar("product_id"),
    quantity: integer("quantity"),
    status: varchar("status").default("planned"),
    scheduledDate: timestamp("scheduled_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertProductionOrderSchema = createInsertSchema(productionOrders).omit({ id: true, createdAt: true }).extend({
    orderNumber: z.string().min(1),
    productId: z.string().optional(),
    quantity: z.number().optional(),
    status: z.string().optional(),
    scheduledDate: z.date().optional().nullable(),
});

export type InsertProductionOrder = z.infer<typeof insertProductionOrderSchema>;
export type ProductionOrder = typeof productionOrders.$inferSelect;
