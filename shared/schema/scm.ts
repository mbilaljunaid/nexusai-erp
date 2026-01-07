import { pgTable, varchar, text, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== SUPPLY CHAIN MODULE ==========
export const suppliers = pgTable("suppliers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    email: varchar("email"),
    phone: varchar("phone"),
    address: text("address"),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true }).extend({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    status: z.string().optional(),
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export const purchaseOrders = pgTable("purchase_orders", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    orderNumber: varchar("order_number").notNull().unique(),
    supplierId: varchar("supplier_id"),
    totalAmount: numeric("total_amount", { precision: 18, scale: 2 }),
    status: varchar("status").default("draft"),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, createdAt: true }).extend({
    orderNumber: z.string().min(1),
    supplierId: z.string().optional(),
    totalAmount: z.string().optional(),
    status: z.string().optional(),
    dueDate: z.date().optional().nullable(),
});

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

export const inventory = pgTable("inventory", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    itemName: varchar("item_name").notNull(),
    sku: varchar("sku").unique(),
    quantity: integer("quantity").default(0),
    reorderLevel: integer("reorder_level"),
    location: varchar("location"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, createdAt: true }).extend({
    itemName: z.string().min(1),
    sku: z.string().optional(),
    quantity: z.number().optional(),
    reorderLevel: z.number().optional(),
    location: z.string().optional(),
});

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;
