import { pgTable, varchar, text, timestamp, numeric, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== USAGE METERS ==========
// Define types of usage to track (API calls, storage, compute hours, etc.)
export const usageMeters = pgTable("usage_meters", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(), // "API Calls", "Storage GB", "Compute Hours"
    description: text("description"),
    unitOfMeasure: varchar("unit_of_measure").notNull(), // "requests", "GB", "hours"
    meterType: varchar("meter_type").default("Counter"), // Counter, Gauge
    isActive: boolean("is_active").default(true),

    // Pricing Tiers (stored as JSONB for flexibility)
    // Example: [{"min": 0, "max": 1000, "price": "0"}, {"min": 1001, "max": null, "price": "0.01"}]
    pricingTiers: jsonb("pricing_tiers"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertUsageMeterSchema = createInsertSchema(usageMeters).extend({
    name: z.string().min(1),
    unitOfMeasure: z.string().min(1),
    meterType: z.enum(['Counter', 'Gauge']).optional(),
    pricingTiers: z.any().optional(),
});

export type InsertUsageMeter = z.infer<typeof insertUsageMeterSchema>;
export type UsageMeter = typeof usageMeters.$inferSelect;

// ========== USAGE EVENTS ==========
// Actual usage data captured from customers
export const usageEvents = pgTable("usage_events", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    customerId: varchar("customer_id").notNull(),
    meterId: varchar("meter_id").notNull(), // FK to usage_meters

    timestamp: timestamp("timestamp").notNull(),
    quantity: numeric("quantity").notNull(), // How much was consumed

    // Additional metadata
    resourceId: varchar("resource_id"), // Which resource consumed (e.g., API key ID, server ID)
    metadata: jsonb("metadata"), // Flexible additional data

    // Billing status
    status: varchar("status").default("Pending"), // Pending, Billed, Excluded
    billedAt: timestamp("billed_at"),
    invoiceId: varchar("invoice_id"), // Link to invoice once billed

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUsageEventSchema = createInsertSchema(usageEvents).extend({
    customerId: z.string().min(1),
    meterId: z.string().min(1),
    timestamp: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()),
    quantity: z.string().min(1),
    resourceId: z.string().optional().nullable(),
    metadata: z.any().optional(),
});

export type InsertUsageEvent = z.infer<typeof insertUsageEventSchema>;
export type UsageEvent = typeof usageEvents.$inferSelect;

// ========== USAGE THRESHOLDS ==========
// Alert thresholds for usage monitoring
export const usageThresholds = pgTable("usage_thresholds", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    customerId: varchar("customer_id").notNull(),
    meterId: varchar("meter_id").notNull(),

    thresholdValue: numeric("threshold_value").notNull(), // Trigger alert at this usage level
    thresholdType: varchar("threshold_type").default("Value"), // Value, Percentage
    period: varchar("period").default("Monthly"), // Daily, Weekly, Monthly

    // Notification settings
    notifyEmail: boolean("notify_email").default(true),
    notifyWebhook: boolean("notify_webhook").default(false),
    webhookUrl: varchar("webhook_url"),

    isActive: boolean("is_active").default(true),
    lastTriggeredAt: timestamp("last_triggered_at"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUsageThresholdSchema = createInsertSchema(usageThresholds).extend({
    customerId: z.string().min(1),
    meterId: z.string().min(1),
    thresholdValue: z.string().min(1),
    thresholdType: z.enum(['Value', 'Percentage']).optional(),
    period: z.enum(['Daily', 'Weekly', 'Monthly']).optional(),
});

export type InsertUsageThreshold = z.infer<typeof insertUsageThresholdSchema>;
export type UsageThreshold = typeof usageThresholds.$inferSelect;
