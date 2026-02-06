
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

// Cost Organization (CST_COST_ORGANIZATIONS)
export const cstCostOrganizations = pgTable("cst_cost_organizations", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    code: text("code").notNull(),
    name: text("name").notNull(),
    inventoryOrganizationId: text("inventoryOrganizationId").notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
});

// Cost Book (CST_COST_BOOKS)
export const cstCostBooks = pgTable("cst_cost_books", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    costBookCode: text("costBookCode").notNull().unique(),
    description: text("description").notNull(),
    currencyCode: text("currencyCode").notNull(),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});

// Cost Period (CST_COST_PERIODS)
export const cstCostPeriods = pgTable("cst_cost_periods", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    costOrganizationId: text("costOrganizationId"), // FK to cst_cost_organizations
    periodName: text("periodName").notNull(),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate").notNull(),
    status: text("status").default("Open"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});

// Cost Scenario (CST_COST_SCENARIOS)
export const cstCostScenarios = pgTable("cst_cost_scenarios", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    costOrganizationId: text("costOrganizationId"), // FK
    name: text("name").notNull(),
    description: text("description"),
    scenarioType: text("scenarioType").default("Pending"),
    effectiveDate: timestamp("effectiveDate"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});

// Cost Element (CST_COST_ELEMENTS)
export const cstCostElements = pgTable("cst_cost_elements", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    costElementCode: text("costElementCode").notNull().unique(),
    description: text("description").notNull(),
    elementType: text("elementType").default("Material"),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow(),
});

// Cost Profile (CST_COST_PROFILES)
export const cstCostProfiles = pgTable("cst_cost_profiles", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    profileName: text("profileName").notNull().unique(),
    description: text("description").notNull(),
    costMethod: text("costMethod").default("Average"),
    isDefault: boolean("isDefault").default(true),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});

// Standard Cost (CST_STANDARD_COSTS)
export const cstStandardCosts = pgTable("cst_standard_costs", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    scenarioId: text("scenarioId"), // FK to cst_cost_scenarios
    itemId: text("itemId"),
    costElementId: text("costElementId"),
    unitCost: decimal("unitCost", { precision: 18, scale: 4 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});

// Landed Cost (CST_LANDED_COSTS)
export const cstLandedCosts = pgTable("cst_landed_costs", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organizationId"),
    purchaseOrderId: text("purchaseOrderId"),
    chargeType: text("chargeType").notNull(),
    amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
    currencyCode: text("currencyCode").notNull(),
    allocationBasis: text("allocationBasis").default("Value"),
    isEstimated: boolean("isEstimated").default(false),
    vendorName: text("vendorName"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});

// Cost Anomaly (CST_ANOMALIES)
export const cstAnomalies = pgTable("cst_anomalies", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organizationId"),
    itemId: text("itemId"),
    anomalyType: text("anomalyType").notNull(),
    detectedValue: decimal("detectedValue", { precision: 10, scale: 2 }),
    expectedValue: decimal("expectedValue", { precision: 10, scale: 2 }),
    variancePercent: decimal("variancePercent", { precision: 5, scale: 2 }),
    severity: text("severity").default("Medium"),
    details: text("details"),
    status: text("status").default("Open"),
    detectedAt: timestamp("detectedAt").defaultNow(),
});

// Approval Request (CST_APPROVAL_REQUESTS)
export const cstApprovalRequests = pgTable("cst_approval_requests", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    requesterId: text("requesterId").notNull(),
    approverId: text("approverId"),
    status: text("status").default("PENDING"),
    entityType: text("entityType").notNull(),
    entityId: text("entityId").notNull(),
    payload: text("payload"),
    rejectionReason: text("rejectionReason"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});

// Legacy Minimal Schema (Deprecated or Used for O2C Stub?)
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

