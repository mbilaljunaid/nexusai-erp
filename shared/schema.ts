import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Manufacturing: Bill of Materials
export const boms = pgTable("boms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  productId: varchar("product_id").notNull(),
  description: text("description"),
  status: varchar("status").default("active"), // active, inactive, archived
  uom: varchar("uom").notNull(), // Unit of Measure
  yield: decimal("yield", { precision: 10, scale: 2 }).default("100"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  revision: integer("revision").default(1),
  effectiveDate: timestamp("effective_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBomSchema = createInsertSchema(boms)
  .omit({ id: true, createdAt: true })
  .extend({
    name: z.string().min(1, "Name required"),
    productId: z.string().min(1, "Product required"),
    quantity: z.coerce.number().min(0.01, "Quantity must be > 0"),
    uom: z.string().min(1, "UOM required"),
  });

export type InsertBom = z.infer<typeof insertBomSchema>;
export type Bom = typeof boms.$inferSelect;

// BOM Line Items
export const bomLines = pgTable("bom_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bomId: varchar("bom_id").notNull(),
  lineNumber: integer("line_number").notNull(),
  componentId: varchar("component_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  uom: varchar("uom").notNull(),
  scrapPercentage: decimal("scrap_percentage", { precision: 5, scale: 2 }).default("0"),
  notes: text("notes"),
});

export const insertBomLineSchema = createInsertSchema(bomLines)
  .omit({ id: true })
  .extend({
    componentId: z.string().min(1, "Component required"),
    quantity: z.coerce.number().min(0.01, "Quantity must be > 0"),
  });

export type InsertBomLine = z.infer<typeof insertBomLineSchema>;
export type BomLine = typeof bomLines.$inferSelect;

// Manufacturing: Work Orders
export const workOrders = pgTable("work_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  woNumber: varchar("wo_number").notNull().unique(),
  bomId: varchar("bom_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("pending"), // pending, released, in-progress, completed, cancelled
  priorityLevel: varchar("priority_level").default("normal"), // low, normal, high, urgent
  plannedStartDate: timestamp("planned_start_date"),
  plannedEndDate: timestamp("planned_end_date"),
  actualStartDate: timestamp("actual_start_date"),
  actualEndDate: timestamp("actual_end_date"),
  assignedTo: varchar("assigned_to"),
  location: varchar("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWorkOrderSchema = createInsertSchema(workOrders)
  .omit({ id: true, woNumber: true, createdAt: true })
  .extend({
    bomId: z.string().min(1, "BOM required"),
    quantity: z.coerce.number().min(0.01, "Quantity must be > 0"),
  });

export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type WorkOrder = typeof workOrders.$inferSelect;

// Manufacturing: Production Orders
export const productionOrders = pgTable("production_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poNumber: varchar("po_number").notNull().unique(),
  productId: varchar("product_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("draft"), // draft, released, in-progress, completed, closed
  releaseDate: timestamp("release_date"),
  dueDate: timestamp("due_date").notNull(),
  completionDate: timestamp("completion_date"),
  bomId: varchar("bom_id"),
  warehouse: varchar("warehouse"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertProductionOrderSchema = createInsertSchema(productionOrders)
  .omit({ id: true, poNumber: true, createdAt: true })
  .extend({
    productId: z.string().min(1, "Product required"),
    quantity: z.coerce.number().min(0.01, "Quantity must be > 0"),
    dueDate: z.coerce.date({ errorMap: () => ({ message: "Valid date required" }) }),
  });

export type InsertProductionOrder = z.infer<typeof insertProductionOrderSchema>;
export type ProductionOrder = typeof productionOrders.$inferSelect;

// Manufacturing: Quality Control
export const qualityChecks = pgTable("quality_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workOrderId: varchar("work_order_id").notNull(),
  checkType: varchar("check_type").notNull(), // incoming, in-process, final
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  quantityPassed: decimal("quantity_passed", { precision: 10, scale: 2 }).notNull(),
  quantityFailed: decimal("quantity_failed", { precision: 10, scale: 2 }).default("0"),
  defects: text("defects"),
  notes: text("notes"),
  checkedBy: varchar("checked_by"),
  checkDate: timestamp("check_date").default(sql`now()`),
});

export const insertQualityCheckSchema = createInsertSchema(qualityChecks)
  .omit({ id: true, checkDate: true })
  .extend({
    workOrderId: z.string().min(1, "Work Order required"),
    quantity: z.coerce.number().min(0.01, "Quantity must be > 0"),
    quantityPassed: z.coerce.number().min(0, "Cannot be negative"),
  });

export type InsertQualityCheck = z.infer<typeof insertQualityCheckSchema>;
export type QualityCheck = typeof qualityChecks.$inferSelect;
