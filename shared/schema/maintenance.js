"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMaintAssetExtSchema = exports.insertMaintWorkOrderSchema = exports.insertMaintWorkDefinitionSchema = exports.maintWorkOrderOperationsRelations = exports.maintWorkOrdersRelations = exports.maintWorkOrderOperations = exports.maintWorkOrders = exports.maintAssetsExtension = exports.maintParameters = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const fixedAssets_1 = require("./fixedAssets");
const maintenance_library_1 = require("./maintenance_library");
// 1. Maintenance Parameters (Module Configuration)
exports.maintParameters = (0, pg_core_1.pgTable)("maint_parameters", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    orgId: (0, pg_core_1.varchar)("org_id").notNull().unique(), // Link to Inventory Org
    // Auto-Numbering
    enableAutomaticWorkOrderNumbering: (0, pg_core_1.boolean)("enable_auto_wo_num").default(true),
    workOrderPrefix: (0, pg_core_1.varchar)("wo_prefix", { length: 10 }).default("WO-"),
    workOrderStartingNumber: (0, pg_core_1.integer)("wo_starting_num").default(1000),
    // Defaults
    defaultWorkDefinitionId: (0, pg_core_1.varchar)("default_work_def_id"),
    defaultMaintenanceOrgId: (0, pg_core_1.varchar)("default_maint_org_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. Asset Operational Extension (Extends faAssets)
exports.maintAssetsExtension = (0, pg_core_1.pgTable)("maint_assets_extension", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    assetId: (0, pg_core_1.varchar)("asset_id").references(() => fixedAssets_1.faAssets.id).notNull().unique(), // One-to-One with Financial Asset
    // Operational Details
    criticality: (0, pg_core_1.varchar)("criticality", { length: 20 }).default("NORMAL"), // LOW, NORMAL, HIGH, CRITICAL
    maintainable: (0, pg_core_1.boolean)("maintainable").default(true),
    // Location & Hierarchy
    parentAssetId: (0, pg_core_1.varchar)("parent_asset_id"), // Hierarchy
    locationId: (0, pg_core_1.varchar)("location_id"), // Physical Location (Subinventory/Locator)
    // Tracking
    serialNumber: (0, pg_core_1.varchar)("serial_number"), // Redundant but operational reference
    meterId: (0, pg_core_1.varchar)("meter_id"), // Primary running meter (e.g. Odometer)
    // Customer Association (Installed Base)
    accountId: (0, pg_core_1.varchar)("account_id"), // Link to CRM Account (if customer asset)
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. Work Definitions removed (moved to maintenance_library.ts)
// 4. Work Definition Operations removed (moved to maintenance_library.ts)
// 5. Maintenance Work Orders (Execution)
exports.maintWorkOrders = (0, pg_core_1.pgTable)("maint_work_orders", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    workOrderNumber: (0, pg_core_1.varchar)("work_order_number", { length: 50 }).notNull().unique(),
    description: (0, pg_core_1.text)("description").notNull(),
    // Source
    assetId: (0, pg_core_1.varchar)("asset_id").references(() => fixedAssets_1.faAssets.id).notNull(),
    workDefinitionId: (0, pg_core_1.varchar)("work_definition_id").references(() => maintenance_library_1.maintWorkDefinitions.id),
    // Status Flow
    status: (0, pg_core_1.varchar)("status", { length: 30 }).default("DRAFT"), // DRAFT, RELEASED, IN_PROGRESS, COMPLETED, CLOSED, CANCELLED
    type: (0, pg_core_1.varchar)("type", { length: 30 }).default("CORRECTIVE"), // PREVENTIVE, CORRECTIVE, EMERGENCY
    priority: (0, pg_core_1.varchar)("priority", { length: 20 }).default("NORMAL"),
    // Scheduling
    scheduledStartDate: (0, pg_core_1.timestamp)("scheduled_start_date"),
    scheduledCompletionDate: (0, pg_core_1.timestamp)("scheduled_completion_date"),
    actualStartDate: (0, pg_core_1.timestamp)("actual_start_date"),
    actualCompletionDate: (0, pg_core_1.timestamp)("actual_completion_date"),
    // Costing Integration
    costedFlag: (0, pg_core_1.boolean)("costed_flag").default(false),
    // Failure Analysis (Optional)
    failureProblemId: (0, pg_core_1.varchar)("failure_problem_id"),
    failureCauseId: (0, pg_core_1.varchar)("failure_cause_id"),
    failureRemedyId: (0, pg_core_1.varchar)("failure_remedy_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 6. Work Order Operations (Execution Steps)
exports.maintWorkOrderOperations = (0, pg_core_1.pgTable)("maint_work_order_operations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    workOrderId: (0, pg_core_1.varchar)("work_order_id").references(() => exports.maintWorkOrders.id).notNull(),
    workCenterId: (0, pg_core_1.varchar)("work_center_id"), // Linked to maint_work_centers (soft link via ID for now as circular dep risk)
    scheduledDate: (0, pg_core_1.timestamp)("scheduled_date"),
    sequence: (0, pg_core_1.integer)("sequence").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 30 }).default("PENDING"), // PENDING, READY, COMPLETED, REJECTED
    // Actuals
    actualDurationHours: (0, pg_core_1.numeric)("actual_duration_hours", { precision: 10, scale: 2 }),
    assignedToUserId: (0, pg_core_1.varchar)("assigned_to_user_id"),
    completedByUserId: (0, pg_core_1.varchar)("completed_by_user_id"),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    comments: (0, pg_core_1.text)("comments"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 7. Meters and Readings removed (moved to maintenance_meters.ts)
// Relations
exports.maintWorkOrdersRelations = (0, drizzle_orm_1.relations)(exports.maintWorkOrders, ({ one, many }) => ({
    asset: one(fixedAssets_1.faAssets, {
        fields: [exports.maintWorkOrders.assetId],
        references: [fixedAssets_1.faAssets.id],
    }),
    operations: many(exports.maintWorkOrderOperations),
}));
exports.maintWorkOrderOperationsRelations = (0, drizzle_orm_1.relations)(exports.maintWorkOrderOperations, ({ one }) => ({
    workOrder: one(exports.maintWorkOrders, {
        fields: [exports.maintWorkOrderOperations.workOrderId],
        references: [exports.maintWorkOrders.id],
    }),
}));
// Zod Schemas
exports.insertMaintWorkDefinitionSchema = (0, drizzle_zod_1.createInsertSchema)(maintenance_library_1.maintWorkDefinitions);
exports.insertMaintWorkOrderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.maintWorkOrders);
// export const insertMaintOperationSchema = createInsertSchema(maintWorkDefinitionOperations); // Removed, see maintenance_library.ts
exports.insertMaintAssetExtSchema = (0, drizzle_zod_1.createInsertSchema)(exports.maintAssetsExtension);
//# sourceMappingURL=maintenance.js.map