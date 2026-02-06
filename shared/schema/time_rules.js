"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertAccrualPolicyRuleSchema = exports.insertTimeRuleSchema = exports.hrmAccrualPolicies = exports.hrmAccrualPolicyRules = exports.hrmTimeRules = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// ========== WORKFORCE MANAGEMENT: RULES ENGINE ==========
// 1. TIME RULES
// Defines policies like "Night Shift Premium", "Weekend OT", "Holiday Pay"
exports.hrmTimeRules = (0, pg_core_1.pgTable)("hrm_time_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(), // "Night Shift Differential"
    code: (0, pg_core_1.varchar)("code").notNull().unique(), // "NIGHT_PREM"
    ruleType: (0, pg_core_1.varchar)("rule_type").notNull(), // DIFFERENTIAL, OVERTIME, PREMIUM
    // Conditions
    startTime: (0, pg_core_1.varchar)("start_time"), // "18:00" for Night Shift start
    endTime: (0, pg_core_1.varchar)("end_time"), // "06:00" for Night Shift end
    daysOfWeek: (0, pg_core_1.varchar)("days_of_week"), // "Sat,Sun" for Weekend
    // Calculation
    multiplier: (0, pg_core_1.numeric)("multiplier", { precision: 4, scale: 2 }), // 1.5 for OT
    flatRateAdd: (0, pg_core_1.numeric)("flat_rate_add", { precision: 10, scale: 2 }), // +$2.00/hr
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. ACCRUAL POLICIES
// Tenure-based logic: "If tenure > 5 years, accrue 15 days/year"
exports.hrmAccrualPolicyRules = (0, pg_core_1.pgTable)("hrm_accrual_policy_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(), // "Standard Vacation"
    leaveType: (0, pg_core_1.varchar)("leave_type").notNull(), // "VACATION"
    // Logic
    minTenureMonths: (0, pg_core_1.integer)("min_tenure_months").default(0), // 0 = New Hire
    accrualRatePerYear: (0, pg_core_1.integer)("accrual_rate_per_year").notNull(), // 10 days
    maxCapDays: (0, pg_core_1.integer)("max_cap_days").default(20), // Max balance
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.hrmAccrualPolicies = exports.hrmAccrualPolicyRules;
exports.insertTimeRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmTimeRules);
exports.insertAccrualPolicyRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmAccrualPolicyRules);
//# sourceMappingURL=time_rules.js.map