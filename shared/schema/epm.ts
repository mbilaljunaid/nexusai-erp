import { pgTable, varchar, text, timestamp, numeric, boolean, jsonb, integer, date, uuid } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { projects2 } from "./projects"; // For PlanProject relation

// ========== EPM CORE ENTITIES ==========
// ... (imports are top, this is just to replace the top block)


// 1. Budgets (Existing)
export const budgets = pgTable("budgets", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    departmentId: varchar("department_id").notNull(),
    year: integer("year").notNull(),
    quarter: integer("quarter").notNull(),
    allocatedAmount: numeric("allocated_amount", { precision: 18, scale: 2 }).notNull(),
    spentAmount: numeric("spent_amount", { precision: 18, scale: 2 }).default("0"),
    reservedAmount: numeric("reserved_amount", { precision: 18, scale: 2 }).default("0"),
    status: varchar("status").default("draft"),
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
    entLedgerId: varchar("ent_ledger_id"),
});

// 2. Plan Scenarios (Existing)
export const planScenarios = pgTable("plan_scenarios", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    code: varchar("code").notNull().unique(), // ACTUAL, BUDGET_2024
    name: varchar("name").notNull(),
    description: text("description"),
    isSystem: boolean("is_system").default(false),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
    entLedgerId: varchar("ent_ledger_id"),
});

// 3. Plan Versions (Existing)
export const planVersions = pgTable("plan_versions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    code: varchar("code").notNull(), // V1, FINAL
    name: varchar("name").notNull(),
    scenarioId: varchar("scenario_id").notNull().references(() => planScenarios.id),
    isLocked: boolean("is_locked").default(false),
    isFinal: boolean("is_final").default(false),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
    entLedgerId: varchar("ent_ledger_id"),
});

// 4. Plan Dimensions
export const planDimensions = pgTable("plan_dimensions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(), // Department, Region, Channel
    type: varchar("type").notNull(), // STANDARD, ATTRIBUTE
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 5. Plan Units (Data Points)
export const planUnits = pgTable("plan_units", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    versionId: varchar("version_id").notNull().references(() => planVersions.id),
    period: varchar("period").notNull(), // Jan-24
    entityId: varchar("entity_id"), // Added missing dimension
    account: varchar("account").notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).default("0"),
    currency: varchar("currency").default("USD"),

    // Dimensions (Flexible columns or JSONB could be used, explicitly mapped for now)
    department: varchar("department"),
    region: varchar("region"),
    product: varchar("product"),
    channel: varchar("channel"),
    project: varchar("project"),

    status: varchar("status").default("draft"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
    entLedgerId: varchar("ent_ledger_id"),
});

