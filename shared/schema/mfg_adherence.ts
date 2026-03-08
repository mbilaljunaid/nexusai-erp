import { pgTable, varchar, text, timestamp, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== MANUFACTURING PRODUCTION ADHERENCE (Oracle MFG Schedule Adherence) ==========
// Maps to Oracle Fusion: Production Schedule Compliance / Shop Floor Execution Analytics

export const mfgProductionAdherence = pgTable("mfg_production_adherence", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entInventoryOrgId: varchar("ent_inventory_org_id"),
    workOrderId: varchar("work_order_id").notNull(), // FK to mfg_production_orders
    workOrderNumber: varchar("work_order_number"),
    itemId: varchar("item_id"),
    itemDescription: text("item_description"),
    workCenterId: varchar("work_center_id"),
    workCenterName: varchar("work_center_name"),
    scheduledQty: numeric("scheduled_qty", { precision: 18, scale: 4 }).notNull(),
    actualQty: numeric("actual_qty", { precision: 18, scale: 4 }).default("0"),
    scrapQty: numeric("scrap_qty", { precision: 18, scale: 4 }).default("0"),
    scheduledStartDate: timestamp("scheduled_start_date"),
    scheduledEndDate: timestamp("scheduled_end_date"),
    actualStartDate: timestamp("actual_start_date"),
    actualEndDate: timestamp("actual_end_date"),
    adherencePct: numeric("adherence_pct", { precision: 5, scale: 2 }), // (actualQty / scheduledQty) * 100
    dayVariance: integer("day_variance"), // actual_end - scheduled_end in days (positive = late)
    isOverdue: boolean("is_overdue").default(false),
    efficiencyPct: numeric("efficiency_pct", { precision: 5, scale: 2 }), // standard hrs / actual hrs
    utilizationPct: numeric("utilization_pct", { precision: 5, scale: 2 }), // actual hrs / available hrs
    period: varchar("period"), // e.g. "2026-Q1" for reporting aggregation
    reportingDate: timestamp("reporting_date").default(sql`now()`),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMfgProductionAdherenceSchema = createInsertSchema(mfgProductionAdherence);
export type MfgProductionAdherence = typeof mfgProductionAdherence.$inferSelect;
export type InsertMfgProductionAdherence = z.infer<typeof insertMfgProductionAdherenceSchema>;
