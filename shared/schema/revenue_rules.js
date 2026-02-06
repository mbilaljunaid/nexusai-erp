"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.glRevenueRules = exports.insertPerformanceObligationRuleSchema = exports.performanceObligationRules = exports.insertRevenueIdentificationRuleSchema = exports.revenueIdentificationRules = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
/**
 * 1. Contract Identification Rules
 * Define how source events are grouped into Revenue Contracts.
 */
exports.revenueIdentificationRules = (0, pg_core_1.pgTable)("revenue_identification_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    // grouping_criteria stores an array of fields to group by, e.g. ["legalEntityId", "orgId", "customerId", "referenceNumber"]
    groupingCriteria: (0, pg_core_1.jsonb)("grouping_criteria").notNull(),
    priority: (0, pg_core_1.integer)("priority").default(1),
    status: (0, pg_core_1.varchar)("status").default("Active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertRevenueIdentificationRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.revenueIdentificationRules);
/**
 * 2. Performance Obligation (POB) Rules
 * Define how contract lines are categorized into POBs.
 */
exports.performanceObligationRules = (0, pg_core_1.pgTable)("performance_obligation_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    // Rule logic: if source line attribute matches value, use this POB metadata
    attributeName: (0, pg_core_1.varchar)("attribute_name").notNull(), // e.g. "itemType" or "itemId"
    attributeValue: (0, pg_core_1.varchar)("attribute_value").notNull(),
    pobName: (0, pg_core_1.varchar)("pob_name").notNull(), // e.g. "Software License"
    satisfactionMethod: (0, pg_core_1.varchar)("satisfaction_method").default("Ratable"), // Ratable, PointInTime
    defaultDurationMonths: (0, pg_core_1.integer)("default_duration_months").default(12),
    priority: (0, pg_core_1.integer)("priority").default(1),
    status: (0, pg_core_1.varchar)("status").default("Active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPerformanceObligationRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.performanceObligationRules);
/**
 * LEGACY TABLE - DO NOT DELETE YET
 * This table mimics the structure expected by Drizzle to avoid deletion.
 */
exports.glRevenueRules = (0, pg_core_1.pgTable)("gl_revenue_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.text)("name"),
    type: (0, pg_core_1.text)("type"),
    duration: (0, pg_core_1.text)("duration"),
    recognitionStart: (0, pg_core_1.text)("recognition_start"),
    enabled: (0, pg_core_1.text)("enabled"),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`)
});
//# sourceMappingURL=revenue_rules.js.map