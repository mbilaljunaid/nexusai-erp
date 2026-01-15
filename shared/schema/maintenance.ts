
import { pgTable, text, varchar, timestamp, numeric, boolean, integer, jsonb, date, check } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { faAssets } from "./fixedAssets";

// 1. Maintenance Parameters (Module Configuration)
export const maintParameters = pgTable("maint_parameters", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    orgId: varchar("org_id").notNull().unique(), // Link to Inventory Org

    // Auto-Numbering
    enableAutomaticWorkOrderNumbering: boolean("enable_auto_wo_num").default(true),
    workOrderPrefix: varchar("wo_prefix", { length: 10 }).default("WO-"),
    workOrderStartingNumber: integer("wo_starting_num").default(1000),

    // Defaults
    defaultWorkDefinitionId: varchar("default_work_def_id"),
    defaultMaintenanceOrgId: varchar("default_maint_org_id"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 2. Asset Operational Extension (Extends faAssets)
export const maintAssetsExtension = pgTable("maint_assets_extension", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    assetId: varchar("asset_id").references(() => faAssets.id).notNull().unique(), // One-to-One with Financial Asset

    // Operational Details
    criticality: varchar("criticality", { length: 20 }).default("NORMAL"), // LOW, NORMAL, HIGH, CRITICAL
    maintainable: boolean("maintainable").default(true),

    // Location & Hierarchy
    parentAssetId: varchar("parent_asset_id"), // Hierarchy
    locationId: varchar("location_id"), // Physical Location (Subinventory/Locator)

    // Tracking
    serialNumber: varchar("serial_number"), // Redundant but operational reference
    meterId: varchar("meter_id"), // Primary running meter (e.g. Odometer)

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 3. Maintenance Work Definitions (Templates/Standard Jobs)
export const maintWorkDefinitions = pgTable("maint_work_definitions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    version: integer("version").default(1),

    // Type & Status
    type: varchar("type", { length: 30 }).default("STANDARD"), // STANDARD, PREVENTIVE
    status: varchar("status", { length: 20 }).default("ACTIVE"), // DRAFT, ACTIVE, OBSOLETE

    // Applicability
    assetId: varchar("asset_id").references(() => faAssets.id), // Specific to an asset?
    categoryId: varchar("category_id"), // Or a category?

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 4. Work Definition Operations (Steps)
export const maintWorkDefinitionOperations = pgTable("maint_work_definition_ops", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workDefinitionId: varchar("work_definition_id").references(() => maintWorkDefinitions.id).notNull(),

    sequence: integer("sequence").notNull(), // 10, 20, 30
    operationCode: varchar("operation_code", { length: 30 }), // OP-10
    description: text("description").notNull(),

    // Resources (Simplified)
    laborHours: numeric("labor_hours", { precision: 10, scale: 2 }).default("0"),
    technicianCount: integer("technician_count").default(1),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 5. Maintenance Work Orders (Execution)
export const maintWorkOrders = pgTable("maint_work_orders", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workOrderNumber: varchar("work_order_number", { length: 50 }).notNull().unique(),
    description: text("description").notNull(),

    // Source
    assetId: varchar("asset_id").references(() => faAssets.id).notNull(),
    workDefinitionId: varchar("work_definition_id").references(() => maintWorkDefinitions.id),

    // Status Flow
    status: varchar("status", { length: 30 }).default("DRAFT"), // DRAFT, RELEASED, IN_PROGRESS, COMPLETED, CLOSED, CANCELLED
    type: varchar("type", { length: 30 }).default("CORRECTIVE"), // PREVENTIVE, CORRECTIVE, EMERGENCY
    priority: varchar("priority", { length: 20 }).default("NORMAL"),

    // Scheduling
    scheduledStartDate: timestamp("scheduled_start_date"),
    scheduledCompletionDate: timestamp("scheduled_completion_date"),
    actualStartDate: timestamp("actual_start_date"),
    actualCompletionDate: timestamp("actual_completion_date"),

    // Costing Integration
    costedFlag: boolean("costed_flag").default(false),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 6. Work Order Operations (Execution Steps)
export const maintWorkOrderOperations = pgTable("maint_work_order_operations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workOrderId: varchar("work_order_id").references(() => maintWorkOrders.id).notNull(),
    workCenterId: varchar("work_center_id"), // Linked to maint_work_centers (soft link via ID for now as circular dep risk)
    scheduledDate: timestamp("scheduled_date"),


    sequence: integer("sequence").notNull(),
    description: text("description").notNull(),
    status: varchar("status", { length: 30 }).default("PENDING"), // PENDING, READY, COMPLETED, REJECTED

    // Actuals
    actualDurationHours: numeric("actual_duration_hours", { precision: 10, scale: 2 }),
    assignedToUserId: varchar("assigned_to_user_id"),
    completedByUserId: varchar("completed_by_user_id"),
    completedAt: timestamp("completed_at"),

    comments: text("comments"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 7. Meter Readings (Condition Monitoring)
export const maintMeters = pgTable("maint_meters", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    uom: varchar("uom", { length: 20 }).notNull(), // KM, HOURS, CYCLES

    assetId: varchar("asset_id").references(() => faAssets.id).notNull(),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const maintMeterReadings = pgTable("maint_meter_readings", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    meterId: varchar("meter_id").references(() => maintMeters.id).notNull(),

    readingDate: timestamp("reading_date").default(sql`now()`),
    readingValue: numeric("reading_value", { precision: 20, scale: 2 }).notNull(),
    deltaValue: numeric("delta_value", { precision: 20, scale: 2 }), // Difference from last reading

    reportedByUserId: varchar("reported_by_user_id"),
    workOrderId: varchar("work_order_id").references(() => maintWorkOrders.id), // If taken during WO

    createdAt: timestamp("created_at").default(sql`now()`),
});



// Relations
export const maintWorkOrdersRelations = relations(maintWorkOrders, ({ one, many }) => ({
    asset: one(faAssets, {
        fields: [maintWorkOrders.assetId],
        references: [faAssets.id],
    }),
    operations: many(maintWorkOrderOperations),
}));

export const maintWorkOrderOperationsRelations = relations(maintWorkOrderOperations, ({ one }) => ({
    workOrder: one(maintWorkOrders, {
        fields: [maintWorkOrderOperations.workOrderId],
        references: [maintWorkOrders.id],
    }),
}));




// Zod Schemas
export const insertMaintWorkDefinitionSchema = createInsertSchema(maintWorkDefinitions);
export const insertMaintWorkOrderSchema = createInsertSchema(maintWorkOrders);
export const insertMaintOperationSchema = createInsertSchema(maintWorkDefinitionOperations);
export const insertMaintAssetExtSchema = createInsertSchema(maintAssetsExtension);

export type MaintWorkOrder = typeof maintWorkOrders.$inferSelect;
export type InsertMaintWorkOrder = typeof maintWorkOrders.$inferInsert;
