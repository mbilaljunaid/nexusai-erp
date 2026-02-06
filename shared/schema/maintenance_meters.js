"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintMeterReadingsLegacy = exports.maintMetersLegacy = exports.maintMeterReadingsRelations = exports.maintMetersRelations = exports.maintMeterReadings = exports.maintMeters = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const fixedAssets_1 = require("./fixedAssets");
// 1. Asset Meters (New)
exports.maintMeters = (0, pg_core_1.pgTable)("maint_asset_meters", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    assetId: (0, pg_core_1.varchar)("asset_id").notNull(), // Linked to Fixed Asset
    name: (0, pg_core_1.text)("name").notNull(), // e.g. "Engine Hours", "Odometer", "Cycle Count"
    description: (0, pg_core_1.text)("description"),
    unitOfMeasure: (0, pg_core_1.text)("unit_of_measure").notNull(), // e.g. "Hours", "KM", "Cycles"
    // Type: ABSOLUTE (odometer) or CONTINUOUS/GAUGE (temperature)?
    // For PMs, we usually care about Utilization (Absolute increasing)
    readingType: (0, pg_core_1.text)("reading_type").default("ABSOLUTE"), // ABSOLUTE (Cumulative), DELTA, GAUGE
    currentValue: (0, pg_core_1.decimal)("current_value", { precision: 15, scale: 2 }).default("0"),
    lastReadingDate: (0, pg_core_1.timestamp)("last_reading_date"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// 2. Meter Readings (Log)
exports.maintMeterReadings = (0, pg_core_1.pgTable)("maint_asset_meter_readings", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    meterId: (0, pg_core_1.varchar)("meter_id").notNull(),
    readingValue: (0, pg_core_1.decimal)("reading_value", { precision: 15, scale: 2 }).notNull(),
    readingDate: (0, pg_core_1.timestamp)("reading_date").defaultNow().notNull(),
    // Calculated delta from previous reading (for easy analysis)
    deltaValue: (0, pg_core_1.decimal)("delta_value", { precision: 15, scale: 2 }),
    source: (0, pg_core_1.text)("source").default("MANUAL"), // MANUAL, IOT, WO_COMPLETION
    workOrderId: (0, pg_core_1.varchar)("work_order_id"), // If captured during a WO
    createdById: (0, pg_core_1.text)("created_by_id"),
});
// Relations
exports.maintMetersRelations = (0, drizzle_orm_1.relations)(exports.maintMeters, ({ one, many }) => ({
    asset: one(fixedAssets_1.faAssets, {
        fields: [exports.maintMeters.assetId],
        references: [fixedAssets_1.faAssets.id],
    }),
    readings: many(exports.maintMeterReadings),
}));
exports.maintMeterReadingsRelations = (0, drizzle_orm_1.relations)(exports.maintMeterReadings, ({ one }) => ({
    meter: one(exports.maintMeters, {
        fields: [exports.maintMeterReadings.meterId],
        references: [exports.maintMeters.id],
    }),
}));
// --- LEGACY TABLES (To prevent auto-rename, will drop later) ---
exports.maintMetersLegacy = (0, pg_core_1.pgTable)("maint_meters", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    assetId: (0, pg_core_1.uuid)("asset_id"),
});
exports.maintMeterReadingsLegacy = (0, pg_core_1.pgTable)("maint_meter_readings", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    meterId: (0, pg_core_1.uuid)("meter_id"),
});
//# sourceMappingURL=maintenance_meters.js.map