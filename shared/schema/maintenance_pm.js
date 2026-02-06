"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMaintPMDefinitionSchema = exports.maintPMDefinitionsRelations = exports.maintPMDefinitions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const fixedAssets_1 = require("./fixedAssets");
const maintenance_meters_1 = require("./maintenance_meters");
const maintenance_library_1 = require("./maintenance_library");
// ... [Existing tables: maintParameters, maintAssetsExtension, maintWorkDefinitions, etc.] ...
// 8. Preventive Maintenance Definitions (The Plan)
exports.maintPMDefinitions = (0, pg_core_1.pgTable)("maint_pm_definitions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    // Target
    assetId: (0, pg_core_1.varchar)("asset_id").references(() => fixedAssets_1.faAssets.id).notNull(),
    workDefinitionId: (0, pg_core_1.varchar)("work_definition_id").references(() => maintenance_library_1.maintWorkDefinitions.id).notNull(), // The template to use
    // Active Period
    effectiveStartDate: (0, pg_core_1.timestamp)("effective_start_date").default((0, drizzle_orm_1.sql) `now()`),
    effectiveEndDate: (0, pg_core_1.timestamp)("effective_end_date"),
    active: (0, pg_core_1.boolean)("active").default(true),
    // Recurrence Logic
    triggerType: (0, pg_core_1.varchar)("trigger_type", { length: 20 }).default("TIME"), // TIME, METER, HYBRID
    isFloating: (0, pg_core_1.boolean)("is_floating").default(false), // If true, Next Due = Completion Date + Interval (Dynamic)
    // Time Based
    frequency: (0, pg_core_1.integer)("frequency"), // e.g. 1, 3, 6, 12
    frequencyUom: (0, pg_core_1.varchar)("frequency_uom", { length: 20 }), // DAY, WEEK, MONTH, YEAR
    // Meter Based
    meterId: (0, pg_core_1.varchar)("meter_id").references(() => maintenance_meters_1.maintMeters.id),
    intervalValue: (0, pg_core_1.numeric)("interval_value", { precision: 20, scale: 2 }), // e.g. every 1000 KM
    // State
    lastGeneratedDate: (0, pg_core_1.timestamp)("last_generated_date"),
    lastMeterReading: (0, pg_core_1.numeric)("last_meter_reading", { precision: 20, scale: 2 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.maintPMDefinitionsRelations = (0, drizzle_orm_1.relations)(exports.maintPMDefinitions, ({ one }) => ({
    asset: one(fixedAssets_1.faAssets, {
        fields: [exports.maintPMDefinitions.assetId],
        references: [fixedAssets_1.faAssets.id],
    }),
    workDefinition: one(maintenance_library_1.maintWorkDefinitions, {
        fields: [exports.maintPMDefinitions.workDefinitionId],
        references: [maintenance_library_1.maintWorkDefinitions.id],
    }),
    meter: one(maintenance_meters_1.maintMeters, {
        fields: [exports.maintPMDefinitions.meterId],
        references: [maintenance_meters_1.maintMeters.id],
    }),
}));
exports.insertMaintPMDefinitionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.maintPMDefinitions);
//# sourceMappingURL=maintenance_pm.js.map