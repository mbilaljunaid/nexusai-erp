"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintWorkDefinitionMaterialsRelations = exports.maintWorkDefinitionOperationsRelations = exports.maintWorkDefinitionsRelations = exports.maintWorkDefinitionMaterials = exports.maintWorkDefinitionOperations = exports.maintWorkDefinitions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// 1. Work Definition Header (The Template)
exports.maintWorkDefinitions = (0, pg_core_1.pgTable)("maint_work_definitions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    code: (0, pg_core_1.text)("code").notNull(), // Unique User-facing code e.g. "PM-500H-TRUCK"
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    type: (0, pg_core_1.text)("type").default("STANDARD"), // STANDARD, PM, SAFETY
    status: (0, pg_core_1.text)("status").default("ACTIVE"), // ACTIVE, DRAFT, OBSOLETE
    version: (0, pg_core_1.integer)("version").default(1),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// 2. Work Definition Operations (Steps)
exports.maintWorkDefinitionOperations = (0, pg_core_1.pgTable)("maint_work_definition_ops", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    workDefinitionId: (0, pg_core_1.varchar)("work_definition_id").notNull(),
    sequenceNumber: (0, pg_core_1.integer)("sequence_number").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    longDescription: (0, pg_core_1.text)("long_description"), // Detailed instructions
    standardHours: (0, pg_core_1.decimal)("standard_hours", { precision: 10, scale: 2 }).default("0"),
    requiredHeadCount: (0, pg_core_1.integer)("required_head_count").default(1),
});
// 3. Work Definition Materials (Parts)
exports.maintWorkDefinitionMaterials = (0, pg_core_1.pgTable)("maint_work_definition_materials", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    workDefinitionId: (0, pg_core_1.varchar)("work_definition_id").notNull(),
    // Ideally linked to Operation, but filtering by Header is simpler for MVP
    operationSequence: (0, pg_core_1.integer)("operation_sequence"),
    itemId: (0, pg_core_1.varchar)("item_id").notNull(), // Link to Inventory Item (assumed varchar for global parity)
    quantity: (0, pg_core_1.decimal)("quantity", { precision: 10, scale: 2 }).notNull(),
});
// Relations
exports.maintWorkDefinitionsRelations = (0, drizzle_orm_1.relations)(exports.maintWorkDefinitions, ({ many }) => ({
    operations: many(exports.maintWorkDefinitionOperations),
    materials: many(exports.maintWorkDefinitionMaterials),
}));
exports.maintWorkDefinitionOperationsRelations = (0, drizzle_orm_1.relations)(exports.maintWorkDefinitionOperations, ({ one }) => ({
    definition: one(exports.maintWorkDefinitions, {
        fields: [exports.maintWorkDefinitionOperations.workDefinitionId],
        references: [exports.maintWorkDefinitions.id],
    }),
}));
exports.maintWorkDefinitionMaterialsRelations = (0, drizzle_orm_1.relations)(exports.maintWorkDefinitionMaterials, ({ one }) => ({
    definition: one(exports.maintWorkDefinitions, {
        fields: [exports.maintWorkDefinitionMaterials.workDefinitionId],
        references: [exports.maintWorkDefinitions.id],
    }),
}));
//# sourceMappingURL=maintenance_library.js.map