// 6. Plan Drivers
export const planDrivers = pgTable("plan_drivers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    type: varchar("type").notNull(), // GROWTH_RATE, HEADCOUNT
    value: numeric("value", { precision: 18, scale: 4 }),
    versionId: varchar("version_id").references(() => planVersions.id),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 7. Plan Positions (Workforce Planning)
export const planPositions = pgTable("plan_positions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    versionId: varchar("version_id").notNull().references(() => planVersions.id),
    jobTitle: varchar("job_title").notNull(),
    department: varchar("department"),
    headcount: integer("headcount").default(1),
    salary: numeric("salary", { precision: 18, scale: 2 }),
    startDate: date("start_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 8. Plan Assets (CapEx)
export const planAssets = pgTable("plan_assets", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    versionId: varchar("version_id").notNull().references(() => planVersions.id),
    name: varchar("name").notNull(),
    category: varchar("category"),
    cost: numeric("cost", { precision: 18, scale: 2 }),
    purchaseDate: date("purchase_date"),
    usefulLife: integer("useful_life"), // Months
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 9. PlanProjects
export const planProjects = pgTable("plan_projects", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    versionId: varchar("version_id").notNull().references(() => planVersions.id),
    code: varchar("code").unique(), // Added to match Entity
    name: varchar("name"), // Added
    description: text("description"), // Added
    isActive: boolean("is_active").default(true), // Added
    erpProjectId: varchar("erp_project_id"), // Added link
    projectId: varchar("project_id").references(() => projects2.id), // Cross-module (existing)
    plannedStart: date("planned_start"),
    plannedEnd: date("planned_end"),
    plannedBudget: numeric("planned_budget", { precision: 18, scale: 2 }),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 10. Plan Channels
export const planChannels = pgTable("plan_channels", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    code: varchar("code").notNull().unique(),
    name: varchar("name").notNull(),
    isActive: boolean("is_active").default(true),
});

// 11. Plan Products
export const planProducts = pgTable("plan_products", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    sku: varchar("sku").notNull().unique(),
    name: varchar("name").notNull(),
    family: varchar("family"),
    listPrice: numeric("list_price", { precision: 18, scale: 2 }),
    standardCost: numeric("standard_cost", { precision: 18, scale: 2 }),
    isActive: boolean("is_active").default(true),
});

// 12. Plan ESG Metrics
export const planEsgMetrics = pgTable("plan_esg_metrics", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    versionId: varchar("version_id").notNull().references(() => planVersions.id),
    metricCode: varchar("metric_code").notNull(), // Carbon, Water
    period: varchar("period").notNull(),
    entityId: varchar("entity_id").notNull(),
    value: numeric("value", { precision: 18, scale: 4 }),
    targetValue: numeric("target_value", { precision: 18, scale: 4 }),
    uom: varchar("uom"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 13. EPM Audits
export const epmAudits = pgTable("epm_audits", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entityType: varchar("entity_type").notNull(),
    entityId: varchar("entity_id").notNull(),
    action: varchar("action").notNull(),
    changedBy: varchar("changed_by").notNull(),
    changes: jsonb("changes"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 14. EPM Supplier Emission Surveys (Phase 34)
export const epmSupplierEmissionSurveys = pgTable("epm_supplier_emission_surveys", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    title: varchar("title").notNull(),
    year: integer("year").notNull(),
    status: varchar("status").default("Draft"), // Draft, Active, Closed
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const epmSurveyResponses = pgTable("epm_survey_responses", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    surveyId: varchar("survey_id").references(() => epmSupplierEmissionSurveys.id).notNull(),
    supplierId: varchar("supplier_id").notNull(), // Should link to TCA Organizations
    supplierName: varchar("supplier_name").notNull(),
    status: varchar("status").default("Pending"), // Pending, In Progress, Submitted

    // Core Emission Data (Scope 1 & 2 of the supplier roll up to our Scope 3)
    scope1Emissions: numeric("scope_1_emissions", { precision: 18, scale: 4 }).default("0"),
    scope2Emissions: numeric("scope_2_emissions", { precision: 18, scale: 4 }).default("0"),
    totalEmissions: numeric("total_emissions", { precision: 18, scale: 4 }).default("0"), // Calculated

    // Additional disclosures
    hasReductionTarget: boolean("has_reduction_target").default(false),
    targetYear: integer("target_year"),
    reductionPercentage: numeric("reduction_percentage", { precision: 5, scale: 2 }),

    submittedAt: timestamp("submitted_at"),
});

// ============================================
// PHASE 7 GAP: STRATEGIC & CAPEX MODELING
// ============================================

export const epmStrategicModels = pgTable("epm_strategic_models", {
    id: uuid("id").primaryKey().defaultRandom(),
    entBusinessUnitId: uuid("ent_business_unit_id"),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    timeHorizonYears: integer("time_horizon_years").default(5),
    baseYear: integer("base_year").notNull(),
    status: varchar("status", { length: 50 }).notNull().default('Draft'), // Draft, Active, Archived
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const epmCapexAssets = pgTable("epm_capex_assets", {
    id: uuid("id").primaryKey().defaultRandom(),
    modelId: uuid("model_id").references(() => epmStrategicModels.id),
    assetName: varchar("asset_name", { length: 255 }).notNull(),
    assetCategory: varchar("asset_category", { length: 100 }).notNull(), // e.g., IT Equipment, Machinery, Buildings
    purchasePrice: numeric("purchase_price", { precision: 15, scale: 2 }).notNull(),
    usefulLifeYears: integer("useful_life_years").notNull(),
    salvageValue: numeric("salvage_value", { precision: 15, scale: 2 }).default("0"),
    purchaseDate: timestamp("purchase_date").notNull(),
    depreciationMethod: varchar("depreciation_method", { length: 50 }).default('Straight Line'), // Straight Line, Declining Balance
    createdAt: timestamp("created_at").defaultNow(),
});

export const insertEpmSupplierEmissionSurveySchema = createInsertSchema(epmSupplierEmissionSurveys);
export const insertEpmSurveyResponseSchema = createInsertSchema(epmSurveyResponses).extend({
    scope1Emissions: z.number().or(z.string().transform(v => Number(v))).optional(),
    scope2Emissions: z.number().or(z.string().transform(v => Number(v))).optional(),
    reductionPercentage: z.number().or(z.string().transform(v => Number(v))).optional(),
});

export type EpmSupplierEmissionSurvey = typeof epmSupplierEmissionSurveys.$inferSelect;
export type InsertEpmSupplierEmissionSurvey = z.infer<typeof insertEpmSupplierEmissionSurveySchema>;

export type EpmSurveyResponse = typeof epmSurveyResponses.$inferSelect;
export type InsertEpmSurveyResponse = z.infer<typeof insertEpmSurveyResponseSchema>;

// ========== RELATIONS ==========

export const planScenariosRelations = relations(planScenarios, ({ many }) => ({
    versions: many(planVersions),
}));

export const planVersionsRelations = relations(planVersions, ({ one, many }) => ({
    scenario: one(planScenarios, {
        fields: [planVersions.scenarioId],
        references: [planScenarios.id],
    }),
    units: many(planUnits),
    drivers: many(planDrivers),
    positions: many(planPositions),
    assets: many(planAssets),
    projects: many(planProjects),
    esgMetrics: many(planEsgMetrics),
}));

export const planUnitsRelations = relations(planUnits, ({ one }) => ({
    version: one(planVersions, {
        fields: [planUnits.versionId],
        references: [planVersions.id],
    }),
}));

export const planProjectsRelations = relations(planProjects, ({ one }) => ({
    version: one(planVersions, {
        fields: [planProjects.versionId],
        references: [planVersions.id],
    }),
    project: one(projects2, {
        fields: [planProjects.projectId],
        references: [projects2.id],
    }),
}));

// Zod Schemas
export const insertBudgetSchema = createInsertSchema(budgets);
export const insertPlanScenarioSchema = createInsertSchema(planScenarios);
export const insertPlanVersionSchema = createInsertSchema(planVersions);
export const insertPlanUnitSchema = createInsertSchema(planUnits);
export const insertPlanDriverSchema = createInsertSchema(planDrivers);
export const insertPlanPositionSchema = createInsertSchema(planPositions);
export const insertPlanAssetSchema = createInsertSchema(planAssets);

export type Budget = typeof budgets.$inferSelect;
export type PlanScenario = typeof planScenarios.$inferSelect;
export type PlanVersion = typeof planVersions.$inferSelect;
export type PlanUnit = typeof planUnits.$inferSelect;

// Legacy Aliases
export type Scenario = PlanScenario;
export type InsertScenario = z.infer<typeof insertPlanScenarioSchema>;
export type ScenarioVariable = any; // Placeholder if variable schema is missing
export type InsertScenarioVariable = any;
