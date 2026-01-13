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
