import { pgTable, text, serial, integer, boolean, timestamp, numeric, date, uuid, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { arCustomers } from "./ar";

// 1. Subscription Contracts (Header)
export const subscriptionContracts = pgTable("subscription_contracts", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    contractNumber: text("contract_number").notNull().unique(), // e.g., SUB-2026-001
    customerId: text("customer_id").references(() => arCustomers.id),
    status: text("status").notNull().default("Draft"), // Draft, Active, Hold, Cancelled, Expired
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    renewalType: text("renewal_type").default("Manual"), // Manual, Auto
    currency: text("currency").default("USD"),
    paymentTerms: text("payment_terms").default("Net 30"),
    billingFrequency: text("billing_frequency").default("Monthly"), // Monthly, Quarterly, Annually

    // Amounts
    totalTcv: numeric("total_tcv").default("0"), // Total Contract Value
    totalMrr: numeric("total_mrr").default("0"), // Monthly Recurring Revenue

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    createdBy: text("created_by"),
});

// 2. Subscription Products (Lines)
export const subscriptionProducts = pgTable("subscription_products", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    subscriptionId: text("subscription_id").references(() => subscriptionContracts.id),

    itemId: text("item_id").notNull(), // Product ID
    itemName: text("item_name").notNull(),

    quantity: numeric("quantity").notNull().default("1"),
    unitPrice: numeric("unit_price").notNull(),
    discountPercent: numeric("discount_percent").default("0"),
    amount: numeric("amount").notNull(), // (Qty * Price) - Discount

    billingType: text("billing_type").default("Recurring"), // Recurring, One-Time, Usage

    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),

    status: text("status").default("Active"),
});

// 3. Subscription Actions (Lifecycle History / Audit)
export const subscriptionActions = pgTable("subscription_actions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    subscriptionId: text("subscription_id").references(() => subscriptionContracts.id),
    actionType: text("action_type").notNull(), // New, Amend, Renew, Terminate, Suspend
    actionDate: timestamp("action_date").defaultNow(),

    reason: text("reason"),

    // Snapshot of values before/after change
    changes: jsonb("changes"), // e.g., { "quantity": { "old": 10, "new": 15 } }

    performedBy: text("performed_by"),
});

// Relations
export const subscriptionContractsRelations = relations(subscriptionContracts, ({ many }) => ({
    products: many(subscriptionProducts),
    actions: many(subscriptionActions),
}));

export const subscriptionProductsRelations = relations(subscriptionProducts, ({ one }) => ({
    contract: one(subscriptionContracts, {
        fields: [subscriptionProducts.subscriptionId],
        references: [subscriptionContracts.id],
    }),
}));

export const subscriptionActionsRelations = relations(subscriptionActions, ({ one }) => ({
    contract: one(subscriptionContracts, {
        fields: [subscriptionActions.subscriptionId],
        references: [subscriptionContracts.id],
    }),
}));
