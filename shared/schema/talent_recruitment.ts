import { pgTable, varchar, timestamp, boolean, integer, date, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { hrOrganizations, hrJobs, hrLocations } from "./hr_structures";
import { hrWorkRelationships, hrPersons } from "./hr_worker";

// ========== RECRUITMENT MODULE ==========

// 1. JOB REQUISITIONS
export const hrmRecRequisitions = pgTable("hrm_rec_requisitions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    requisitionNumber: varchar("requisition_number").unique().notNull(), // REQ-2024-001
    title: varchar("title").notNull(),

    // Structure Links
    departmentId: varchar("department_id").references(() => hrOrganizations.id),
    jobId: varchar("job_id").references(() => hrJobs.id),
    locationId: varchar("location_id").references(() => hrLocations.id),
    hiringManagerId: varchar("hiring_manager_id").references(() => hrPersons.id),
    recruiterId: varchar("recruiter_id").references(() => hrPersons.id),

    // Details
    status: varchar("status").default("DRAFT"), // DRAFT, OPEN, ON_HOLD, CLOSED, FILLED
    openDate: date("open_date"),
    closeDate: date("close_date"),
    headcount: integer("headcount").default(1),

    description: text("description"),
    requirements: text("requirements"),

    payRangeMin: integer("pay_range_min"),
    payRangeMax: integer("pay_range_max"),
    currency: varchar("currency").default("USD"),

    customFields: jsonb("custom_fields"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
    createdBy: varchar("created_by"),
});

// 2. CANDIDATES
// Can be linked to an internal Person (internal hire) or external.
export const hrmRecCandidates = pgTable("hrm_rec_candidates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    email: varchar("email").notNull(),
    phone: varchar("phone"),

    linkedPersonId: varchar("linked_person_id").references(() => hrPersons.id), // If internal candidate

    resumeUrl: varchar("resume_url"),
    linkedinUrl: varchar("linkedin_url"),
    portfolioUrl: varchar("portfolio_url"),

    skills: jsonb("skills"), // Array of strings e.g. ["React", "Node"]
    experienceYears: integer("experience_years"),

    source: varchar("source"), // LinkedIn, Referral, CareerSite

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 3. JOB APPLICATIONS
export const hrmRecApplications = pgTable("hrm_rec_applications", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    candidateId: varchar("candidate_id").notNull().references(() => hrmRecCandidates.id),
    requisitionId: varchar("requisition_id").notNull().references(() => hrmRecRequisitions.id),

    status: varchar("status").default("APPLIED"), // APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED, WITHDRAWN
    stage: varchar("stage").default("NEW"), // More granular: 'Hiring Manager Review', 'Tech Interview'

    score: integer("score"), // AI Ranking Score?
    notes: text("notes"),

    appliedDate: timestamp("applied_date").default(sql`now()`),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 4. JOB OFFERS
export const hrmRecOffers = pgTable("hrm_rec_offers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    applicationId: varchar("application_id").notNull().references(() => hrmRecApplications.id),

    status: varchar("status").default("DRAFT"), // DRAFT, PENDING_APPROVAL, APPROVED, SENT, ACCEPTED, REJECTED, NEGOTIATION

    // Offer Details
    baseSalary: integer("base_salary").notNull(),
    currency: varchar("currency").default("USD"),
    stockOptions: integer("stock_options"),
    bonusPercentage: integer("bonus_percentage"),

    startDate: date("start_date"),
    expirationDate: date("expiration_date"),

    offerLetterUrl: varchar("offer_letter_url"), // Generative PDF link

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 5. INTERVIEWS
export const hrmRecInterviews = pgTable("hrm_rec_interviews", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    applicationId: varchar("application_id").notNull().references(() => hrmRecApplications.id),
    interviewerId: varchar("interviewer_id").notNull().references(() => hrPersons.id),

    scheduledTime: timestamp("scheduled_time").notNull(),
    durationMinutes: integer("duration_minutes").default(60),
    location: varchar("location"), // "Zoom", "Office 301"

    status: varchar("status").default("SCHEDULED"), // SCHEDULED, COMPLETED, CANCELLED, NO_SHOW

    feedback: text("feedback"),
    rating: integer("rating"), // 1-5

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 6. PIPELINE CONFIGURATION
export const hrmRecPipelineTemplates = pgTable("hrm_rec_pipeline_templates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    name: varchar("name").notNull(), // e.g., "Engineering Pipeline"
    description: text("description"),
    isDefault: boolean("is_default").default(false),
    departmentId: varchar("department_id"), // Optional: Limit to specific dept
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const hrmRecPipelineStages = pgTable("hrm_rec_pipeline_stages", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    templateId: varchar("template_id").notNull().references(() => hrmRecPipelineTemplates.id),
    name: varchar("name").notNull(), // e.g., "Phone Screen"
    order: integer("order").notNull(),
    type: varchar("type").default("CUSTOM"), // SCREENING, INTERVIEW, OFFER, HIRED
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 7. EMAIL CONFIGURATION
export const hrmRecEmailTemplates = pgTable("hrm_rec_email_templates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    name: varchar("name").notNull(), // e.g., "Offer Letter"
    subject: varchar("subject").notNull(),
    body: text("body").notNull(),
    type: varchar("type").notNull(), // OFFER, REJECTION, INTERVIEW_INVITE
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 8. ONBOARDING TASKS
export const hrmRecOnboardingTasks = pgTable("hrm_rec_onboarding_tasks", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    applicationId: varchar("application_id").notNull().references(() => hrmRecApplications.id),
    taskName: varchar("task_name").notNull(),
    category: varchar("category").notNull(), // IT, LEGAL, FACILITIES, HR
    status: varchar("status").default("PENDING"), // PENDING, COMPLETED, SKIPPED
    assignedTo: varchar("assigned_to"), // ID of person responsible (e.g., IT Admin)
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// SCHEMAS
export const insertRequisitionSchema = createInsertSchema(hrmRecRequisitions);
export const insertCandidateSchema = createInsertSchema(hrmRecCandidates);
export const insertApplicationSchema = createInsertSchema(hrmRecApplications);
export const insertOfferSchema = createInsertSchema(hrmRecOffers);
export const insertInterviewSchema = createInsertSchema(hrmRecInterviews);
export const insertOnboardingTaskSchema = createInsertSchema(hrmRecOnboardingTasks);
// Config Schemas
export const insertPipelineTemplateSchema = createInsertSchema(hrmRecPipelineTemplates);
export const insertPipelineStageSchema = createInsertSchema(hrmRecPipelineStages);
export const insertEmailTemplateSchema = createInsertSchema(hrmRecEmailTemplates);

export type RecRequisition = typeof hrmRecRequisitions.$inferSelect;
export type RecCandidate = typeof hrmRecCandidates.$inferSelect;
export type RecApplication = typeof hrmRecApplications.$inferSelect;
export type RecOffer = typeof hrmRecOffers.$inferSelect;
export type RecInterview = typeof hrmRecInterviews.$inferSelect;
export type RecOnboardingTask = typeof hrmRecOnboardingTasks.$inferSelect;
// Config Types
export type RecPipelineTemplate = typeof hrmRecPipelineTemplates.$inferSelect;
export type RecPipelineStage = typeof hrmRecPipelineStages.$inferSelect;
export type RecEmailTemplate = typeof hrmRecEmailTemplates.$inferSelect;
