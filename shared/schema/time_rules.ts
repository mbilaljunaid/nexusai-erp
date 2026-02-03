
import { pgTable, varchar, timestamp, boolean, integer, numeric, date, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// ========== WORKFORCE MANAGEMENT: RULES ENGINE ==========

// 1. TIME RULES
// Defines policies like "Night Shift Premium", "Weekend OT", "Holiday Pay"
export const hrmTimeRules = pgTable("hrm_time_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(), // "Night Shift Differential"
    code: varchar("code").notNull().unique(), // "NIGHT_PREM"

    ruleType: varchar("rule_type").notNull(), // DIFFERENTIAL, OVERTIME, PREMIUM

    // Conditions
    startTime: varchar("start_time"), // "18:00" for Night Shift start
    endTime: varchar("end_time"), // "06:00" for Night Shift end
    daysOfWeek: varchar("days_of_week"), // "Sat,Sun" for Weekend

    // Calculation
    multiplier: numeric("multiplier", { precision: 4, scale: 2 }), // 1.5 for OT
    flatRateAdd: numeric("flat_rate_add", { precision: 10, scale: 2 }), // +$2.00/hr

    status: varchar("status").default("ACTIVE"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 2. ACCRUAL POLICIES
// Tenure-based logic: "If tenure > 5 years, accrue 15 days/year"
export const hrmAccrualPolicyRules = pgTable("hrm_accrual_policy_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(), // "Standard Vacation"
    leaveType: varchar("leave_type").notNull(), // "VACATION"

    // Logic
    minTenureMonths: integer("min_tenure_months").default(0), // 0 = New Hire
    accrualRatePerYear: integer("accrual_rate_per_year").notNull(), // 10 days
    maxCapDays: integer("max_cap_days").default(20), // Max balance

    status: varchar("status").default("ACTIVE"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTimeRuleSchema = createInsertSchema(hrmTimeRules);
export const insertAccrualPolicyRuleSchema = createInsertSchema(hrmAccrualPolicyRules);
