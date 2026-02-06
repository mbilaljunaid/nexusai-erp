"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMaintPermitSchema = exports.insertMaintInspectionSchema = exports.insertMaintInspectionDefSchema = exports.maintPermitsRelations = exports.maintInspectionsRelations = exports.maintInspectionDefinitionsRelations = exports.maintPermits = exports.maintInspections = exports.maintInspectionDefinitions = exports.maintInspectionStatusEnum = exports.maintPermitTypeEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const maintenance_1 = require("./maintenance");
const fixedAssets_1 = require("./fixedAssets");
// Enums
exports.maintPermitTypeEnum = (0, pg_core_1.pgEnum)("maint_permit_type", [
    "HOT_WORK",
    "COLD_WORK",
    "CONFINED_SPACE",
    "ELECTRICAL_ISOLATION",
    "WORKING_AT_HEIGHT"
]);
exports.maintInspectionStatusEnum = (0, pg_core_1.pgEnum)("maint_inspection_status", [
    "PENDING",
    "IN_PROGRESS",
    "PASS",
    "FAIL"
]);
// 1. Inspection Templates (Definitions)
exports.maintInspectionDefinitions = (0, pg_core_1.pgTable)("maint_inspection_definitions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name", { length: 150 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    type: (0, pg_core_1.varchar)("type", { length: 50 }).default("Standard"), // e.g. Pre-Start, Monthly
    // JSONB for Questions: Array of { id: string, text: string, type: 'YES_NO' | 'TEXT' | 'NUMBER', required: boolean }
    questions: (0, pg_core_1.jsonb)("questions").notNull().default([]),
    active: (0, pg_core_1.boolean)("active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// 2. Inspection Executions
exports.maintInspections = (0, pg_core_1.pgTable)("maint_inspections", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    definitionId: (0, pg_core_1.varchar)("definition_id").references(() => exports.maintInspectionDefinitions.id).notNull(),
    workOrderId: (0, pg_core_1.varchar)("work_order_id").references(() => maintenance_1.maintWorkOrders.id),
    assetId: (0, pg_core_1.varchar)("asset_id").references(() => fixedAssets_1.faAssets.id),
    status: (0, exports.maintInspectionStatusEnum)("status").default("PENDING"),
    // JSONB for Results: Array of { questionId: string, answer: any, comment: string }
    results: (0, pg_core_1.jsonb)("results").default([]),
    conductedByUserId: (0, pg_core_1.varchar)("conducted_by_user_id"), // Ideally FK to users, but focusing on Schema independence
    conductedAt: (0, pg_core_1.timestamp)("conducted_at"),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// 3. Work Permtis (Safety)
exports.maintPermits = (0, pg_core_1.pgTable)("maint_permits", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    permitNumber: (0, pg_core_1.varchar)("permit_number", { length: 50 }).notNull().unique(), // Auto-gen
    workOrderId: (0, pg_core_1.varchar)("work_order_id").references(() => maintenance_1.maintWorkOrders.id).notNull(),
    type: (0, exports.maintPermitTypeEnum)("type").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 30 }).default("ACTIVE"), // ACTIVE, CLOSED, EXPIRED
    validFrom: (0, pg_core_1.timestamp)("valid_from").notNull(),
    validTo: (0, pg_core_1.timestamp)("valid_to").notNull(),
    authorizedByUserId: (0, pg_core_1.varchar)("authorized_by_user_id"),
    hazards: (0, pg_core_1.text)("hazards"),
    precautions: (0, pg_core_1.text)("precautions"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Relations
exports.maintInspectionDefinitionsRelations = (0, drizzle_orm_1.relations)(exports.maintInspectionDefinitions, ({ many }) => ({
    inspections: many(exports.maintInspections),
}));
exports.maintInspectionsRelations = (0, drizzle_orm_1.relations)(exports.maintInspections, ({ one }) => ({
    definition: one(exports.maintInspectionDefinitions, {
        fields: [exports.maintInspections.definitionId],
        references: [exports.maintInspectionDefinitions.id],
    }),
    workOrder: one(maintenance_1.maintWorkOrders, {
        fields: [exports.maintInspections.workOrderId],
        references: [maintenance_1.maintWorkOrders.id],
    }),
}));
exports.maintPermitsRelations = (0, drizzle_orm_1.relations)(exports.maintPermits, ({ one }) => ({
    workOrder: one(maintenance_1.maintWorkOrders, {
        fields: [exports.maintPermits.workOrderId],
        references: [maintenance_1.maintWorkOrders.id],
    })
}));
exports.insertMaintInspectionDefSchema = (0, drizzle_zod_1.createInsertSchema)(exports.maintInspectionDefinitions);
exports.insertMaintInspectionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.maintInspections);
exports.insertMaintPermitSchema = (0, drizzle_zod_1.createInsertSchema)(exports.maintPermits);
//# sourceMappingURL=maintenance_quality.js.map