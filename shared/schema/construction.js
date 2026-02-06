"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertConstructionPayAppLineSchema = exports.constructionPayAppLines = exports.insertConstructionPayAppSchema = exports.constructionPayApps = exports.insertConstructionVariationSchema = exports.constructionVariations = exports.insertConstructionContractLineSchema = exports.constructionContractLines = exports.insertConstructionContractSchema = exports.constructionContracts = exports.insertConstructionSetupSchema = exports.constructionSetup = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// ========== CONSTRUCTION MANAGEMENT MODULE ==========
// 0. Configuration & Setup
exports.constructionSetup = (0, pg_core_1.pgTable)("construction_setup", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    configKey: (0, pg_core_1.varchar)("config_key").notNull().unique(), // e.g. 'DEFAULT_RETENTION'
    configValue: (0, pg_core_1.text)("config_value").notNull(),
    category: (0, pg_core_1.varchar)("category").default("GENERAL"), // GENERAL, BILLING, VARIATIONS
    description: (0, pg_core_1.text)("description"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertConstructionSetupSchema = (0, drizzle_zod_1.createInsertSchema)(exports.constructionSetup);
// 1. Construction Contracts (Prime & Subcontracts)
exports.constructionContracts = (0, pg_core_1.pgTable)("construction_contracts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    projectId: (0, pg_core_1.varchar)("project_id").notNull(), // Link to PPM Project
    contractNumber: (0, pg_core_1.varchar)("contract_number").notNull().unique(),
    vendorId: (0, pg_core_1.varchar)("vendor_id"), // Link to Supplier (for Subcontracts) or Client (for Prime)
    type: (0, pg_core_1.varchar)("type").default("PRIME"), // PRIME, SUBCONTRACT
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, ACTIVE, CLOSED
    subject: (0, pg_core_1.varchar)("subject").notNull(),
    description: (0, pg_core_1.text)("description"),
    awardedDate: (0, pg_core_1.timestamp)("awarded_date"),
    startDate: (0, pg_core_1.timestamp)("start_date"),
    completionDate: (0, pg_core_1.timestamp)("completion_date"),
    originalAmount: (0, pg_core_1.numeric)("original_amount", { precision: 18, scale: 2 }).default("0.00"),
    revisedAmount: (0, pg_core_1.numeric)("revised_amount", { precision: 18, scale: 2 }).default("0.00"), // Includes variations
    retentionPercentage: (0, pg_core_1.numeric)("retention_percentage", { precision: 5, scale: 2 }).default("10.00"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertConstructionContractSchema = (0, drizzle_zod_1.createInsertSchema)(exports.constructionContracts);
// 2. Schedule of Values (SOV) / Contract Lines
exports.constructionContractLines = (0, pg_core_1.pgTable)("construction_contract_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    contractId: (0, pg_core_1.varchar)("contract_id").notNull(),
    lineNumber: (0, pg_core_1.integer)("line_number").notNull(),
    taskId: (0, pg_core_1.varchar)("task_id"), // Link to PPM Task
    description: (0, pg_core_1.varchar)("description").notNull(),
    uom: (0, pg_core_1.varchar)("uom").default("LS"), // Lump Sum, Each, etc.
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).default("1"),
    unitRate: (0, pg_core_1.numeric)("unit_rate", { precision: 18, scale: 2 }).default("0.00"),
    scheduledValue: (0, pg_core_1.numeric)("scheduled_value", { precision: 18, scale: 2 }).notNull(),
    costCodeId: (0, pg_core_1.varchar)("cost_code_id"), // Link to construction_cost_codes
    status: (0, pg_core_1.varchar)("status").default("APPROVED"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertConstructionContractLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.constructionContractLines);
// 3. Variations / Change Orders
exports.constructionVariations = (0, pg_core_1.pgTable)("construction_variations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    contractId: (0, pg_core_1.varchar)("contract_id").notNull(),
    variationNumber: (0, pg_core_1.varchar)("variation_number").notNull(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    type: (0, pg_core_1.varchar)("type").default("PCO"), // PCO (Potential), COR (Request), CO (Approved Change Order)
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, SUBMITTED, APPROVED, REJECTED
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).default("0.00"),
    scheduleImpactDays: (0, pg_core_1.integer)("schedule_impact_days").default(0),
    approvedDate: (0, pg_core_1.timestamp)("approved_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertConstructionVariationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.constructionVariations);
// 4. Applications for Payment / Pay Apps (G702 style)
exports.constructionPayApps = (0, pg_core_1.pgTable)("construction_pay_apps", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    contractId: (0, pg_core_1.varchar)("contract_id").notNull(),
    applicationNumber: (0, pg_core_1.integer)("application_number").notNull(),
    periodStart: (0, pg_core_1.timestamp)("period_start").notNull(),
    periodEnd: (0, pg_core_1.timestamp)("period_end").notNull(),
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, SUBMITTED, ARCHITECT_APPROVED, ENGINEER_APPROVED, CERTIFIED, PAID
    isLocked: (0, pg_core_1.boolean)("is_locked").default(false), // Locked for audit once certified
    // Financials
    totalCompleted: (0, pg_core_1.numeric)("total_completed", { precision: 18, scale: 2 }).default("0.00"), // Work in Place + Stored Materials
    retentionAmount: (0, pg_core_1.numeric)("retention_amount", { precision: 18, scale: 2 }).default("0.00"),
    previousPayments: (0, pg_core_1.numeric)("previous_payments", { precision: 18, scale: 2 }).default("0.00"),
    currentPaymentDue: (0, pg_core_1.numeric)("current_payment_due", { precision: 18, scale: 2 }).default("0.00"),
    architectApprovedBy: (0, pg_core_1.varchar)("architect_approved_by"),
    architectApprovedDate: (0, pg_core_1.timestamp)("architect_approved_date"),
    engineerApprovedBy: (0, pg_core_1.varchar)("engineer_approved_by"),
    engineerApprovedDate: (0, pg_core_1.timestamp)("engineer_approved_date"),
    certifiedBy: (0, pg_core_1.varchar)("certified_by"), // GC / Final Certification
    certifiedDate: (0, pg_core_1.timestamp)("certified_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertConstructionPayAppSchema = (0, drizzle_zod_1.createInsertSchema)(exports.constructionPayApps);
// 5. Pay App Lines (G703 style) - Progress per SOV line
exports.constructionPayAppLines = (0, pg_core_1.pgTable)("construction_pay_app_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    payAppId: (0, pg_core_1.varchar)("pay_app_id").notNull(),
    contractLineId: (0, pg_core_1.varchar)("contract_line_id").notNull(),
    workCompletedThisPeriod: (0, pg_core_1.numeric)("work_completed_this_period", { precision: 18, scale: 2 }).default("0.00"),
    materialsStored: (0, pg_core_1.numeric)("materials_stored", { precision: 18, scale: 2 }).default("0.00"),
    totalCompletedToDate: (0, pg_core_1.numeric)("total_completed_to_date", { precision: 18, scale: 2 }).default("0.00"),
    percentageComplete: (0, pg_core_1.numeric)("percentage_complete", { precision: 5, scale: 2 }).default("0.00"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertConstructionPayAppLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.constructionPayAppLines);
//# sourceMappingURL=construction.js.map