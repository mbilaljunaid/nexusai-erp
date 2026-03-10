import { pgTable, varchar, text, timestamp, numeric, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== PROJECT PORTFOLIO MANAGEMENT (PPM) SUBLEDGER ==========

// 1. Projects (Financial Header)
export const ppmProjects = pgTable("ppm_projects", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    projectNumber: varchar("project_number").notNull().unique(),
    name: varchar("name").notNull(),
    description: text("description"),
    projectType: varchar("project_type").notNull(), // CAPITAL, INDIRECT, CONTRACT
    organizationId: varchar("organization_id"), // Linked to Cost Organization
    currencyCode: varchar("currency_code").notNull().default("USD"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    status: varchar("status").default("DRAFT"), // DRAFT, ACTIVE, CLOSED
    burdenScheduleId: varchar("burden_schedule_id"), // Default schedule for project
    budget: numeric("budget", { precision: 18, scale: 2 }).default("0.00"), // Planned Value (BAC)
    percentComplete: numeric("percent_complete", { precision: 5, scale: 2 }).default("0.00"), // For EV calculation
    entBusinessUnitId: varchar("ent_business_unit_id"), // Enterprise Scoping – Business Unit
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmProjectSchema = createInsertSchema(ppmProjects);
export type InsertPpmProject = z.infer<typeof insertPpmProjectSchema>;
export type PpmProject = typeof ppmProjects.$inferSelect;

// 2. Tasks (Financial WBS)
export const ppmTasks = pgTable("ppm_tasks", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    projectId: varchar("project_id").notNull(),
    parentTaskId: varchar("parent_task_id"), // For hierarchy
    taskNumber: varchar("task_number").notNull(),
    name: varchar("name").notNull(),
    description: text("description"),
    billableFlag: boolean("billable_flag").default(false),
    chargeableFlag: boolean("chargeable_flag").default(true),
    capitalizableFlag: boolean("capitalizable_flag").default(false),
    burdenScheduleId: varchar("burden_schedule_id"), // Task-specific override
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmTaskSchema = createInsertSchema(ppmTasks);
export type InsertPpmTask = z.infer<typeof insertPpmTaskSchema>;
export type PpmTask = typeof ppmTasks.$inferSelect;

// 3. Expenditure Types
export const ppmExpenditureTypes = pgTable("ppm_expenditure_types", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(), // e.g., Professional Services, IT Equipment, Travel
    unitOfMeasure: varchar("uom").notNull(), // Hours, Currency, Each
    description: text("description"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmExpenditureTypeSchema = createInsertSchema(ppmExpenditureTypes);
export type InsertPpmExpenditureType = z.infer<typeof insertPpmExpenditureTypeSchema>;
export type PpmExpenditureType = typeof ppmExpenditureTypes.$inferSelect;

// 4. Expenditure Items (Atomic Transactions)
export const ppmExpenditureItems = pgTable("ppm_expenditure_items", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    taskId: varchar("task_id").notNull(),
    expenditureTypeId: varchar("expenditure_type_id").notNull(),
    expenditureItemDate: timestamp("exp_item_date").notNull(),
    quantity: numeric("quantity", { precision: 18, scale: 2 }).notNull(),
    unitCost: numeric("unit_cost", { precision: 18, scale: 4 }),
    rawCost: numeric("raw_cost", { precision: 18, scale: 4 }).notNull(),
    burdenedCost: numeric("burdened_cost", { precision: 18, scale: 4 }), // Post-burden calculation
    status: varchar("status").default("UNCOSTED"), // UNCOSTED, COSTED, DISTRIBUTED
    transactionSource: varchar("transaction_source").notNull(), // AP, TIME, PO, MANUAL
    transactionReference: varchar("transaction_reference"), // e.g., Invoice ID
    denomCurrencyCode: varchar("denom_currency_code").notNull().default("USD"),
    denomRawCost: numeric("denom_raw_cost", { precision: 18, scale: 4 }),
    capitalizationStatus: varchar("cap_status").default("NOT_APPLICABLE"), // CIP, CAPITALIZED, NOT_APPLICABLE
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmExpenditureItemSchema = createInsertSchema(ppmExpenditureItems);
export type InsertPpmExpenditureItem = z.infer<typeof insertPpmExpenditureItemSchema>;
export type PpmExpenditureItem = typeof ppmExpenditureItems.$inferSelect;

// 5. Cost Distributions (Accounting)
export const ppmCostDistributions = pgTable("ppm_cost_distributions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    expenditureItemId: varchar("expenditure_item_id").notNull(),
    drCodeCombinationId: varchar("dr_ccid").notNull(), // The project/task charge account
    crCodeCombinationId: varchar("cr_ccid").notNull(), // The offset/accrual account
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    accountingPeriodId: varchar("accounting_period_id"),
    glJournalId: varchar("gl_journal_id"), // Link to posted GL journal
    status: varchar("status").default("DRAFT"), // DRAFT, POSTED
    lineType: varchar("line_type").default("RAW"), // RAW, BURDENED
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmCostDistributionSchema = createInsertSchema(ppmCostDistributions);
export type InsertPpmCostDistribution = z.infer<typeof insertPpmCostDistributionSchema>;
export type PpmCostDistribution = typeof ppmCostDistributions.$inferSelect;

// 6. Burden Schedules (Header)
export const ppmBurdenSchedules = pgTable("ppm_burden_schedules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(),
    description: text("description"),
    version: varchar("version").default("1.0"),
    activeFlag: boolean("active_flag").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmBurdenScheduleSchema = createInsertSchema(ppmBurdenSchedules);
export type InsertPpmBurdenSchedule = z.infer<typeof insertPpmBurdenScheduleSchema>;
export type PpmBurdenSchedule = typeof ppmBurdenSchedules.$inferSelect;

// 7. Burden Multipliers (Rules)
export const ppmBurdenRules = pgTable("ppm_burden_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    scheduleId: varchar("schedule_id").notNull(),
    expenditureTypeId: varchar("expenditure_type_id").notNull(),
    multiplier: numeric("multiplier", { precision: 18, scale: 4 }).notNull(), // e.g., 0.20 for 20%
    precedence: integer("precedence").default(1),
    description: text("description"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmBurdenRuleSchema = createInsertSchema(ppmBurdenRules);
export type InsertPpmBurdenRule = z.infer<typeof insertPpmBurdenRuleSchema>;
export type PpmBurdenRule = typeof ppmBurdenRules.$inferSelect;

// 8. Project Assets (Integration with Fixed Assets)
export const ppmProjectAssets = pgTable("ppm_project_assets", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    projectId: varchar("project_id").notNull(),
    assetName: varchar("asset_name").notNull(),
    assetDescription: text("asset_description"),
    assetNumber: varchar("asset_number"), // Assigned after interface to FA
    status: varchar("status").default("DRAFT"), // DRAFT, INF-PENDING, INTERFACED
    faAssetId: varchar("fa_asset_id"), // Linked to fa_assets table
    assetType: varchar("asset_type").default("EQUIPMENT"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmProjectAssetSchema = createInsertSchema(ppmProjectAssets);
export type InsertPpmProjectAsset = z.infer<typeof insertPpmProjectAssetSchema>;
export type PpmProjectAsset = typeof ppmProjectAssets.$inferSelect;

// 9. Asset Lines (Cost Grouping)
export const ppmAssetLines = pgTable("ppm_asset_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    projectAssetId: varchar("project_asset_id").notNull(),
    expenditureItemId: varchar("expenditure_item_id").unique().notNull(), // One exp item belongs to one asset line
    capitalizedAmount: numeric("capitalized_amount", { precision: 18, scale: 2 }).notNull(),
    status: varchar("status").default("NEW"), // NEW, INTERFACED
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmAssetLineSchema = createInsertSchema(ppmAssetLines);
export type InsertPpmAssetLine = z.infer<typeof insertPpmAssetLineSchema>;
export type PpmAssetLine = typeof ppmAssetLines.$inferSelect;

// 10. Performance Snapshots (EVM Tracking)
export const ppmPerformanceSnapshots = pgTable("ppm_performance_snapshots", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    projectId: varchar("project_id").notNull(),
    snapshotDate: timestamp("snapshot_date").default(sql`now()`),
    plannedValue: numeric("pv", { precision: 18, scale: 2 }).notNull(), // BAC * Time% (or manual)
    actualCost: numeric("ac", { precision: 18, scale: 2 }).notNull(), // Total Burdened Cost
    earnedValue: numeric("ev", { precision: 18, scale: 2 }).notNull(), // BAC * Progress%
    cpi: numeric("cpi", { precision: 10, scale: 4 }), // EV / AC
    spi: numeric("spi", { precision: 10, scale: 4 }), // EV / PV
    etc: numeric("etc", { precision: 18, scale: 2 }), // Estimate to Complete
    eac: numeric("eac", { precision: 18, scale: 2 }), // Estimate at Completion
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmPerformanceSnapshotSchema = createInsertSchema(ppmPerformanceSnapshots);
export type InsertPpmPerformanceSnapshot = z.infer<typeof insertPpmPerformanceSnapshotSchema>;
export type PpmPerformanceSnapshot = typeof ppmPerformanceSnapshots.$inferSelect;

// 11. Project Templates (Configuration L8)
export const ppmProjectTemplates = pgTable("ppm_project_templates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(),
    description: text("description"),
    projectType: varchar("project_type").notNull(),
    defaultBurdenScheduleId: varchar("default_burden_schedule_id"),
    activeFlag: boolean("active_flag").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmProjectTemplateSchema = createInsertSchema(ppmProjectTemplates);
export type InsertPpmProjectTemplate = z.infer<typeof insertPpmProjectTemplateSchema>;
export type PpmProjectTemplate = typeof ppmProjectTemplates.$inferSelect;

// 12. Bill Rate Schedules (Master Data L9)
export const ppmBillRateSchedules = pgTable("ppm_bill_rate_schedules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(), // e.g., "Standard Corporate Rates 2026"
    currencyCode: varchar("currency_code").default("USD"),
    description: text("description"),
    activeFlag: boolean("active_flag").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmBillRateScheduleSchema = createInsertSchema(ppmBillRateSchedules);
export type InsertPpmBillRateSchedule = z.infer<typeof insertPpmBillRateScheduleSchema>;
export type PpmBillRateSchedule = typeof ppmBillRateSchedules.$inferSelect;

// 13. Bill Rates (Master Data L9)
export const ppmBillRates = pgTable("ppm_bill_rates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    scheduleId: varchar("schedule_id").notNull(),
    personId: varchar("person_id"), // Optional: Employee specific rate
    jobTitle: varchar("job_title"),  // Optional: Role specific rate
    expenditureTypeId: varchar("expenditure_type_id"), // Optional: Non-labor rate
    rate: numeric("rate", { precision: 18, scale: 2 }).notNull(),
    startDate: timestamp("start_date").default(sql`now()`),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmBillRateSchema = createInsertSchema(ppmBillRates);
export type InsertPpmBillRate = z.infer<typeof insertPpmBillRateSchema>;
export type PpmBillRate = typeof ppmBillRates.$inferSelect;

// 14. Billing Rules (Contract Logic)
export const ppmBillingRules = pgTable("ppm_billing_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    projectId: varchar("project_id").notNull(),
    ruleType: varchar("rule_type").notNull(), // FIXED_PRICE, TM, COST_PLUS
    contractAmount: numeric("contract_amount", { precision: 18, scale: 2 }),
    markupPercentage: numeric("markup_percentage", { precision: 5, scale: 2 }),
    description: text("description"),
    activeFlag: boolean("active_flag").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmBillingRuleSchema = createInsertSchema(ppmBillingRules);
export type InsertPpmBillingRule = z.infer<typeof insertPpmBillingRuleSchema>;

// 15. Billing Events (Billable Milestones or T&M Summaries)
export const ppmBillingEvents = pgTable("ppm_billing_events", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    projectId: varchar("project_id").notNull(),
    taskId: varchar("task_id"), // Optional
    eventType: varchar("event_type").notNull(), // TM_ITEM, FIXED_MILESTONE, MANUAL
    eventDate: timestamp("event_date").default(sql`now()`),

    // Amounts
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    currency: varchar("currency").default("USD"),

    description: text("description"),

    // Links
    expenditureItemId: varchar("expenditure_item_id"), // If derived fromcost
    billingRuleId: varchar("billing_rule_id"),

    // Status
    billedFlag: boolean("billed_flag").default(false), // True if added to an invoice
    invoiceId: varchar("invoice_id"), // Link to Draft Invoice

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmBillingEventSchema = createInsertSchema(ppmBillingEvents);
export type InsertPpmBillingEvent = z.infer<typeof insertPpmBillingEventSchema>;
export type PpmBillingEvent = typeof ppmBillingEvents.$inferSelect;

// 16. Project Draft Invoices (Header)
export const ppmProjectInvoices = pgTable("ppm_project_invoices", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    invoiceNumber: varchar("invoice_number").notNull().unique(), // PROJ-INV-001
    projectId: varchar("project_id").notNull(),
    customerId: varchar("customer_id"), // Should link to AR Customer
    billToSiteId: varchar("bill_to_site_id"),

    invoiceDate: timestamp("invoice_date").notNull(),
    status: varchar("status").default("DRAFT"), // DRAFT, APPROVED, SUBMITTED, RELEASED

    amount: numeric("amount", { precision: 18, scale: 2 }).default("0"),
    currency: varchar("currency").default("USD"),

    // Integration
    arInvoiceId: varchar("ar_invoice_id"), // Link to Real AR Invoice
    transferStatus: varchar("transfer_status").default("PENDING"), // PENDING, TRANSFERRED, REJECTED
    transferDate: timestamp("transfer_date"),
    transferError: text("transfer_error"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmProjectInvoiceSchema = createInsertSchema(ppmProjectInvoices);
export type InsertPpmProjectInvoice = z.infer<typeof insertPpmProjectInvoiceSchema>;
export type PpmProjectInvoice = typeof ppmProjectInvoices.$inferSelect;

// 17. Project Draft Invoice Lines
export const ppmProjectInvoiceLines = pgTable("ppm_project_invoice_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    invoiceId: varchar("invoice_id").notNull(),
    lineNumber: integer("line_number").notNull(),

    eventId: varchar("event_id").notNull(), // Link to Billing Event

    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    description: text("description"),

    taxAmount: numeric("tax_amount", { precision: 18, scale: 2 }),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmProjectInvoiceLineSchema = createInsertSchema(ppmProjectInvoiceLines);
export type InsertPpmProjectInvoiceLine = z.infer<typeof insertPpmProjectInvoiceLineSchema>;
export type PpmProjectInvoiceLine = typeof ppmProjectInvoiceLines.$inferSelect;

// 18. Budgetary Control Rules (Funds Check Policy)
export const ppmControlRules = pgTable("ppm_control_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    projectId: varchar("project_id").notNull(),
    controlLevel: varchar("control_level").default("PROJECT"), // PROJECT, TASK, RESOURCE
    controlType: varchar("control_type").default("ADVISORY"), // ADVISORY, ABSOLUTE, TRACKING
    tolerancePercentage: numeric("tolerance_percentage", { precision: 5, scale: 2 }).default("0"),
    description: text("description"),
    activeFlag: boolean("active_flag").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmControlRuleSchema = createInsertSchema(ppmControlRules);
export type InsertPpmControlRule = z.infer<typeof insertPpmControlRuleSchema>;
export type PpmControlRule = typeof ppmControlRules.$inferSelect;

// 19. Budget Versions (Plan Headers)
export const ppmBudgetVersions = pgTable("ppm_budget_versions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    projectId: varchar("project_id").notNull(),
    versionName: varchar("version_name").notNull(), // "Original V1", "Working V2"
    versionType: varchar("version_type").default("Liabilities"), // COST, REVENUE
    status: varchar("status").default("DRAFT"), // DRAFT, BASELINED, HISTORICAL
    currentFlag: boolean("current_flag").default(false), // Is this the active plan?
    baselineDate: timestamp("baseline_date"),
    description: text("description"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmBudgetVersionSchema = createInsertSchema(ppmBudgetVersions);
export type InsertPpmBudgetVersion = z.infer<typeof insertPpmBudgetVersionSchema>;
export type PpmBudgetVersion = typeof ppmBudgetVersions.$inferSelect;

// 20. Budget Lines (Plan Details)
export const ppmBudgetLines = pgTable("ppm_budget_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    versionId: varchar("version_id").notNull(),
    taskId: varchar("task_id"), // Optional if Project Level
    periodName: varchar("period_name"), // "Jan-26"
    resourceId: varchar("resource_id"), // Optional
    currencyCode: varchar("currency_code").default("USD"),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(), // Planned Cost
    quantity: numeric("quantity", { precision: 18, scale: 2 }), // Planned Hours/Units
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPpmBudgetLineSchema = createInsertSchema(ppmBudgetLines);
export type InsertPpmBudgetLine = z.infer<typeof insertPpmBudgetLineSchema>;
export type PpmBudgetLine = typeof ppmBudgetLines.$inferSelect;

