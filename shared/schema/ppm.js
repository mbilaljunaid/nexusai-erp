"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertPpmBudgetLineSchema = exports.ppmBudgetLines = exports.insertPpmBudgetVersionSchema = exports.ppmBudgetVersions = exports.insertPpmControlRuleSchema = exports.ppmControlRules = exports.insertPpmProjectInvoiceLineSchema = exports.ppmProjectInvoiceLines = exports.insertPpmProjectInvoiceSchema = exports.ppmProjectInvoices = exports.insertPpmBillingEventSchema = exports.ppmBillingEvents = exports.insertPpmBillingRuleSchema = exports.ppmBillingRules = exports.insertPpmBillRateSchema = exports.ppmBillRates = exports.insertPpmBillRateScheduleSchema = exports.ppmBillRateSchedules = exports.insertPpmProjectTemplateSchema = exports.ppmProjectTemplates = exports.insertPpmPerformanceSnapshotSchema = exports.ppmPerformanceSnapshots = exports.insertPpmAssetLineSchema = exports.ppmAssetLines = exports.insertPpmProjectAssetSchema = exports.ppmProjectAssets = exports.insertPpmBurdenRuleSchema = exports.ppmBurdenRules = exports.insertPpmBurdenScheduleSchema = exports.ppmBurdenSchedules = exports.insertPpmCostDistributionSchema = exports.ppmCostDistributions = exports.insertPpmExpenditureItemSchema = exports.ppmExpenditureItems = exports.insertPpmExpenditureTypeSchema = exports.ppmExpenditureTypes = exports.insertPpmTaskSchema = exports.ppmTasks = exports.insertPpmProjectSchema = exports.ppmProjects = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// ========== PROJECT PORTFOLIO MANAGEMENT (PPM) SUBLEDGER ==========
// 1. Projects (Financial Header)
exports.ppmProjects = (0, pg_core_1.pgTable)("ppm_projects", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    projectNumber: (0, pg_core_1.varchar)("project_number").notNull().unique(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    projectType: (0, pg_core_1.varchar)("project_type").notNull(), // CAPITAL, INDIRECT, CONTRACT
    organizationId: (0, pg_core_1.varchar)("organization_id"), // Linked to Cost Organization
    currencyCode: (0, pg_core_1.varchar)("currency_code").notNull().default("USD"),
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, ACTIVE, CLOSED
    burdenScheduleId: (0, pg_core_1.varchar)("burden_schedule_id"), // Default schedule for project
    budget: (0, pg_core_1.numeric)("budget", { precision: 18, scale: 2 }).default("0.00"), // Planned Value (BAC)
    percentComplete: (0, pg_core_1.numeric)("percent_complete", { precision: 5, scale: 2 }).default("0.00"), // For EV calculation
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmProjectSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmProjects);
// 2. Tasks (Financial WBS)
exports.ppmTasks = (0, pg_core_1.pgTable)("ppm_tasks", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    projectId: (0, pg_core_1.varchar)("project_id").notNull(),
    parentTaskId: (0, pg_core_1.varchar)("parent_task_id"), // For hierarchy
    taskNumber: (0, pg_core_1.varchar)("task_number").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    billableFlag: (0, pg_core_1.boolean)("billable_flag").default(false),
    chargeableFlag: (0, pg_core_1.boolean)("chargeable_flag").default(true),
    capitalizableFlag: (0, pg_core_1.boolean)("capitalizable_flag").default(false),
    burdenScheduleId: (0, pg_core_1.varchar)("burden_schedule_id"), // Task-specific override
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmTaskSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmTasks);
// 3. Expenditure Types
exports.ppmExpenditureTypes = (0, pg_core_1.pgTable)("ppm_expenditure_types", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(), // e.g., Professional Services, IT Equipment, Travel
    unitOfMeasure: (0, pg_core_1.varchar)("uom").notNull(), // Hours, Currency, Each
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmExpenditureTypeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmExpenditureTypes);
// 4. Expenditure Items (Atomic Transactions)
exports.ppmExpenditureItems = (0, pg_core_1.pgTable)("ppm_expenditure_items", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    taskId: (0, pg_core_1.varchar)("task_id").notNull(),
    expenditureTypeId: (0, pg_core_1.varchar)("expenditure_type_id").notNull(),
    expenditureItemDate: (0, pg_core_1.timestamp)("exp_item_date").notNull(),
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 2 }).notNull(),
    unitCost: (0, pg_core_1.numeric)("unit_cost", { precision: 18, scale: 4 }),
    rawCost: (0, pg_core_1.numeric)("raw_cost", { precision: 18, scale: 4 }).notNull(),
    burdenedCost: (0, pg_core_1.numeric)("burdened_cost", { precision: 18, scale: 4 }), // Post-burden calculation
    status: (0, pg_core_1.varchar)("status").default("UNCOSTED"), // UNCOSTED, COSTED, DISTRIBUTED
    transactionSource: (0, pg_core_1.varchar)("transaction_source").notNull(), // AP, TIME, PO, MANUAL
    transactionReference: (0, pg_core_1.varchar)("transaction_reference"), // e.g., Invoice ID
    denomCurrencyCode: (0, pg_core_1.varchar)("denom_currency_code").notNull().default("USD"),
    denomRawCost: (0, pg_core_1.numeric)("denom_raw_cost", { precision: 18, scale: 4 }),
    capitalizationStatus: (0, pg_core_1.varchar)("cap_status").default("NOT_APPLICABLE"), // CIP, CAPITALIZED, NOT_APPLICABLE
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmExpenditureItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmExpenditureItems);
// 5. Cost Distributions (Accounting)
exports.ppmCostDistributions = (0, pg_core_1.pgTable)("ppm_cost_distributions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    expenditureItemId: (0, pg_core_1.varchar)("expenditure_item_id").notNull(),
    drCodeCombinationId: (0, pg_core_1.varchar)("dr_ccid").notNull(), // The project/task charge account
    crCodeCombinationId: (0, pg_core_1.varchar)("cr_ccid").notNull(), // The offset/accrual account
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    accountingPeriodId: (0, pg_core_1.varchar)("accounting_period_id"),
    glJournalId: (0, pg_core_1.varchar)("gl_journal_id"), // Link to posted GL journal
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, POSTED
    lineType: (0, pg_core_1.varchar)("line_type").default("RAW"), // RAW, BURDENED
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmCostDistributionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmCostDistributions);
// 6. Burden Schedules (Header)
exports.ppmBurdenSchedules = (0, pg_core_1.pgTable)("ppm_burden_schedules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    version: (0, pg_core_1.varchar)("version").default("1.0"),
    activeFlag: (0, pg_core_1.boolean)("active_flag").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmBurdenScheduleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmBurdenSchedules);
