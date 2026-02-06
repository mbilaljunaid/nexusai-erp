"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertPlanAssetSchema = exports.insertPlanPositionSchema = exports.insertPlanDriverSchema = exports.insertPlanUnitSchema = exports.insertPlanVersionSchema = exports.insertPlanScenarioSchema = exports.insertBudgetSchema = exports.planProjectsRelations = exports.planUnitsRelations = exports.planVersionsRelations = exports.planScenariosRelations = exports.epmAudits = exports.planEsgMetrics = exports.planProducts = exports.planChannels = exports.planProjects = exports.planAssets = exports.planPositions = exports.planDrivers = exports.planUnits = exports.planDimensions = exports.planVersions = exports.planScenarios = exports.budgets = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const projects_ts_1 = require("./projects.ts"); // For PlanProject relation
// ========== EPM CORE ENTITIES ==========
// ... (imports are top, this is just to replace the top block)
// 1. Budgets (Existing)
exports.budgets = (0, pg_core_1.pgTable)("budgets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    departmentId: (0, pg_core_1.varchar)("department_id").notNull(),
    year: (0, pg_core_1.integer)("year").notNull(),
    quarter: (0, pg_core_1.integer)("quarter").notNull(),
    allocatedAmount: (0, pg_core_1.numeric)("allocated_amount", { precision: 18, scale: 2 }).notNull(),
    spentAmount: (0, pg_core_1.numeric)("spent_amount", { precision: 18, scale: 2 }).default("0"),
    reservedAmount: (0, pg_core_1.numeric)("reserved_amount", { precision: 18, scale: 2 }).default("0"),
    status: (0, pg_core_1.varchar)("status").default("draft"),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. Plan Scenarios (Existing)
exports.planScenarios = (0, pg_core_1.pgTable)("plan_scenarios", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    code: (0, pg_core_1.varchar)("code").notNull().unique(), // ACTUAL, BUDGET_2024
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    isSystem: (0, pg_core_1.boolean)("is_system").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. Plan Versions (Existing)
exports.planVersions = (0, pg_core_1.pgTable)("plan_versions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    code: (0, pg_core_1.varchar)("code").notNull(), // V1, FINAL
    name: (0, pg_core_1.varchar)("name").notNull(),
    scenarioId: (0, pg_core_1.varchar)("scenario_id").notNull().references(() => exports.planScenarios.id),
    isLocked: (0, pg_core_1.boolean)("is_locked").default(false),
    isFinal: (0, pg_core_1.boolean)("is_final").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 4. Plan Dimensions
exports.planDimensions = (0, pg_core_1.pgTable)("plan_dimensions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(), // Department, Region, Channel
    type: (0, pg_core_1.varchar)("type").notNull(), // STANDARD, ATTRIBUTE
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 5. Plan Units (Data Points)
exports.planUnits = (0, pg_core_1.pgTable)("plan_units", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    versionId: (0, pg_core_1.varchar)("version_id").notNull().references(() => exports.planVersions.id),
    period: (0, pg_core_1.varchar)("period").notNull(), // Jan-24
    account: (0, pg_core_1.varchar)("account").notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).default("0"),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    // Dimensions (Flexible columns or JSONB could be used, explicitly mapped for now)
    department: (0, pg_core_1.varchar)("department"),
    region: (0, pg_core_1.varchar)("region"),
    product: (0, pg_core_1.varchar)("product"),
    channel: (0, pg_core_1.varchar)("channel"),
    project: (0, pg_core_1.varchar)("project"),
    status: (0, pg_core_1.varchar)("status").default("draft"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 6. Plan Drivers
exports.planDrivers = (0, pg_core_1.pgTable)("plan_drivers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    type: (0, pg_core_1.varchar)("type").notNull(), // GROWTH_RATE, HEADCOUNT
    value: (0, pg_core_1.numeric)("value", { precision: 18, scale: 4 }),
    versionId: (0, pg_core_1.varchar)("version_id").references(() => exports.planVersions.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 7. Plan Positions (Workforce Planning)
exports.planPositions = (0, pg_core_1.pgTable)("plan_positions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    versionId: (0, pg_core_1.varchar)("version_id").notNull().references(() => exports.planVersions.id),
    jobTitle: (0, pg_core_1.varchar)("job_title").notNull(),
    department: (0, pg_core_1.varchar)("department"),
    headcount: (0, pg_core_1.integer)("headcount").default(1),
    salary: (0, pg_core_1.numeric)("salary", { precision: 18, scale: 2 }),
    startDate: (0, pg_core_1.date)("start_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 8. Plan Assets (CapEx)
exports.planAssets = (0, pg_core_1.pgTable)("plan_assets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    versionId: (0, pg_core_1.varchar)("version_id").notNull().references(() => exports.planVersions.id),
    name: (0, pg_core_1.varchar)("name").notNull(),
    category: (0, pg_core_1.varchar)("category"),
    cost: (0, pg_core_1.numeric)("cost", { precision: 18, scale: 2 }),
    purchaseDate: (0, pg_core_1.date)("purchase_date"),
    usefulLife: (0, pg_core_1.integer)("useful_life"), // Months
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 9. PlanProjects
exports.planProjects = (0, pg_core_1.pgTable)("plan_projects", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    versionId: (0, pg_core_1.varchar)("version_id").notNull().references(() => exports.planVersions.id),
    code: (0, pg_core_1.varchar)("code").unique(), // Added to match Entity
    name: (0, pg_core_1.varchar)("name"), // Added
    description: (0, pg_core_1.text)("description"), // Added
    isActive: (0, pg_core_1.boolean)("is_active").default(true), // Added
    erpProjectId: (0, pg_core_1.varchar)("erp_project_id"), // Added link
    projectId: (0, pg_core_1.varchar)("project_id").references(() => projects_ts_1.projects2.id), // Cross-module (existing)
    plannedStart: (0, pg_core_1.date)("planned_start"),
    plannedEnd: (0, pg_core_1.date)("planned_end"),
    plannedBudget: (0, pg_core_1.numeric)("planned_budget", { precision: 18, scale: 2 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 10. Plan Channels
exports.planChannels = (0, pg_core_1.pgTable)("plan_channels", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    code: (0, pg_core_1.varchar)("code").notNull().unique(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
});
// 11. Plan Products
exports.planProducts = (0, pg_core_1.pgTable)("plan_products", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    sku: (0, pg_core_1.varchar)("sku").notNull().unique(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    family: (0, pg_core_1.varchar)("family"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
});
// 12. Plan ESG Metrics
exports.planEsgMetrics = (0, pg_core_1.pgTable)("plan_esg_metrics", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    versionId: (0, pg_core_1.varchar)("version_id").notNull().references(() => exports.planVersions.id),
    metricName: (0, pg_core_1.varchar)("metric_name").notNull(), // Carbon, Water
    targetValue: (0, pg_core_1.numeric)("target_value", { precision: 18, scale: 4 }),
    uom: (0, pg_core_1.varchar)("uom"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 13. EPM Audits
exports.epmAudits = (0, pg_core_1.pgTable)("epm_audits", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    entityType: (0, pg_core_1.varchar)("entity_type").notNull(),
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(),
    action: (0, pg_core_1.varchar)("action").notNull(),
    changedBy: (0, pg_core_1.varchar)("changed_by").notNull(),
    changes: (0, pg_core_1.jsonb)("changes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ========== RELATIONS ==========
exports.planScenariosRelations = (0, drizzle_orm_1.relations)(exports.planScenarios, ({ many }) => ({
    versions: many(exports.planVersions),
}));
exports.planVersionsRelations = (0, drizzle_orm_1.relations)(exports.planVersions, ({ one, many }) => ({
    scenario: one(exports.planScenarios, {
        fields: [exports.planVersions.scenarioId],
        references: [exports.planScenarios.id],
    }),
    units: many(exports.planUnits),
    drivers: many(exports.planDrivers),
    positions: many(exports.planPositions),
    assets: many(exports.planAssets),
    projects: many(exports.planProjects),
    esgMetrics: many(exports.planEsgMetrics),
}));
exports.planUnitsRelations = (0, drizzle_orm_1.relations)(exports.planUnits, ({ one }) => ({
    version: one(exports.planVersions, {
        fields: [exports.planUnits.versionId],
        references: [exports.planVersions.id],
    }),
}));
exports.planProjectsRelations = (0, drizzle_orm_1.relations)(exports.planProjects, ({ one }) => ({
    version: one(exports.planVersions, {
        fields: [exports.planProjects.versionId],
        references: [exports.planVersions.id],
    }),
    project: one(projects_ts_1.projects2, {
        fields: [exports.planProjects.projectId],
        references: [projects_ts_1.projects2.id],
    }),
}));
// Zod Schemas
exports.insertBudgetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.budgets);
exports.insertPlanScenarioSchema = (0, drizzle_zod_1.createInsertSchema)(exports.planScenarios);
exports.insertPlanVersionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.planVersions);
exports.insertPlanUnitSchema = (0, drizzle_zod_1.createInsertSchema)(exports.planUnits);
exports.insertPlanDriverSchema = (0, drizzle_zod_1.createInsertSchema)(exports.planDrivers);
exports.insertPlanPositionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.planPositions);
exports.insertPlanAssetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.planAssets);
//# sourceMappingURL=epm.js.map