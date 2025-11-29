import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, numeric } from "drizzle-orm/pg-core";
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
  status: varchar("status").default("active"),
  uom: varchar("uom").notNull(),
  yield: numeric("yield", { precision: 10, scale: 2 }).default("100"),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
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
    quantity: z.string().pipe(z.coerce.number().min(0.01, "Quantity must be > 0")),
    yield: z.string().optional(),
    uom: z.string().min(1, "UOM required"),
    revision: z.number().optional(),
    status: z.string().optional(),
    description: z.string().optional().nullable(),
    effectiveDate: z.date().optional().nullable(),
    endDate: z.date().optional().nullable(),
  });

export type InsertBom = z.infer<typeof insertBomSchema>;
export type Bom = typeof boms.$inferSelect;

// BOM Line Items
export const bomLines = pgTable("bom_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bomId: varchar("bom_id").notNull(),
  lineNumber: integer("line_number").notNull(),
  componentId: varchar("component_id").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  uom: varchar("uom").notNull(),
  scrapPercentage: numeric("scrap_percentage", { precision: 5, scale: 2 }).default("0"),
  notes: text("notes"),
});

export const insertBomLineSchema = createInsertSchema(bomLines)
  .omit({ id: true })
  .extend({
    componentId: z.string().min(1, "Component required"),
    quantity: z.string().pipe(z.coerce.number().min(0.01, "Quantity must be > 0")),
    scrapPercentage: z.string().optional(),
    uom: z.string().min(1, "UOM required"),
    notes: z.string().optional().nullable(),
  });

export type InsertBomLine = z.infer<typeof insertBomLineSchema>;
export type BomLine = typeof bomLines.$inferSelect;

// Manufacturing: Work Orders
export const workOrders = pgTable("work_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  woNumber: varchar("wo_number").notNull().unique(),
  bomId: varchar("bom_id").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("pending"),
  priorityLevel: varchar("priority_level").default("normal"),
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
    quantity: z.string().pipe(z.coerce.number().min(0.01, "Quantity must be > 0")),
    status: z.string().optional(),
    priorityLevel: z.string().optional(),
    plannedStartDate: z.date().optional().nullable(),
    plannedEndDate: z.date().optional().nullable(),
    actualStartDate: z.date().optional().nullable(),
    actualEndDate: z.date().optional().nullable(),
    assignedTo: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  });

export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type WorkOrder = typeof workOrders.$inferSelect;

// Manufacturing: Production Orders
export const productionOrders = pgTable("production_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poNumber: varchar("po_number").notNull().unique(),
  productId: varchar("product_id").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("draft"),
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
    quantity: z.string().pipe(z.coerce.number().min(0.01, "Quantity must be > 0")),
    dueDate: z.date(),
    status: z.string().optional(),
    releaseDate: z.date().optional().nullable(),
    completionDate: z.date().optional().nullable(),
    bomId: z.string().optional().nullable(),
    warehouse: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  });

export type InsertProductionOrder = z.infer<typeof insertProductionOrderSchema>;
export type ProductionOrder = typeof productionOrders.$inferSelect;

// Manufacturing: Quality Control
export const qualityChecks = pgTable("quality_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workOrderId: varchar("work_order_id").notNull(),
  checkType: varchar("check_type").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  quantityPassed: numeric("quantity_passed", { precision: 10, scale: 2 }).notNull(),
  quantityFailed: numeric("quantity_failed", { precision: 10, scale: 2 }).default("0"),
  defects: text("defects"),
  notes: text("notes"),
  checkedBy: varchar("checked_by"),
  checkDate: timestamp("check_date").default(sql`now()`),
});

export const insertQualityCheckSchema = createInsertSchema(qualityChecks)
  .omit({ id: true, checkDate: true })
  .extend({
    workOrderId: z.string().min(1, "Work Order required"),
    quantity: z.string().pipe(z.coerce.number().min(0.01, "Quantity must be > 0")),
    quantityPassed: z.string().pipe(z.coerce.number().min(0, "Cannot be negative")),
    quantityFailed: z.string().optional(),
    checkType: z.string().min(1, "Check type required"),
    defects: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    checkedBy: z.string().optional().nullable(),
  });

export type InsertQualityCheck = z.infer<typeof insertQualityCheckSchema>;
export type QualityCheck = typeof qualityChecks.$inferSelect;
