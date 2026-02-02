import { pgTable, varchar, timestamp, numeric, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== HR MODULE ==========
export const employees = pgTable("employees", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    email: varchar("email").unique(),
    department: varchar("department"),
    hireDate: timestamp("hire_date"),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEmployeeSchema = createInsertSchema(employees).extend({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email().optional(),
    department: z.string().optional(),
    hireDate: z.date().optional().nullable(),
    status: z.string().optional(),
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export const payroll = pgTable("payroll", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    employeeId: varchar("employee_id").notNull(),
    salary: numeric("salary", { precision: 18, scale: 2 }),
    bonus: numeric("bonus", { precision: 18, scale: 2 }).default("0"),
    deductions: numeric("deductions", { precision: 18, scale: 2 }).default("0"),
    netPay: numeric("net_pay", { precision: 18, scale: 2 }),
    payPeriod: varchar("pay_period"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPayrollSchema = createInsertSchema(payroll).extend({
    employeeId: z.string().min(1),
    salary: z.string().optional(),
    bonus: z.string().optional(),
    deductions: z.string().optional(),
    netPay: z.string().optional(),
    payPeriod: z.string().optional(),
});

export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type Payroll = typeof payroll.$inferSelect;

// ========== PAYROLL CONFIGURATION ==========
export const payrollConfigs = pgTable("payroll_configs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    payPeriod: varchar("pay_period").default("monthly"), // weekly, biweekly, monthly
    payDay: integer("pay_day"),
    taxSettings: jsonb("tax_settings"),
    benefitSettings: jsonb("benefit_settings"),
    overtimeRules: jsonb("overtime_rules"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertPayrollConfigSchema = createInsertSchema(payrollConfigs).extend({
    tenantId: z.string().min(1),
    payPeriod: z.string().optional(),
    payDay: z.number().optional(),
    taxSettings: z.record(z.any()).optional(),
    benefitSettings: z.record(z.any()).optional(),
    overtimeRules: z.record(z.any()).optional(),
    isActive: z.boolean().optional(),
});

export type InsertPayrollConfig = z.infer<typeof insertPayrollConfigSchema>;
export type PayrollConfig = typeof payrollConfigs.$inferSelect;

export const timeEntries = pgTable("time_entries", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    employeeId: varchar("employee_id").notNull(),
    projectId: varchar("project_id").notNull(), // Linked to ppm_projects
    taskId: varchar("task_id").notNull(), // Linked to ppm_tasks
    date: timestamp("date").notNull(),
    hours: numeric("hours", { precision: 5, scale: 2 }).notNull(),
    description: varchar("description"),
    billableFlag: boolean("billable_flag").default(false),
    costRate: numeric("cost_rate", { precision: 18, scale: 2 }), // Hourly cost
    status: varchar("status").default("SUBMITTED"), // SUBMITTED, APPROVED, PROCESSED
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).extend({
    employeeId: z.string().min(1),
    projectId: z.string().min(1),
    taskId: z.string().min(1),
    date: z.date(),
    hours: z.string().regex(/^\d+(\.\d{1,2})?$/), // string for numeric
    description: z.string().optional(),
    billableFlag: z.boolean().optional(),
    costRate: z.string().optional(),
    status: z.string().optional(),
});

export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
