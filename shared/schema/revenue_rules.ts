
import { pgTable, varchar, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

/**
 * 1. Contract Identification Rules
 * Define how source events are grouped into Revenue Contracts.
 */
export const revenueIdentificationRules = pgTable("revenue_identification_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    // grouping_criteria stores an array of fields to group by, e.g. ["legalEntityId", "orgId", "customerId", "referenceNumber"]
    groupingCriteria: jsonb("grouping_criteria").notNull(),
    priority: integer("priority").default(1),
    status: varchar("status").default("Active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRevenueIdentificationRuleSchema = createInsertSchema(revenueIdentificationRules);

/**
 * 2. Performance Obligation (POB) Rules
 * Define how contract lines are categorized into POBs.
 */
export const performanceObligationRules = pgTable("performance_obligation_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    // Rule logic: if source line attribute matches value, use this POB metadata
    attributeName: varchar("attribute_name").notNull(), // e.g. "itemType" or "itemId"
    attributeValue: varchar("attribute_value").notNull(),

    pobName: varchar("pob_name").notNull(), // e.g. "Software License"
    satisfactionMethod: varchar("satisfaction_method").default("Ratable"), // Ratable, PointInTime
    defaultDurationMonths: integer("default_duration_months").default(12),

    priority: integer("priority").default(1),
    status: varchar("status").default("Active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPerformanceObligationRuleSchema = createInsertSchema(performanceObligationRules);
