"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertCmrReceiptDistributionSchema = exports.insertCstCostDistributionSchema = exports.insertCstItemCostSchema = exports.cstTransactions = exports.cstApprovalRequests = exports.cstAnomalies = exports.cstLandedCosts = exports.cstStandardCosts = exports.cstCostProfiles = exports.cstCostElements = exports.cstCostScenarios = exports.cstCostPeriods = exports.cstCostBooks = exports.cstCostOrganizations = exports.cmrReceiptDistributions = exports.cstCostDistributions = exports.cstItemCosts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// Cost Item Cost (CST_ITEM_COSTS)
exports.cstItemCosts = (0, pg_core_1.pgTable)("cst_item_costs", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    inventoryOrganizationId: (0, pg_core_1.text)("inventoryOrganizationId"),
    itemId: (0, pg_core_1.text)("itemId"),
    costBookId: (0, pg_core_1.text)("costBookId"),
    unitCost: (0, pg_core_1.decimal)("unitCost", { precision: 18, scale: 4 }).default("0"),
    currencyCode: (0, pg_core_1.text)("currencyCode").notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow(),
});
// Cost Distributions (CST_COST_DISTRIBUTIONS)
exports.cstCostDistributions = (0, pg_core_1.pgTable)("cst_cost_distributions", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    transactionId: (0, pg_core_1.text)("transactionId"), // FK to inv_material_transactions
    costOrganizationId: (0, pg_core_1.text)("costOrganizationId"),
    costElementId: (0, pg_core_1.text)("costElementId"),
    accountingLineType: (0, pg_core_1.text)("accountingLineType").notNull(), // 'Inventory Valuation', 'COGS'
    amount: (0, pg_core_1.decimal)("amount", { precision: 18, scale: 4 }).notNull(),
    currencyCode: (0, pg_core_1.text)("currencyCode").notNull(),
    unitCost: (0, pg_core_1.decimal)("unitCost", { precision: 18, scale: 4 }).notNull(),
    status: (0, pg_core_1.text)("status").default("Draft"), // Draft, Final, Posted
    accounted: (0, pg_core_1.boolean)("accounted").default(false),
    glAccountId: (0, pg_core_1.text)("glAccountId"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
});
// Receipt Accounting Distributions (CMR_RECEIPT_DISTRIBUTIONS)
exports.cmrReceiptDistributions = (0, pg_core_1.pgTable)("cmr_receipt_distributions", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    transactionId: (0, pg_core_1.text)("transactionId"), // FK to inv_material_transactions
    costOrganizationId: (0, pg_core_1.text)("costOrganizationId"),
    accountingLineType: (0, pg_core_1.text)("accountingLineType").notNull(),
    amount: (0, pg_core_1.decimal)("amount", { precision: 18, scale: 4 }).notNull(),
    currencyCode: (0, pg_core_1.text)("currencyCode").notNull(),
    accountedAmount: (0, pg_core_1.decimal)("accountedAmount", { precision: 18, scale: 4 }),
    glAccountId: (0, pg_core_1.text)("glAccountId"),
    status: (0, pg_core_1.text)("status").default("Draft"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
});
// Cost Organization (CST_COST_ORGANIZATIONS)
exports.cstCostOrganizations = (0, pg_core_1.pgTable)("cst_cost_organizations", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    code: (0, pg_core_1.text)("code").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    inventoryOrganizationId: (0, pg_core_1.text)("inventoryOrganizationId").notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
});
// Cost Book (CST_COST_BOOKS)
exports.cstCostBooks = (0, pg_core_1.pgTable)("cst_cost_books", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    costBookCode: (0, pg_core_1.text)("costBookCode").notNull().unique(),
    description: (0, pg_core_1.text)("description").notNull(),
    currencyCode: (0, pg_core_1.text)("currencyCode").notNull(),
    isActive: (0, pg_core_1.boolean)("isActive").default(true),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow(),
});
// Cost Period (CST_COST_PERIODS)
exports.cstCostPeriods = (0, pg_core_1.pgTable)("cst_cost_periods", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    costOrganizationId: (0, pg_core_1.text)("costOrganizationId"), // FK to cst_cost_organizations
    periodName: (0, pg_core_1.text)("periodName").notNull(),
    startDate: (0, pg_core_1.timestamp)("startDate").notNull(),
    endDate: (0, pg_core_1.timestamp)("endDate").notNull(),
    status: (0, pg_core_1.text)("status").default("Open"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow(),
});
// Cost Scenario (CST_COST_SCENARIOS)
exports.cstCostScenarios = (0, pg_core_1.pgTable)("cst_cost_scenarios", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    costOrganizationId: (0, pg_core_1.text)("costOrganizationId"), // FK
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    scenarioType: (0, pg_core_1.text)("scenarioType").default("Pending"),
    effectiveDate: (0, pg_core_1.timestamp)("effectiveDate"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow(),
});
// Cost Element (CST_COST_ELEMENTS)
exports.cstCostElements = (0, pg_core_1.pgTable)("cst_cost_elements", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    costElementCode: (0, pg_core_1.text)("costElementCode").notNull().unique(),
    description: (0, pg_core_1.text)("description").notNull(),
    elementType: (0, pg_core_1.text)("elementType").default("Material"),
    isActive: (0, pg_core_1.boolean)("isActive").default(true),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
});
// Cost Profile (CST_COST_PROFILES)
exports.cstCostProfiles = (0, pg_core_1.pgTable)("cst_cost_profiles", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    profileName: (0, pg_core_1.text)("profileName").notNull().unique(),
    description: (0, pg_core_1.text)("description").notNull(),
    costMethod: (0, pg_core_1.text)("costMethod").default("Average"),
    isDefault: (0, pg_core_1.boolean)("isDefault").default(true),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow(),
});
// Standard Cost (CST_STANDARD_COSTS)
exports.cstStandardCosts = (0, pg_core_1.pgTable)("cst_standard_costs", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    scenarioId: (0, pg_core_1.text)("scenarioId"), // FK to cst_cost_scenarios
    itemId: (0, pg_core_1.text)("itemId"),
    costElementId: (0, pg_core_1.text)("costElementId"),
    unitCost: (0, pg_core_1.decimal)("unitCost", { precision: 18, scale: 4 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow(),
});
// Landed Cost (CST_LANDED_COSTS)
exports.cstLandedCosts = (0, pg_core_1.pgTable)("cst_landed_costs", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: (0, pg_core_1.text)("organizationId"),
    purchaseOrderId: (0, pg_core_1.text)("purchaseOrderId"),
    chargeType: (0, pg_core_1.text)("chargeType").notNull(),
    amount: (0, pg_core_1.decimal)("amount", { precision: 18, scale: 4 }).notNull(),
    currencyCode: (0, pg_core_1.text)("currencyCode").notNull(),
    allocationBasis: (0, pg_core_1.text)("allocationBasis").default("Value"),
    isEstimated: (0, pg_core_1.boolean)("isEstimated").default(false),
    vendorName: (0, pg_core_1.text)("vendorName"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow(),
});
// Cost Anomaly (CST_ANOMALIES)
exports.cstAnomalies = (0, pg_core_1.pgTable)("cst_anomalies", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: (0, pg_core_1.text)("organizationId"),
    itemId: (0, pg_core_1.text)("itemId"),
    anomalyType: (0, pg_core_1.text)("anomalyType").notNull(),
    detectedValue: (0, pg_core_1.decimal)("detectedValue", { precision: 10, scale: 2 }),
    expectedValue: (0, pg_core_1.decimal)("expectedValue", { precision: 10, scale: 2 }),
    variancePercent: (0, pg_core_1.decimal)("variancePercent", { precision: 5, scale: 2 }),
    severity: (0, pg_core_1.text)("severity").default("Medium"),
    details: (0, pg_core_1.text)("details"),
    status: (0, pg_core_1.text)("status").default("Open"),
    detectedAt: (0, pg_core_1.timestamp)("detectedAt").defaultNow(),
});
// Approval Request (CST_APPROVAL_REQUESTS)
exports.cstApprovalRequests = (0, pg_core_1.pgTable)("cst_approval_requests", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    requesterId: (0, pg_core_1.text)("requesterId").notNull(),
    approverId: (0, pg_core_1.text)("approverId"),
    status: (0, pg_core_1.text)("status").default("PENDING"),
    entityType: (0, pg_core_1.text)("entityType").notNull(),
    entityId: (0, pg_core_1.text)("entityId").notNull(),
    payload: (0, pg_core_1.text)("payload"),
    rejectionReason: (0, pg_core_1.text)("rejectionReason"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow(),
});
// Legacy Minimal Schema (Deprecated or Used for O2C Stub?)
exports.cstTransactions = (0, pg_core_1.pgTable)("cst_transactions", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    transactionType: (0, pg_core_1.text)("transaction_type").notNull(),
    itemId: (0, pg_core_1.text)("item_id").notNull(),
    quantity: (0, pg_core_1.decimal)("quantity", { precision: 16, scale: 4 }).notNull(),
    unitCost: (0, pg_core_1.decimal)("unit_cost", { precision: 16, scale: 4 }).default("0"),
    totalCost: (0, pg_core_1.decimal)("total_cost", { precision: 16, scale: 2 }).default("0"),
    orgId: (0, pg_core_1.text)("org_id").notNull(),
    transactionDate: (0, pg_core_1.timestamp)("transaction_date").defaultNow(),
    glStatus: (0, pg_core_1.text)("gl_status").default("PENDING")
});
exports.insertCstItemCostSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cstItemCosts);
exports.insertCstCostDistributionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cstCostDistributions);
exports.insertCmrReceiptDistributionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cmrReceiptDistributions);
//# sourceMappingURL=costing.js.map