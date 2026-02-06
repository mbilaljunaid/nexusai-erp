"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionActionsRelations = exports.subscriptionProductsRelations = exports.subscriptionContractsRelations = exports.subscriptionActions = exports.subscriptionProducts = exports.subscriptionContracts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const ar_1 = require("./ar");
// 1. Subscription Contracts (Header)
exports.subscriptionContracts = (0, pg_core_1.pgTable)("subscription_contracts", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    contractNumber: (0, pg_core_1.text)("contract_number").notNull().unique(), // e.g., SUB-2026-001
    customerId: (0, pg_core_1.text)("customer_id").references(() => ar_1.arCustomers.id),
    status: (0, pg_core_1.text)("status").notNull().default("Draft"), // Draft, Active, Hold, Cancelled, Expired
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    renewalType: (0, pg_core_1.text)("renewal_type").default("Manual"), // Manual, Auto
    currency: (0, pg_core_1.text)("currency").default("USD"),
    paymentTerms: (0, pg_core_1.text)("payment_terms").default("Net 30"),
    billingFrequency: (0, pg_core_1.text)("billing_frequency").default("Monthly"), // Monthly, Quarterly, Annually
    // Amounts
    totalTcv: (0, pg_core_1.numeric)("total_tcv").default("0"), // Total Contract Value
    totalMrr: (0, pg_core_1.numeric)("total_mrr").default("0"), // Monthly Recurring Revenue
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
    createdBy: (0, pg_core_1.text)("created_by"),
});
// 2. Subscription Products (Lines)
exports.subscriptionProducts = (0, pg_core_1.pgTable)("subscription_products", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    subscriptionId: (0, pg_core_1.text)("subscription_id").references(() => exports.subscriptionContracts.id),
    itemId: (0, pg_core_1.text)("item_id").notNull(), // Product ID
    itemName: (0, pg_core_1.text)("item_name").notNull(),
    quantity: (0, pg_core_1.numeric)("quantity").notNull().default("1"),
    unitPrice: (0, pg_core_1.numeric)("unit_price").notNull(),
    discountPercent: (0, pg_core_1.numeric)("discount_percent").default("0"),
    amount: (0, pg_core_1.numeric)("amount").notNull(), // (Qty * Price) - Discount
    billingType: (0, pg_core_1.text)("billing_type").default("Recurring"), // Recurring, One-Time, Usage
    startDate: (0, pg_core_1.timestamp)("start_date"),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    status: (0, pg_core_1.text)("status").default("Active"),
});
// 3. Subscription Actions (Lifecycle History / Audit)
exports.subscriptionActions = (0, pg_core_1.pgTable)("subscription_actions", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    subscriptionId: (0, pg_core_1.text)("subscription_id").references(() => exports.subscriptionContracts.id),
    actionType: (0, pg_core_1.text)("action_type").notNull(), // New, Amend, Renew, Terminate, Suspend
    actionDate: (0, pg_core_1.timestamp)("action_date").defaultNow(),
    reason: (0, pg_core_1.text)("reason"),
    // Snapshot of values before/after change
    changes: (0, pg_core_1.jsonb)("changes"), // e.g., { "quantity": { "old": 10, "new": 15 } }
    performedBy: (0, pg_core_1.text)("performed_by"),
});
// Relations
exports.subscriptionContractsRelations = (0, drizzle_orm_1.relations)(exports.subscriptionContracts, ({ many }) => ({
    products: many(exports.subscriptionProducts),
    actions: many(exports.subscriptionActions),
}));
exports.subscriptionProductsRelations = (0, drizzle_orm_1.relations)(exports.subscriptionProducts, ({ one }) => ({
    contract: one(exports.subscriptionContracts, {
        fields: [exports.subscriptionProducts.subscriptionId],
        references: [exports.subscriptionContracts.id],
    }),
}));
exports.subscriptionActionsRelations = (0, drizzle_orm_1.relations)(exports.subscriptionActions, ({ one }) => ({
    contract: one(exports.subscriptionContracts, {
        fields: [exports.subscriptionActions.subscriptionId],
        references: [exports.subscriptionContracts.id],
    }),
}));
//# sourceMappingURL=billing_subscription.js.map