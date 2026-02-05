
import { pgTable, text, timestamp, decimal, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";


// Cost Item Cost (CST_ITEM_COSTS)
export const cstItemCosts = pgTable("cst_item_costs", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    inventoryOrganizationId: text("inventoryOrganizationId"),
    itemId: text("itemId"),
    costBookId: text("costBookId"),
    unitCost: decimal("unitCost", { precision: 18, scale: 4 }).default("0"),
    currencyCode: text("currencyCode").notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});

// Cost Distributions (CST_COST_DISTRIBUTIONS)
export const cstCostDistributions = pgTable("cst_cost_distributions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    transactionId: text("transactionId"), // FK to inv_material_transactions
    costOrganizationId: text("costOrganizationId"),
    costElementId: text("costElementId"),
    accountingLineType: text("accountingLineType").notNull(), // 'Inventory Valuation', 'COGS'
    amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
    currencyCode: text("currencyCode").notNull(),
    unitCost: decimal("unitCost", { precision: 18, scale: 4 }).notNull(),
    status: text("status").default("Draft"), // Draft, Final, Posted
    accounted: boolean("accounted").default(false),
    glAccountId: text("glAccountId"),
    createdAt: timestamp("createdAt").defaultNow(),
});

// Receipt Accounting Distributions (CMR_RECEIPT_DISTRIBUTIONS)
export const cmrReceiptDistributions = pgTable("cmr_receipt_distributions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    transactionId: text("transactionId"), // FK to inv_material_transactions
    costOrganizationId: text("costOrganizationId"),
    accountingLineType: text("accountingLineType").notNull(),
    amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
    currencyCode: text("currencyCode").notNull(),
    accountedAmount: decimal("accountedAmount", { precision: 18, scale: 4 }),
    glAccountId: text("glAccountId"),
    status: text("status").default("Draft"),
    createdAt: timestamp("createdAt").defaultNow(),
});

// Legacy Minimal Schema (Deprecated or Used for O2C Stub?)
// Keeping for backward compat if needed, but the above replaces generic usage.
export const cstTransactions = pgTable("cst_transactions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    transactionType: text("transaction_type").notNull(),
    itemId: text("item_id").notNull(),
    quantity: decimal("quantity", { precision: 16, scale: 4 }).notNull(),
    unitCost: decimal("unit_cost", { precision: 16, scale: 4 }).default("0"),
    totalCost: decimal("total_cost", { precision: 16, scale: 2 }).default("0"),
    orgId: text("org_id").notNull(),
    transactionDate: timestamp("transaction_date").defaultNow(),
    glStatus: text("gl_status").default("PENDING")
});

export const insertCstItemCostSchema = createInsertSchema(cstItemCosts);
export const insertCstCostDistributionSchema = createInsertSchema(cstCostDistributions);
export const insertCmrReceiptDistributionSchema = createInsertSchema(cmrReceiptDistributions);

export type CstItemCost = typeof cstItemCosts.$inferSelect;
export type CstCostDistribution = typeof cstCostDistributions.$inferSelect;
export type CmrReceiptDistribution = typeof cmrReceiptDistributions.$inferSelect;

