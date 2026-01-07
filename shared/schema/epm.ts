import { pgTable, varchar, text, timestamp, numeric, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== FINANCIAL FORECASTING & EPM ==========
export const revenueForecasts = pgTable("revenue_forecasts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    period: varchar("period").notNull(), // monthly, quarterly, yearly
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    forecastAmount: numeric("forecast_amount", { precision: 18, scale: 2 }),
    actualAmount: numeric("actual_amount", { precision: 18, scale: 2 }),
    variance: numeric("variance", { precision: 18, scale: 2 }),
    status: varchar("status").default("draft"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertRevenueForecastSchema = createInsertSchema(revenueForecasts).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    name: z.string().min(1),
    period: z.string().min(1),
    startDate: z.date(),
    endDate: z.date(),
    forecastAmount: z.string().optional(),
    actualAmount: z.string().optional(),
    variance: z.string().optional(),
    status: z.string().optional(),
});

export type InsertRevenueForecast = z.infer<typeof insertRevenueForecastSchema>;
export type RevenueForecast = typeof revenueForecasts.$inferSelect;

export const budgetAllocations = pgTable("budget_allocations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    department: varchar("department"),
    category: varchar("category"),
    fiscalYear: varchar("fiscal_year"),
    allocatedAmount: numeric("allocated_amount", { precision: 18, scale: 2 }),
    spentAmount: numeric("spent_amount", { precision: 18, scale: 2 }).default("0"),
    remainingAmount: numeric("remaining_amount", { precision: 18, scale: 2 }),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertBudgetAllocationSchema = createInsertSchema(budgetAllocations).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    name: z.string().min(1),
    department: z.string().optional(),
    category: z.string().optional(),
    fiscalYear: z.string().optional(),
    allocatedAmount: z.string().optional(),
    spentAmount: z.string().optional(),
    remainingAmount: z.string().optional(),
    status: z.string().optional(),
});

export type InsertBudgetAllocation = z.infer<typeof insertBudgetAllocationSchema>;
export type BudgetAllocation = typeof budgetAllocations.$inferSelect;

export const forecastModels = pgTable("forecast_models", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    type: varchar("type").notNull(), // linear, exponential, arima, ml
    parameters: jsonb("parameters"),
    accuracy: numeric("accuracy", { precision: 5, scale: 2 }),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertForecastModelSchema = createInsertSchema(forecastModels).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    name: z.string().min(1),
    type: z.string().min(1),
    parameters: z.record(z.any()).optional(),
    accuracy: z.string().optional(),
    isActive: z.boolean().optional(),
});

export type InsertForecastModel = z.infer<typeof insertForecastModelSchema>;
export type ForecastModel = typeof forecastModels.$inferSelect;

// ========== SCENARIOS & PLANNING ==========
export const scenarios = pgTable("scenarios", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    type: varchar("type"), // best_case, worst_case, most_likely
    baselineId: varchar("baseline_id"),
    status: varchar("status").default("draft"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    name: z.string().min(1),
    description: z.string().optional(),
    type: z.string().optional(),
    baselineId: z.string().optional(),
    status: z.string().optional(),
});

export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;

export const scenarioVariables = pgTable("scenario_variables", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    scenarioId: varchar("scenario_id").notNull(),
    variableName: varchar("variable_name").notNull(),
    baseValue: numeric("base_value", { precision: 18, scale: 4 }),
    adjustedValue: numeric("adjusted_value", { precision: 18, scale: 4 }),
    adjustmentType: varchar("adjustment_type"), // percentage, absolute
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertScenarioVariableSchema = createInsertSchema(scenarioVariables).omit({ id: true, createdAt: true }).extend({
    scenarioId: z.string().min(1),
    variableName: z.string().min(1),
    baseValue: z.string().optional(),
    adjustedValue: z.string().optional(),
    adjustmentType: z.string().optional(),
});

export type InsertScenarioVariable = z.infer<typeof insertScenarioVariableSchema>;
export type ScenarioVariable = typeof scenarioVariables.$inferSelect;
