"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertPaymentSchema = exports.payments = exports.insertSubscriptionSchema = exports.subscriptions = exports.insertPlanSchema = exports.plans = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== SUBSCRIPTION PLANS ==========
exports.plans = (0, pg_core_1.pgTable)("plans", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    price: (0, pg_core_1.numeric)("price", { precision: 18, scale: 2 }),
    billingPeriod: (0, pg_core_1.varchar)("billing_period").default("monthly"), // monthly, yearly
    features: (0, pg_core_1.jsonb)("features"),
    limits: (0, pg_core_1.jsonb)("limits"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPlanSchema = (0, drizzle_zod_1.createInsertSchema)(exports.plans).extend({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    price: zod_1.z.string().optional(),
    billingPeriod: zod_1.z.string().optional(),
    features: zod_1.z.record(zod_1.z.any()).optional(),
    limits: zod_1.z.record(zod_1.z.any()).optional(),
    isActive: zod_1.z.boolean().optional(),
    sortOrder: zod_1.z.number().optional(),
});
exports.subscriptions = (0, pg_core_1.pgTable)("subscriptions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    planId: (0, pg_core_1.varchar)("plan_id").notNull(),
    status: (0, pg_core_1.varchar)("status").default("active"), // active, cancelled, expired, past_due
    currentPeriodStart: (0, pg_core_1.timestamp)("current_period_start"),
    currentPeriodEnd: (0, pg_core_1.timestamp)("current_period_end"),
    cancelledAt: (0, pg_core_1.timestamp)("cancelled_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertSubscriptionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.subscriptions).extend({
    tenantId: zod_1.z.string().min(1),
    planId: zod_1.z.string().min(1),
    status: zod_1.z.string().optional(),
    currentPeriodStart: zod_1.z.date().optional().nullable(),
    currentPeriodEnd: zod_1.z.date().optional().nullable(),
    cancelledAt: zod_1.z.date().optional().nullable(),
});
exports.payments = (0, pg_core_1.pgTable)("payments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    invoiceId: (0, pg_core_1.varchar)("invoice_id"),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, completed, failed, refunded
    paymentMethod: (0, pg_core_1.varchar)("payment_method"),
    transactionId: (0, pg_core_1.varchar)("transaction_id"),
    paidAt: (0, pg_core_1.timestamp)("paid_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPaymentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.payments).extend({
    tenantId: zod_1.z.string().min(1),
    invoiceId: zod_1.z.string().optional().nullable(),
    amount: zod_1.z.string().min(1),
    currency: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    paymentMethod: zod_1.z.string().optional(),
    transactionId: zod_1.z.string().optional(),
    paidAt: zod_1.z.date().optional().nullable(),
});
//# sourceMappingURL=billing.js.map