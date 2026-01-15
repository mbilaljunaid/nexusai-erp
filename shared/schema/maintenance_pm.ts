
import { pgTable, text, varchar, timestamp, numeric, boolean, integer, jsonb, date, check } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { faAssets } from "./fixedAssets";
import { maintWorkDefinitions, maintMeters } from "./maintenance";

// ... [Existing tables: maintParameters, maintAssetsExtension, maintWorkDefinitions, etc.] ...

// 8. Preventive Maintenance Definitions (The Plan)
export const maintPMDefinitions = pgTable("maint_pm_definitions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),

    // Target
    assetId: varchar("asset_id").references(() => faAssets.id).notNull(),
    workDefinitionId: varchar("work_definition_id").references(() => maintWorkDefinitions.id).notNull(), // The template to use

    // Active Period
    effectiveStartDate: timestamp("effective_start_date").default(sql`now()`),
    effectiveEndDate: timestamp("effective_end_date"),
    active: boolean("active").default(true),

    // Recurrence Logic
    triggerType: varchar("trigger_type", { length: 20 }).default("TIME"), // TIME, METER, HYBRID

    // Time Based
    frequency: integer("frequency"), // e.g. 1, 3, 6, 12
    frequencyUom: varchar("frequency_uom", { length: 20 }), // DAY, WEEK, MONTH, YEAR

    // Meter Based
    meterId: varchar("meter_id").references(() => maintMeters.id),
    intervalValue: numeric("interval_value", { precision: 20, scale: 2 }), // e.g. every 1000 KM

    // State
    lastGeneratedDate: timestamp("last_generated_date"),
    lastMeterReading: numeric("last_meter_reading", { precision: 20, scale: 2 }),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const maintPMDefinitionsRelations = relations(maintPMDefinitions, ({ one }) => ({
    asset: one(faAssets, {
        fields: [maintPMDefinitions.assetId],
        references: [faAssets.id],
    }),
    workDefinition: one(maintWorkDefinitions, {
        fields: [maintPMDefinitions.workDefinitionId],
        references: [maintWorkDefinitions.id],
    }),
    meter: one(maintMeters, {
        fields: [maintPMDefinitions.meterId],
        references: [maintMeters.id],
    }),
}));

export const insertMaintPMDefinitionSchema = createInsertSchema(maintPMDefinitions);
export type MaintPMDefinition = typeof maintPMDefinitions.$inferSelect;
