"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertEmailTemplateSchema = exports.insertPipelineStageSchema = exports.insertPipelineTemplateSchema = exports.insertOnboardingTaskSchema = exports.insertInterviewSchema = exports.insertOfferSchema = exports.insertApplicationSchema = exports.insertCandidateSchema = exports.insertRequisitionSchema = exports.hrmRecOnboardingTasks = exports.hrmRecEmailTemplates = exports.hrmRecPipelineStages = exports.hrmRecPipelineTemplates = exports.hrmRecInterviews = exports.hrmRecOffers = exports.hrmRecApplications = exports.hrmRecCandidates = exports.hrmRecRequisitions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const hr_structures_1 = require("./hr_structures");
const hr_worker_1 = require("./hr_worker");
// ========== RECRUITMENT MODULE ==========
// 1. JOB REQUISITIONS
exports.hrmRecRequisitions = (0, pg_core_1.pgTable)("hrm_rec_requisitions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    requisitionNumber: (0, pg_core_1.varchar)("requisition_number").unique().notNull(), // REQ-2024-001
    title: (0, pg_core_1.varchar)("title").notNull(),
    // Structure Links
    departmentId: (0, pg_core_1.varchar)("department_id").references(() => hr_structures_1.hrOrganizations.id),
    jobId: (0, pg_core_1.varchar)("job_id").references(() => hr_structures_1.hrJobs.id),
    locationId: (0, pg_core_1.varchar)("location_id").references(() => hr_structures_1.hrLocations.id),
    hiringManagerId: (0, pg_core_1.varchar)("hiring_manager_id").references(() => hr_worker_1.hrPersons.id),
    recruiterId: (0, pg_core_1.varchar)("recruiter_id").references(() => hr_worker_1.hrPersons.id),
    // Details
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, OPEN, ON_HOLD, CLOSED, FILLED
    openDate: (0, pg_core_1.date)("open_date"),
    closeDate: (0, pg_core_1.date)("close_date"),
    headcount: (0, pg_core_1.integer)("headcount").default(1),
    description: (0, pg_core_1.text)("description"),
    requirements: (0, pg_core_1.text)("requirements"),
    payRangeMin: (0, pg_core_1.integer)("pay_range_min"),
    payRangeMax: (0, pg_core_1.integer)("pay_range_max"),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    customFields: (0, pg_core_1.jsonb)("custom_fields"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
    createdBy: (0, pg_core_1.varchar)("created_by"),
});
// 2. CANDIDATES
// Can be linked to an internal Person (internal hire) or external.
exports.hrmRecCandidates = (0, pg_core_1.pgTable)("hrm_rec_candidates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    firstName: (0, pg_core_1.varchar)("first_name").notNull(),
    lastName: (0, pg_core_1.varchar)("last_name").notNull(),
    email: (0, pg_core_1.varchar)("email").notNull(),
    phone: (0, pg_core_1.varchar)("phone"),
    linkedPersonId: (0, pg_core_1.varchar)("linked_person_id").references(() => hr_worker_1.hrPersons.id), // If internal candidate
    resumeUrl: (0, pg_core_1.varchar)("resume_url"),
    linkedinUrl: (0, pg_core_1.varchar)("linkedin_url"),
    portfolioUrl: (0, pg_core_1.varchar)("portfolio_url"),
    skills: (0, pg_core_1.jsonb)("skills"), // Array of strings e.g. ["React", "Node"]
    experienceYears: (0, pg_core_1.integer)("experience_years"),
    source: (0, pg_core_1.varchar)("source"), // LinkedIn, Referral, CareerSite
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. JOB APPLICATIONS
exports.hrmRecApplications = (0, pg_core_1.pgTable)("hrm_rec_applications", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    candidateId: (0, pg_core_1.varchar)("candidate_id").notNull().references(() => exports.hrmRecCandidates.id),
    requisitionId: (0, pg_core_1.varchar)("requisition_id").notNull().references(() => exports.hrmRecRequisitions.id),
    status: (0, pg_core_1.varchar)("status").default("APPLIED"), // APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED, WITHDRAWN
    stage: (0, pg_core_1.varchar)("stage").default("NEW"), // More granular: 'Hiring Manager Review', 'Tech Interview'
    score: (0, pg_core_1.integer)("score"), // AI Ranking Score?
    notes: (0, pg_core_1.text)("notes"),
    appliedDate: (0, pg_core_1.timestamp)("applied_date").default((0, drizzle_orm_1.sql) `now()`),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 4. JOB OFFERS
exports.hrmRecOffers = (0, pg_core_1.pgTable)("hrm_rec_offers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    applicationId: (0, pg_core_1.varchar)("application_id").notNull().references(() => exports.hrmRecApplications.id),
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, PENDING_APPROVAL, APPROVED, SENT, ACCEPTED, REJECTED, NEGOTIATION
    // Offer Details
    baseSalary: (0, pg_core_1.integer)("base_salary").notNull(),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    stockOptions: (0, pg_core_1.integer)("stock_options"),
    bonusPercentage: (0, pg_core_1.integer)("bonus_percentage"),
    startDate: (0, pg_core_1.date)("start_date"),
    expirationDate: (0, pg_core_1.date)("expiration_date"),
    offerLetterUrl: (0, pg_core_1.varchar)("offer_letter_url"), // Generative PDF link
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 5. INTERVIEWS
exports.hrmRecInterviews = (0, pg_core_1.pgTable)("hrm_rec_interviews", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    applicationId: (0, pg_core_1.varchar)("application_id").notNull().references(() => exports.hrmRecApplications.id),
    interviewerId: (0, pg_core_1.varchar)("interviewer_id").notNull().references(() => hr_worker_1.hrPersons.id),
    scheduledTime: (0, pg_core_1.timestamp)("scheduled_time").notNull(),
    durationMinutes: (0, pg_core_1.integer)("duration_minutes").default(60),
    location: (0, pg_core_1.varchar)("location"), // "Zoom", "Office 301"
    status: (0, pg_core_1.varchar)("status").default("SCHEDULED"), // SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    feedback: (0, pg_core_1.text)("feedback"),
    rating: (0, pg_core_1.integer)("rating"), // 1-5
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 6. PIPELINE CONFIGURATION
exports.hrmRecPipelineTemplates = (0, pg_core_1.pgTable)("hrm_rec_pipeline_templates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(), // e.g., "Engineering Pipeline"
    description: (0, pg_core_1.text)("description"),
    isDefault: (0, pg_core_1.boolean)("is_default").default(false),
    departmentId: (0, pg_core_1.varchar)("department_id"), // Optional: Limit to specific dept
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.hrmRecPipelineStages = (0, pg_core_1.pgTable)("hrm_rec_pipeline_stages", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    templateId: (0, pg_core_1.varchar)("template_id").notNull().references(() => exports.hrmRecPipelineTemplates.id),
    name: (0, pg_core_1.varchar)("name").notNull(), // e.g., "Phone Screen"
    order: (0, pg_core_1.integer)("order").notNull(),
    type: (0, pg_core_1.varchar)("type").default("CUSTOM"), // SCREENING, INTERVIEW, OFFER, HIRED
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 7. EMAIL CONFIGURATION
exports.hrmRecEmailTemplates = (0, pg_core_1.pgTable)("hrm_rec_email_templates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(), // e.g., "Offer Letter"
    subject: (0, pg_core_1.varchar)("subject").notNull(),
    body: (0, pg_core_1.text)("body").notNull(),
    type: (0, pg_core_1.varchar)("type").notNull(), // OFFER, REJECTION, INTERVIEW_INVITE
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 8. ONBOARDING TASKS
exports.hrmRecOnboardingTasks = (0, pg_core_1.pgTable)("hrm_rec_onboarding_tasks", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    applicationId: (0, pg_core_1.varchar)("application_id").notNull().references(() => exports.hrmRecApplications.id),
    taskName: (0, pg_core_1.varchar)("task_name").notNull(),
    category: (0, pg_core_1.varchar)("category").notNull(), // IT, LEGAL, FACILITIES, HR
    status: (0, pg_core_1.varchar)("status").default("PENDING"), // PENDING, COMPLETED, SKIPPED
    assignedTo: (0, pg_core_1.varchar)("assigned_to"), // ID of person responsible (e.g., IT Admin)
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// SCHEMAS
exports.insertRequisitionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmRecRequisitions);
exports.insertCandidateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmRecCandidates);
exports.insertApplicationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmRecApplications);
exports.insertOfferSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmRecOffers);
exports.insertInterviewSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmRecInterviews);
exports.insertOnboardingTaskSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmRecOnboardingTasks);
// Config Schemas
exports.insertPipelineTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmRecPipelineTemplates);
exports.insertPipelineStageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmRecPipelineStages);
exports.insertEmailTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmRecEmailTemplates);
//# sourceMappingURL=talent_recruitment.js.map