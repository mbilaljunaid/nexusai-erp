
import { pgTable, text, serial, integer, boolean, timestamp, uuid, jsonb, decimal, varchar } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { faAssets } from "./fixedAssets";


// 1. Asset Meters (New)
export const maintMeters = pgTable("maint_asset_meters", {


    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    assetId: varchar("asset_id").notNull(), // Linked to Fixed Asset
    name: text("name").notNull(), // e.g. "Engine Hours", "Odometer", "Cycle Count"
    description: text("description"),
    unitOfMeasure: text("unit_of_measure").notNull(), // e.g. "Hours", "KM", "Cycles"

    // Type: ABSOLUTE (odometer) or CONTINUOUS/GAUGE (temperature)?
    // For PMs, we usually care about Utilization (Absolute increasing)
    readingType: text("reading_type").default("ABSOLUTE"), // ABSOLUTE (Cumulative), DELTA, GAUGE

    currentValue: decimal("current_value", { precision: 15, scale: 2 }).default("0"),
    lastReadingDate: timestamp("last_reading_date"),

    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// 2. Meter Readings (Log)
export const maintMeterReadings = pgTable("maint_asset_meter_readings", {

    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    meterId: varchar("meter_id").notNull(),

    readingValue: decimal("reading_value", { precision: 15, scale: 2 }).notNull(),
    readingDate: timestamp("reading_date").defaultNow().notNull(),

    // Calculated delta from previous reading (for easy analysis)
    deltaValue: decimal("delta_value", { precision: 15, scale: 2 }),

    source: text("source").default("MANUAL"), // MANUAL, IOT, WO_COMPLETION
    workOrderId: varchar("work_order_id"), // If captured during a WO
    createdById: text("created_by_id"),
});


// Relations
export const maintMetersRelations = relations(maintMeters, ({ one, many }) => ({
    asset: one(faAssets, {
        fields: [maintMeters.assetId],
        references: [faAssets.id],
    }),
    readings: many(maintMeterReadings),
}));

export const maintMeterReadingsRelations = relations(maintMeterReadings, ({ one }) => ({
    meter: one(maintMeters, {
        fields: [maintMeterReadings.meterId],
        references: [maintMeters.id],
    }),
}));

// --- LEGACY TABLES (To prevent auto-rename, will drop later) ---
export const maintMetersLegacy = pgTable("maint_meters", {
    id: uuid("id").defaultRandom().primaryKey(),
    assetId: uuid("asset_id"),
});

export const maintMeterReadingsLegacy = pgTable("maint_meter_readings", {
    id: uuid("id").defaultRandom().primaryKey(),
    meterId: uuid("meter_id"),
});

