
import { pgTable, varchar, text, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const costAnomalies = pgTable("mfg_cost_anomalies", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    targetType: varchar("target_type").notNull(), // PRODUCTION_ORDER, PURCHASE_ORDER
    targetId: varchar("target_id").notNull(),
    anomalyType: varchar("anomaly_type").notNull(), // IPV_VARIANCE, EFFICIENCY_LOW, SCRAP_EXCESS
    severity: varchar("severity").notNull(), // LOW, MEDIUM, HIGH
    description: text("description"),
    status: varchar("status").default("PENDING"), // PENDING, DISMISSED, INVESTIGATING
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCostAnomalySchema = createInsertSchema(costAnomalies);
export type CostAnomaly = typeof costAnomalies.$inferSelect;
export type InsertCostAnomaly = z.infer<typeof insertCostAnomalySchema>;
