"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSodRuleSchema = exports.insertPolicyAcknowledgementSchema = exports.insertRiskWeightSchema = exports.insertComplianceViolationSchema = exports.insertComplianceEventSchema = exports.insertComplianceRuleSchema = exports.insertComplianceFrameworkSchema = exports.hrComplianceViolations = exports.hrComplianceEvents = exports.hrSodRules = exports.hrPolicyAcknowledgements = exports.hrRiskWeights = exports.hrComplianceRules = exports.hrComplianceFrameworks = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// ========== COMPLIANCE MASTER DATA ==========
exports.hrComplianceFrameworks = (0, pg_core_1.pgTable)("hr_compliance_frameworks", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    code: (0, pg_core_1.varchar)("code").notNull(), // e.g., GDPR, HIPAA, SOX, WTD
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    jurisdiction: (0, pg_core_1.varchar)("jurisdiction"), // e.g., EU, US, UK, GLOBAL
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.hrComplianceRules = (0, pg_core_1.pgTable)("hr_compliance_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    frameworkId: (0, pg_core_1.varchar)("framework_id").references(() => exports.hrComplianceFrameworks.id),
    code: (0, pg_core_1.varchar)("code").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    severity: (0, pg_core_1.varchar)("severity").notNull(), // critical, high, medium, low
    category: (0, pg_core_1.varchar)("category").notNull().default("REGULATORY"), // REGULATORY, POLICY, DATA_PRIVACY
    legislationCode: (0, pg_core_1.varchar)("legislation_code").notNull().default("GLOBAL"), // e.g. US, UK, EU
    automationLevel: (0, pg_core_1.varchar)("automation_level").notNull(), // full, partial, manual
    ruleLogic: (0, pg_core_1.jsonb)("rule_logic"), // Detailed deterministic rules
    effectiveDate: (0, pg_core_1.timestamp)("effective_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
});
exports.hrRiskWeights = (0, pg_core_1.pgTable)("hr_risk_weights", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    category: (0, pg_core_1.varchar)("category").notNull(), // 'TENURE', 'LOCATION', 'ROLE', 'TIME'
    conditionKey: (0, pg_core_1.varchar)("condition_key").notNull(), // e.g., 'less_than_30_days', 'high_risk_role'
    weight: (0, pg_core_1.integer)("weight").notNull().default(0),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.hrPolicyAcknowledgements = (0, pg_core_1.pgTable)("hr_policy_acknowledgements", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    personId: (0, pg_core_1.varchar)("person_id").notNull(), // Link to hrPersons (loose reference or FK)
    policyCode: (0, pg_core_1.varchar)("policy_code").notNull(), // e.g., "GDPR_2026", "DATA_PRIVACY_GLOBAL"
    consentVersion: (0, pg_core_1.varchar)("consent_version").notNull(), // "v1.0", "2026-A"
    ipAddress: (0, pg_core_1.varchar)("ip_address"), // Audit trail
    userAgent: (0, pg_core_1.text)("user_agent"), // Device info
    acknowledgedAt: (0, pg_core_1.timestamp)("acknowledged_at").defaultNow(),
});
// ========== SEGREGATION OF DUTIES (SoD) ==========
exports.hrSodRules = (0, pg_core_1.pgTable)("hr_sod_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    roleCodeA: (0, pg_core_1.varchar)("role_code_a").notNull(),
    roleCodeB: (0, pg_core_1.varchar)("role_code_b").notNull(),
    riskLevel: (0, pg_core_1.varchar)("risk_level").notNull(), // CRITICAL, HIGH, MEDIUM
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// ========== COMPLIANCE TRANSACTIONS ==========
exports.hrComplianceEvents = (0, pg_core_1.pgTable)("hr_compliance_events", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    ruleId: (0, pg_core_1.varchar)("rule_id").references(() => exports.hrComplianceRules.id),
    entityType: (0, pg_core_1.varchar)("entity_type").notNull(), // PERSON, ASSIGNMENT, LEGAL_EMPLOYER
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(),
    evaluationResult: (0, pg_core_1.varchar)("evaluation_result").notNull(), // COMPLIANT, NON_COMPLIANT, WARNING
    metadata: (0, pg_core_1.jsonb)("metadata"), // Details of the evaluation
    timestamp: (0, pg_core_1.timestamp)("timestamp").default((0, drizzle_orm_1.sql) `now()`),
});
exports.hrComplianceViolations = (0, pg_core_1.pgTable)("hr_compliance_violations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    eventId: (0, pg_core_1.varchar)("event_id").references(() => exports.hrComplianceEvents.id),
    ruleId: (0, pg_core_1.varchar)("rule_id").references(() => exports.hrComplianceRules.id),
    status: (0, pg_core_1.varchar)("status").default("open"), // open, investigation, resolved, dismissed
    severity: (0, pg_core_1.varchar)("severity").notNull(),
    description: (0, pg_core_1.text)("description"),
    remediationActions: (0, pg_core_1.jsonb)("remediation_actions"), // Array of required steps
    assignedTo: (0, pg_core_1.varchar)("assigned_to"), // User ID of compliance officer
    resolvedAt: (0, pg_core_1.timestamp)("resolved_at"),
    resolutionNotes: (0, pg_core_1.text)("resolution_notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ========== SCHEMAS ==========
exports.insertComplianceFrameworkSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrComplianceFrameworks);
exports.insertComplianceRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrComplianceRules);
exports.insertComplianceEventSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrComplianceEvents);
exports.insertComplianceViolationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrComplianceViolations);
exports.insertRiskWeightSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrRiskWeights);
exports.insertPolicyAcknowledgementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrPolicyAcknowledgements);
exports.insertSodRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrSodRules);
//# sourceMappingURL=hr_compliance.js.map