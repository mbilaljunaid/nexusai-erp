import { pgTable, text, timestamp, uuid, boolean, decimal, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// -- Daily Logs --
export const constructionDailyLogs = pgTable("construction_daily_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("projectId").notNull(),
    contractId: uuid("contractId"),
    logDate: date("log_date").notNull(),
    weatherCondition: text("weather_condition"), // e.g., Sunny, Rain, Cloudy
    temperatureMin: integer("temp_min"),
    temperatureMax: integer("temp_max"),
    safetyIncidents: text("safety_incidents"),
    generalComments: text("general_comments"),
    reportedBy: text("reported_by").notNull(),
    status: text("status").notNull().default("DRAFT"), // DRAFT, SUBMITTED
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const constructionDailyLabor = pgTable("construction_daily_labor", {
    id: uuid("id").primaryKey().defaultRandom(),
    dailyLogId: uuid("daily_log_id").notNull(),
    trade: text("trade").notNull(), // e.g., Electrician, Plumber
    workerCount: integer("worker_count").notNull(),
    hoursWorked: decimal("hours_worked", { precision: 10, scale: 2 }).notNull(),
    workPerformed: text("work_performed"),
});

// -- Requests for Information (RFIs) --
export const constructionRFIs = pgTable("construction_rfis", {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("projectId").notNull(),
    rfiNumber: text("rfi_number").notNull(),
    subject: text("subject").notNull(),
    question: text("question").notNull(),
    suggestedSolution: text("suggested_solution"),
    importance: text("importance").notNull().default("NORMAL"), // LOW, NORMAL, HIGH, URGENT
    status: text("status").notNull().default("OPEN"), // OPEN, CLOSED, VOID
    dueDate: date("due_date"),
    assignedTo: text("assigned_to"),
    closedAt: timestamp("closed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -- Submittals --
export const constructionSubmittals = pgTable("construction_submittals", {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("projectId").notNull(),
    submittalNumber: text("submittal_number").notNull(),
    specSection: text("spec_section"), // e.g., 03 30 00 Cast-in-Place Concrete
    description: text("description").notNull(),
    status: text("status").notNull().default("PENDING"), // PENDING, APPROVED, REJECTED, REVISE_RESUBMIT
    receivedDate: date("received_date"),
    requiredDate: date("required_date"),
    approvedDate: date("approved_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -- Compliance (Insurance, Bonds) --
export const constructionCompliance = pgTable("construction_compliance", {
    id: uuid("id").primaryKey().defaultRandom(),
    contractId: uuid("contractId").notNull(),
    documentType: text("document_type").notNull(), // INSURANCE, BOND, LICENSE
    description: text("description"),
    issuer: text("issuer"), // e.g., Insurance Co Name
    policyNumber: text("policy_number"),
    effectiveDate: date("effective_date"),
    expiryDate: date("expiry_date"),
    coverageAmount: decimal("coverage_amount", { precision: 18, scale: 2 }),
    status: text("status").notNull().default("ACTIVE"), // ACTIVE, EXPIRED, PENDING
    isMandatoryForPayment: boolean("is_mandatory_for_payment").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -- Zod Schemas --
export const insertDailyLogSchema = createInsertSchema(constructionDailyLogs);
export const selectDailyLogSchema = createSelectSchema(constructionDailyLogs);
export const insertDailyLaborSchema = createInsertSchema(constructionDailyLabor);
export const insertRFISchema = createInsertSchema(constructionRFIs);
export const insertSubmittalSchema = createInsertSchema(constructionSubmittals);
export const insertComplianceSchema = createInsertSchema(constructionCompliance);

export type DailyLog = typeof constructionDailyLogs.$inferSelect;
export type RFI = typeof constructionRFIs.$inferSelect;
export type Submittal = typeof constructionSubmittals.$inferSelect;
export type Compliance = typeof constructionCompliance.$inferSelect;
