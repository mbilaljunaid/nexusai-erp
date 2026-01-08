import { pgTable, varchar, text, timestamp, numeric, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== SUBSCRIPTION PLANS ==========
export const plans = pgTable("plans", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 18, scale: 2 }),
    billingPeriod: varchar("billing_period").default("monthly"), // monthly, yearly
    features: jsonb("features"),
    limits: jsonb("limits"),
    isActive: boolean("is_active").default(true),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertPlanSchema = createInsertSchema(plans).extend({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.string().optional(),
    billingPeriod: z.string().optional(),
    features: z.record(z.any()).optional(),
    limits: z.record(z.any()).optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
});

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;

export const subscriptions = pgTable("subscriptions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    planId: varchar("plan_id").notNull(),
    status: varchar("status").default("active"), // active, cancelled, expired, past_due
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelledAt: timestamp("cancelled_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).extend({
    tenantId: z.string().min(1),
    planId: z.string().min(1),
    status: z.string().optional(),
    currentPeriodStart: z.date().optional().nullable(),
    currentPeriodEnd: z.date().optional().nullable(),
    cancelledAt: z.date().optional().nullable(),
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export const payments = pgTable("payments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    invoiceId: varchar("invoice_id"),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    currency: varchar("currency").default("USD"),
    status: varchar("status").default("pending"), // pending, completed, failed, refunded
    paymentMethod: varchar("payment_method"),
    transactionId: varchar("transaction_id"),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPaymentSchema = createInsertSchema(payments).extend({
    tenantId: z.string().min(1),
    invoiceId: z.string().optional().nullable(),
    amount: z.string().min(1),
    currency: z.string().optional(),
    status: z.string().optional(),
    paymentMethod: z.string().optional(),
    transactionId: z.string().optional(),
    paidAt: z.date().optional().nullable(),
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
