"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertComplianceSchema = exports.insertSubmittalSchema = exports.insertRFISchema = exports.insertDailyEquipmentSchema = exports.insertDailyLaborSchema = exports.selectDailyLogSchema = exports.insertDailyLogSchema = exports.constructionCompliance = exports.constructionDailyEquipment = exports.constructionSubmittals = exports.constructionRFIs = exports.constructionDailyLabor = exports.constructionDailyLogs = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// -- Daily Logs --
exports.constructionDailyLogs = (0, pg_core_1.pgTable)("construction_daily_logs", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    projectId: (0, pg_core_1.uuid)("projectId").notNull(),
    contractId: (0, pg_core_1.uuid)("contractId"),
    logDate: (0, pg_core_1.date)("log_date").notNull(),
    weatherCondition: (0, pg_core_1.text)("weather_condition"), // e.g., Sunny, Rain, Cloudy
    temperatureMin: (0, pg_core_1.integer)("temp_min"),
    temperatureMax: (0, pg_core_1.integer)("temp_max"),
    safetyIncidents: (0, pg_core_1.text)("safety_incidents"),
    generalComments: (0, pg_core_1.text)("general_comments"),
    reportedBy: (0, pg_core_1.text)("reported_by").notNull(),
    status: (0, pg_core_1.text)("status").notNull().default("DRAFT"), // DRAFT, SUBMITTED
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.constructionDailyLabor = (0, pg_core_1.pgTable)("construction_daily_labor", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    dailyLogId: (0, pg_core_1.uuid)("daily_log_id").notNull(),
    trade: (0, pg_core_1.text)("trade").notNull(), // e.g., Electrician, Plumber
    workerCount: (0, pg_core_1.integer)("worker_count").notNull(),
    hoursWorked: (0, pg_core_1.decimal)("hours_worked", { precision: 10, scale: 2 }).notNull(),
    workPerformed: (0, pg_core_1.text)("work_performed"),
});
// -- Requests for Information (RFIs) --
exports.constructionRFIs = (0, pg_core_1.pgTable)("construction_rfis", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    projectId: (0, pg_core_1.uuid)("projectId").notNull(),
    rfiNumber: (0, pg_core_1.text)("rfi_number").notNull(),
    subject: (0, pg_core_1.text)("subject").notNull(),
    question: (0, pg_core_1.text)("question").notNull(),
    suggestedSolution: (0, pg_core_1.text)("suggested_solution"),
    importance: (0, pg_core_1.text)("importance").notNull().default("NORMAL"), // LOW, NORMAL, HIGH, URGENT
    status: (0, pg_core_1.text)("status").notNull().default("OPEN"), // OPEN, CLOSED, VOID
    dueDate: (0, pg_core_1.date)("due_date"),
    assignedTo: (0, pg_core_1.text)("assigned_to"),
    closedAt: (0, pg_core_1.timestamp)("closed_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// -- Submittals --
exports.constructionSubmittals = (0, pg_core_1.pgTable)("construction_submittals", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    projectId: (0, pg_core_1.uuid)("projectId").notNull(),
    submittalNumber: (0, pg_core_1.text)("submittal_number").notNull(),
    specSection: (0, pg_core_1.text)("spec_section"), // e.g., 03 30 00 Cast-in-Place Concrete
    description: (0, pg_core_1.text)("description").notNull(),
    status: (0, pg_core_1.text)("status").notNull().default("PENDING"), // PENDING, APPROVED, REJECTED, REVISE_RESUBMIT
    receivedDate: (0, pg_core_1.date)("received_date"),
    requiredDate: (0, pg_core_1.date)("required_date"),
    approvedDate: (0, pg_core_1.date)("approved_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// -- Daily Equipment Logs --
exports.constructionDailyEquipment = (0, pg_core_1.pgTable)("construction_daily_equipment", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    dailyLogId: (0, pg_core_1.uuid)("daily_log_id").notNull(),
    equipmentType: (0, pg_core_1.text)("equipment_type").notNull(), // e.g., Excavator, Crane
    equipmentId: (0, pg_core_1.text)("equipment_id"), // Optional Asset ID
    hoursUsed: (0, pg_core_1.decimal)("hours_used", { precision: 10, scale: 2 }).notNull(),
    workPerformed: (0, pg_core_1.text)("work_performed"),
    costStatus: (0, pg_core_1.text)("cost_status").default("UNCOSTED"), // UNCOSTED, COSTED
});
// -- Compliance (Insurance, Bonds) --
exports.constructionCompliance = (0, pg_core_1.pgTable)("construction_compliance", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    contractId: (0, pg_core_1.uuid)("contractId").notNull(),
    documentType: (0, pg_core_1.text)("document_type").notNull(), // INSURANCE, BOND, LICENSE
    description: (0, pg_core_1.text)("description"),
    issuer: (0, pg_core_1.text)("issuer"), // e.g., Insurance Co Name
    policyNumber: (0, pg_core_1.text)("policy_number"),
    effectiveDate: (0, pg_core_1.date)("effective_date"),
    expiryDate: (0, pg_core_1.date)("expiry_date"),
    coverageAmount: (0, pg_core_1.decimal)("coverage_amount", { precision: 18, scale: 2 }),
    status: (0, pg_core_1.text)("status").notNull().default("ACTIVE"), // ACTIVE, EXPIRED, PENDING
    isMandatoryForPayment: (0, pg_core_1.boolean)("is_mandatory_for_payment").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// -- Zod Schemas --
exports.insertDailyLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.constructionDailyLogs);
exports.selectDailyLogSchema = (0, drizzle_zod_1.createSelectSchema)(exports.constructionDailyLogs);
exports.insertDailyLaborSchema = (0, drizzle_zod_1.createInsertSchema)(exports.constructionDailyLabor);
exports.insertDailyEquipmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.constructionDailyEquipment);
exports.insertRFISchema = (0, drizzle_zod_1.createInsertSchema)(exports.constructionRFIs);
exports.insertSubmittalSchema = (0, drizzle_zod_1.createInsertSchema)(exports.constructionSubmittals);
exports.insertComplianceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.constructionCompliance);
//# sourceMappingURL=construction_ops.js.map