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

export const insertSupplierSchema = createInsertSchema(suppliers).extend({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    status: z.string().optional(),
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export const supplierSites = pgTable("supplier_sites", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    supplierId: varchar("supplier_id").notNull(), // FK to suppliers
    siteName: varchar("site_name").notNull(), // e.g., "HEADQUARTERS", "NYC-DISTRIBUTION"
    address: text("address"),
    isPurchasing: varchar("is_purchasing").default("true"), // "true" or "false"
    isPay: varchar("is_pay").default("true"), // "true" or "false"
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSupplierSiteSchema = createInsertSchema(supplierSites).extend({
    supplierId: z.string().min(1),
    siteName: z.string().min(1),
    address: z.string().optional(),
    isPurchasing: z.string().optional(),
    isPay: z.string().optional(),
    status: z.string().optional(),
});

export type InsertSupplierSite = z.infer<typeof insertSupplierSiteSchema>;
export type SupplierSite = typeof supplierSites.$inferSelect;

export const purchaseOrders = pgTable("purchase_orders", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    orderNumber: varchar("order_number").notNull().unique(),
    supplierId: varchar("supplier_id"),
    totalAmount: numeric("total_amount", { precision: 18, scale: 2 }),
    status: varchar("status").default("draft"),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const purchaseOrderLines = pgTable("purchase_order_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    poHeaderId: varchar("po_header_id").notNull(), // FK to purchaseOrders
    lineNumber: integer("line_number").notNull(),
    itemId: varchar("item_id"), // FK to inventory optional
    description: varchar("description"),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 18, scale: 4 }).notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    projectId: varchar("project_id"), // Linked to ppm_projects
    taskId: varchar("task_id"), // Linked to ppm_tasks
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).extend({
    orderNumber: z.string().min(1),
    supplierId: z.string().optional(),
    totalAmount: z.string().optional(),
    status: z.string().optional(),
    dueDate: z.date().optional().nullable(),
});

export const insertPurchaseOrderLineSchema = createInsertSchema(purchaseOrderLines).extend({
    poHeaderId: z.string().min(1),
    lineNumber: z.number(),
    quantity: z.number(),
    unitPrice: z.number(),
    amount: z.number(),
    projectId: z.string().optional(),
    taskId: z.string().optional(),
});

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrderLine = z.infer<typeof insertPurchaseOrderLineSchema>;
export type PurchaseOrderLine = typeof purchaseOrderLines.$inferSelect;

export const inventory = pgTable("inventory", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    itemName: varchar("item_name").notNull(),
    sku: varchar("sku").unique(),
    quantity: integer("quantity").default(0),
    reorderLevel: integer("reorder_level"),
    location: varchar("location"),
    trackingMethod: varchar("tracking_method").default("NONE"), // NONE, LOT, SERIAL, BOTH
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertInventorySchema = createInsertSchema(inventory).extend({
    itemName: z.string().min(1),
    sku: z.string().optional(),
    quantity: z.number().optional(),
    reorderLevel: z.number().optional(),
    location: z.string().optional(),
});

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export const inventoryTransactions = pgTable("inventory_transactions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    inventoryId: varchar("inventory_id").notNull(),
    transactionType: varchar("transaction_type").notNull(), // RECEIPT, ISSUE, TRANSFER, ADJUSTMENT
    quantity: integer("quantity").notNull(),
    projectId: varchar("project_id"), // Linked to ppm_projects
    taskId: varchar("task_id"), // Linked to ppm_tasks
    transactionDate: timestamp("transaction_date").default(sql`now()`),
    referenceNumber: varchar("reference_number"),
    lotSerialId: varchar("lot_serial_id"), // FK to inventory_lot_serial
    cost: numeric("cost", { precision: 18, scale: 2 }), // Cost of transaction
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).extend({
    inventoryId: z.string().min(1),
    transactionType: z.string().min(1),
    quantity: z.number(),
    projectId: z.string().optional(),
    taskId: z.string().optional(),
    referenceNumber: z.string().optional(),
    cost: z.number().optional(),
});

export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;

export const inventoryLotSerial = pgTable("inventory_lot_serial", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    inventoryId: varchar("inventory_id").notNull(),
    lotNumber: varchar("lot_number"),
    serialNumber: varchar("serial_number"),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).default("0"),
    status: varchar("status").default("ACTIVE"), // ACTIVE, QUARANTINED, EXPIRED, RETIRED
    expirationDate: timestamp("expiration_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertInventoryLotSerialSchema = createInsertSchema(inventoryLotSerial).extend({
    inventoryId: z.string().min(1),
    lotNumber: z.string().optional(),
    serialNumber: z.string().optional(),
    quantity: z.number().optional(),
    status: z.string().optional(),
});

export type InsertInventoryLotSerial = z.infer<typeof insertInventoryLotSerialSchema>;
export type InventoryLotSerial = typeof inventoryLotSerial.$inferSelect;