// 7. Burden Multipliers (Rules)
exports.ppmBurdenRules = (0, pg_core_1.pgTable)("ppm_burden_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    scheduleId: (0, pg_core_1.varchar)("schedule_id").notNull(),
    expenditureTypeId: (0, pg_core_1.varchar)("expenditure_type_id").notNull(),
    multiplier: (0, pg_core_1.numeric)("multiplier", { precision: 18, scale: 4 }).notNull(), // e.g., 0.20 for 20%
    precedence: (0, pg_core_1.integer)("precedence").default(1),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmBurdenRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmBurdenRules);
// 8. Project Assets (Integration with Fixed Assets)
exports.ppmProjectAssets = (0, pg_core_1.pgTable)("ppm_project_assets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    projectId: (0, pg_core_1.varchar)("project_id").notNull(),
    assetName: (0, pg_core_1.varchar)("asset_name").notNull(),
    assetDescription: (0, pg_core_1.text)("asset_description"),
    assetNumber: (0, pg_core_1.varchar)("asset_number"), // Assigned after interface to FA
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, INF-PENDING, INTERFACED
    faAssetId: (0, pg_core_1.varchar)("fa_asset_id"), // Linked to fa_assets table
    assetType: (0, pg_core_1.varchar)("asset_type").default("EQUIPMENT"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmProjectAssetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmProjectAssets);
// 9. Asset Lines (Cost Grouping)
exports.ppmAssetLines = (0, pg_core_1.pgTable)("ppm_asset_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    projectAssetId: (0, pg_core_1.varchar)("project_asset_id").notNull(),
    expenditureItemId: (0, pg_core_1.varchar)("expenditure_item_id").unique().notNull(), // One exp item belongs to one asset line
    capitalizedAmount: (0, pg_core_1.numeric)("capitalized_amount", { precision: 18, scale: 2 }).notNull(),
    status: (0, pg_core_1.varchar)("status").default("NEW"), // NEW, INTERFACED
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmAssetLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmAssetLines);
// 10. Performance Snapshots (EVM Tracking)
exports.ppmPerformanceSnapshots = (0, pg_core_1.pgTable)("ppm_performance_snapshots", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    projectId: (0, pg_core_1.varchar)("project_id").notNull(),
    snapshotDate: (0, pg_core_1.timestamp)("snapshot_date").default((0, drizzle_orm_1.sql) `now()`),
    plannedValue: (0, pg_core_1.numeric)("pv", { precision: 18, scale: 2 }).notNull(), // BAC * Time% (or manual)
    actualCost: (0, pg_core_1.numeric)("ac", { precision: 18, scale: 2 }).notNull(), // Total Burdened Cost
    earnedValue: (0, pg_core_1.numeric)("ev", { precision: 18, scale: 2 }).notNull(), // BAC * Progress%
    cpi: (0, pg_core_1.numeric)("cpi", { precision: 10, scale: 4 }), // EV / AC
    spi: (0, pg_core_1.numeric)("spi", { precision: 10, scale: 4 }), // EV / PV
    etc: (0, pg_core_1.numeric)("etc", { precision: 18, scale: 2 }), // Estimate to Complete
    eac: (0, pg_core_1.numeric)("eac", { precision: 18, scale: 2 }), // Estimate at Completion
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmPerformanceSnapshotSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmPerformanceSnapshots);
// 11. Project Templates (Configuration L8)
exports.ppmProjectTemplates = (0, pg_core_1.pgTable)("ppm_project_templates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    projectType: (0, pg_core_1.varchar)("project_type").notNull(),
    defaultBurdenScheduleId: (0, pg_core_1.varchar)("default_burden_schedule_id"),
    activeFlag: (0, pg_core_1.boolean)("active_flag").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmProjectTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmProjectTemplates);
// 12. Bill Rate Schedules (Master Data L9)
exports.ppmBillRateSchedules = (0, pg_core_1.pgTable)("ppm_bill_rate_schedules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(), // e.g., "Standard Corporate Rates 2026"
    currencyCode: (0, pg_core_1.varchar)("currency_code").default("USD"),
    description: (0, pg_core_1.text)("description"),
    activeFlag: (0, pg_core_1.boolean)("active_flag").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmBillRateScheduleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmBillRateSchedules);
// 13. Bill Rates (Master Data L9)
exports.ppmBillRates = (0, pg_core_1.pgTable)("ppm_bill_rates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    scheduleId: (0, pg_core_1.varchar)("schedule_id").notNull(),
    personId: (0, pg_core_1.varchar)("person_id"), // Optional: Employee specific rate
    jobTitle: (0, pg_core_1.varchar)("job_title"), // Optional: Role specific rate
    expenditureTypeId: (0, pg_core_1.varchar)("expenditure_type_id"), // Optional: Non-labor rate
    rate: (0, pg_core_1.numeric)("rate", { precision: 18, scale: 2 }).notNull(),
    startDate: (0, pg_core_1.timestamp)("start_date").default((0, drizzle_orm_1.sql) `now()`),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmBillRateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmBillRates);
// 14. Billing Rules (Contract Logic)
exports.ppmBillingRules = (0, pg_core_1.pgTable)("ppm_billing_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    projectId: (0, pg_core_1.varchar)("project_id").notNull(),
    ruleType: (0, pg_core_1.varchar)("rule_type").notNull(), // FIXED_PRICE, TM, COST_PLUS
    contractAmount: (0, pg_core_1.numeric)("contract_amount", { precision: 18, scale: 2 }),
    markupPercentage: (0, pg_core_1.numeric)("markup_percentage", { precision: 5, scale: 2 }),
    description: (0, pg_core_1.text)("description"),
    activeFlag: (0, pg_core_1.boolean)("active_flag").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmBillingRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmBillingRules);
// 15. Billing Events (Billable Milestones or T&M Summaries)
exports.ppmBillingEvents = (0, pg_core_1.pgTable)("ppm_billing_events", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    projectId: (0, pg_core_1.varchar)("project_id").notNull(),
    taskId: (0, pg_core_1.varchar)("task_id"), // Optional
    eventType: (0, pg_core_1.varchar)("event_type").notNull(), // TM_ITEM, FIXED_MILESTONE, MANUAL
    eventDate: (0, pg_core_1.timestamp)("event_date").default((0, drizzle_orm_1.sql) `now()`),
    // Amounts
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    description: (0, pg_core_1.text)("description"),
    // Links
    expenditureItemId: (0, pg_core_1.varchar)("expenditure_item_id"), // If derived fromcost
    billingRuleId: (0, pg_core_1.varchar)("billing_rule_id"),
    // Status
    billedFlag: (0, pg_core_1.boolean)("billed_flag").default(false), // True if added to an invoice
    invoiceId: (0, pg_core_1.varchar)("invoice_id"), // Link to Draft Invoice
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmBillingEventSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmBillingEvents);
// 16. Project Draft Invoices (Header)
exports.ppmProjectInvoices = (0, pg_core_1.pgTable)("ppm_project_invoices", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    invoiceNumber: (0, pg_core_1.varchar)("invoice_number").notNull().unique(), // PROJ-INV-001
    projectId: (0, pg_core_1.varchar)("project_id").notNull(),
    customerId: (0, pg_core_1.varchar)("customer_id"), // Should link to AR Customer
    billToSiteId: (0, pg_core_1.varchar)("bill_to_site_id"),
    invoiceDate: (0, pg_core_1.timestamp)("invoice_date").notNull(),
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, APPROVED, SUBMITTED, RELEASED
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).default("0"),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    // Integration
    arInvoiceId: (0, pg_core_1.varchar)("ar_invoice_id"), // Link to Real AR Invoice
    transferStatus: (0, pg_core_1.varchar)("transfer_status").default("PENDING"), // PENDING, TRANSFERRED, REJECTED
    transferDate: (0, pg_core_1.timestamp)("transfer_date"),
    transferError: (0, pg_core_1.text)("transfer_error"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmProjectInvoiceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmProjectInvoices);
// 17. Project Draft Invoice Lines
exports.ppmProjectInvoiceLines = (0, pg_core_1.pgTable)("ppm_project_invoice_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    invoiceId: (0, pg_core_1.varchar)("invoice_id").notNull(),
    lineNumber: (0, pg_core_1.integer)("line_number").notNull(),
    eventId: (0, pg_core_1.varchar)("event_id").notNull(), // Link to Billing Event
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    taxAmount: (0, pg_core_1.numeric)("tax_amount", { precision: 18, scale: 2 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmProjectInvoiceLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmProjectInvoiceLines);
// 18. Budgetary Control Rules (Funds Check Policy)
exports.ppmControlRules = (0, pg_core_1.pgTable)("ppm_control_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    projectId: (0, pg_core_1.varchar)("project_id").notNull(),
    controlLevel: (0, pg_core_1.varchar)("control_level").default("PROJECT"), // PROJECT, TASK, RESOURCE
    controlType: (0, pg_core_1.varchar)("control_type").default("ADVISORY"), // ADVISORY, ABSOLUTE, TRACKING
    tolerancePercentage: (0, pg_core_1.numeric)("tolerance_percentage", { precision: 5, scale: 2 }).default("0"),
    description: (0, pg_core_1.text)("description"),
    activeFlag: (0, pg_core_1.boolean)("active_flag").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmControlRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmControlRules);
// 19. Budget Versions (Plan Headers)
exports.ppmBudgetVersions = (0, pg_core_1.pgTable)("ppm_budget_versions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    projectId: (0, pg_core_1.varchar)("project_id").notNull(),
    versionName: (0, pg_core_1.varchar)("version_name").notNull(), // "Original V1", "Working V2"
    versionType: (0, pg_core_1.varchar)("version_type").default("Liabilities"), // COST, REVENUE
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, BASELINED, HISTORICAL
    currentFlag: (0, pg_core_1.boolean)("current_flag").default(false), // Is this the active plan?
    baselineDate: (0, pg_core_1.timestamp)("baseline_date"),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmBudgetVersionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmBudgetVersions);
// 20. Budget Lines (Plan Details)
exports.ppmBudgetLines = (0, pg_core_1.pgTable)("ppm_budget_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    versionId: (0, pg_core_1.varchar)("version_id").notNull(),
    taskId: (0, pg_core_1.varchar)("task_id"), // Optional if Project Level
    periodName: (0, pg_core_1.varchar)("period_name"), // "Jan-26"
    resourceId: (0, pg_core_1.varchar)("resource_id"), // Optional
    currencyCode: (0, pg_core_1.varchar)("currency_code").default("USD"),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(), // Planned Cost
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 2 }), // Planned Hours/Units
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPpmBudgetLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ppmBudgetLines);
//# sourceMappingURL=ppm.js.map