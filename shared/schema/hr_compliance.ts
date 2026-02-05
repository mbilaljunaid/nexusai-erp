import { pgTable, varchar, timestamp, jsonb, boolean, integer, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// ========== COMPLIANCE MASTER DATA ==========

export const hrComplianceFrameworks = pgTable("hr_compliance_frameworks", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    code: varchar("code").notNull(), // e.g., GDPR, HIPAA, SOX, WTD
    name: varchar("name").notNull(),
    description: text("description"),
    jurisdiction: varchar("jurisdiction"), // e.g., EU, US, UK, GLOBAL
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const hrComplianceRules = pgTable("hr_compliance_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    frameworkId: varchar("framework_id").references(() => hrComplianceFrameworks.id),
    code: varchar("code").notNull(),
    name: varchar("name").notNull(),
    description: text("description"),
    severity: varchar("severity").notNull(), // critical, high, medium, low
    category: varchar("category").notNull().default("REGULATORY"), // REGULATORY, POLICY, DATA_PRIVACY
    legislationCode: varchar("legislation_code").notNull().default("GLOBAL"), // e.g. US, UK, EU
    automationLevel: varchar("automation_level").notNull(), // full, partial, manual
    ruleLogic: jsonb("rule_logic"), // Detailed deterministic rules
    effectiveDate: timestamp("effective_date").notNull(),
    endDate: timestamp("end_date"),
    isActive: boolean("is_active").default(true),
});

export const hrRiskWeights = pgTable("hr_risk_weights", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    category: varchar("category").notNull(), // 'TENURE', 'LOCATION', 'ROLE', 'TIME'
    conditionKey: varchar("condition_key").notNull(), // e.g., 'less_than_30_days', 'high_risk_role'
    weight: integer("weight").notNull().default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});


export const hrPolicyAcknowledgements = pgTable("hr_policy_acknowledgements", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    personId: varchar("person_id").notNull(), // Link to hrPersons (loose reference or FK)
    policyCode: varchar("policy_code").notNull(), // e.g., "GDPR_2026", "DATA_PRIVACY_GLOBAL"
    consentVersion: varchar("consent_version").notNull(), // "v1.0", "2026-A"
    ipAddress: varchar("ip_address"), // Audit trail
    userAgent: text("user_agent"), // Device info
    acknowledgedAt: timestamp("acknowledged_at").defaultNow(),
});

// ========== SEGREGATION OF DUTIES (SoD) ==========

export const hrSodRules = pgTable("hr_sod_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    roleCodeA: varchar("role_code_a").notNull(),
    roleCodeB: varchar("role_code_b").notNull(),
    riskLevel: varchar("risk_level").notNull(), // CRITICAL, HIGH, MEDIUM
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
});

// ========== COMPLIANCE TRANSACTIONS ==========

export const hrComplianceEvents = pgTable("hr_compliance_events", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    ruleId: varchar("rule_id").references(() => hrComplianceRules.id),
    entityType: varchar("entity_type").notNull(), // PERSON, ASSIGNMENT, LEGAL_EMPLOYER
    entityId: varchar("entity_id").notNull(),
    evaluationResult: varchar("evaluation_result").notNull(), // COMPLIANT, NON_COMPLIANT, WARNING
    metadata: jsonb("metadata"), // Details of the evaluation
    timestamp: timestamp("timestamp").default(sql`now()`),
});

export const hrComplianceViolations = pgTable("hr_compliance_violations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    eventId: varchar("event_id").references(() => hrComplianceEvents.id),
    ruleId: varchar("rule_id").references(() => hrComplianceRules.id),
    status: varchar("status").default("open"), // open, investigation, resolved, dismissed
    severity: varchar("severity").notNull(),
    description: text("description"),
    remediationActions: jsonb("remediation_actions"), // Array of required steps
    assignedTo: varchar("assigned_to"), // User ID of compliance officer
    resolvedAt: timestamp("resolved_at"),
    resolutionNotes: text("resolution_notes"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== SCHEMAS ==========

export const insertComplianceFrameworkSchema = createInsertSchema(hrComplianceFrameworks);
export const insertComplianceRuleSchema = createInsertSchema(hrComplianceRules);
export const insertComplianceEventSchema = createInsertSchema(hrComplianceEvents);
export const insertComplianceViolationSchema = createInsertSchema(hrComplianceViolations);
export const insertRiskWeightSchema = createInsertSchema(hrRiskWeights);
export const insertPolicyAcknowledgementSchema = createInsertSchema(hrPolicyAcknowledgements);
export const insertSodRuleSchema = createInsertSchema(hrSodRules);

// ========== TYPES ==========

export type HrComplianceFramework = typeof hrComplianceFrameworks.$inferSelect;
export type HrComplianceRule = typeof hrComplianceRules.$inferSelect;
export type HrComplianceEvent = typeof hrComplianceEvents.$inferSelect;
export type HrComplianceViolation = typeof hrComplianceViolations.$inferSelect;
export type HrRiskWeight = typeof hrRiskWeights.$inferSelect;
export type HrPolicyAcknowledgement = typeof hrPolicyAcknowledgements.$inferSelect;
export type HrSodRule = typeof hrSodRules.$inferSelect;
