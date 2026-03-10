import { pgTable, varchar, timestamp, boolean, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== WORKFORCE STRUCTURES ==========

// 1. LOCATIONS
// Physical addresses for Orgs, Jobs, or Workers
export const hrLocations = pgTable("hr_locations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    code: varchar("code").notNull(),
    name: varchar("name").notNull(),
    description: varchar("description"),

    activeStatus: varchar("active_status").default("ACTIVE"), // ACTIVE, INACTIVE

    // Address details
    addressLine1: varchar("address_line_1"),
    addressLine2: varchar("address_line_2"),
    city: varchar("city"),
    state: varchar("state"),
    postalCode: varchar("postal_code"),
    country: varchar("country"), // ISO 2-char code

    // Meta
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 2. ORGANIZATIONS
// Departments, Divisions, Legal Employers, Business Units
export const hrOrganizations = pgTable("hr_organizations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(),
    classificationCode: varchar("classification_code").notNull(), // DEPT, DIV, LEGAL_EMPLOYER, BU, PSU

    locationId: varchar("location_id").references(() => hrLocations.id),
    managerId: varchar("manager_id"), // Link to Person (Nullable if person not migrated yet)

    activeStatus: varchar("active_status").default("ACTIVE"),

    // Legal Employer Details
    taxId: varchar("tax_id"), // TIN/EIN
    registrationNumber: varchar("registration_number"), // Company Registration Number
    legalAddressId: varchar("legal_address_id"), // If different from main location

    // Tree / Hierarchy Support
    parentId: varchar("parent_id"), // Ad-hoc tree for now

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 3. JOBS
// Generic roles (e.g., "Software Engineer", "Accountant") independent of department
export const hrJobs = pgTable("hr_jobs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    code: varchar("code").notNull(),
    name: varchar("name").notNull(),

    jobFamilyId: varchar("job_family_id"),
    validGradeId: varchar("valid_grade_id"), // Minimum grade?

    activeStatus: varchar("active_status").default("ACTIVE"),
    fullTimeEquivalent: numeric("fte", { precision: 5, scale: 2 }).default("1.0"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 4. GRADES
// Compensation levels and steps
export const hrGrades = pgTable("hr_grades", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    code: varchar("code").notNull(),
    name: varchar("name").notNull(),

    payScaleId: varchar("pay_scale_id"),

    // Salary Bands (for CompaRatio calculation)
    minSalary: numeric("min_salary", { precision: 15, scale: 2 }),
    midSalary: numeric("mid_salary", { precision: 15, scale: 2 }),
    maxSalary: numeric("max_salary", { precision: 15, scale: 2 }),
    salaryCurrency: varchar("salary_currency").default("USD"),

    activeStatus: varchar("active_status").default("ACTIVE"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 4.1 GRADE STEPS (Pay Progression within a Grade)
export const hrGradeSteps = pgTable("hr_grade_steps", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    gradeId: varchar("grade_id").notNull().references(() => hrGrades.id),
    stepNumber: integer("step_number").notNull(), // 1, 2, 3...
    description: varchar("description"), // e.g. "Step 1 — Entry"

    salary: numeric("salary", { precision: 15, scale: 2 }).notNull(),
    currency: varchar("currency").default("USD"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 5.5 JOB FAMILIES
export const hrJobFamilies = pgTable("hr_job_families", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    code: varchar("code").notNull(),
    name: varchar("name").notNull(), // Technology, Finance, HR
    description: varchar("description"),

    activeStatus: varchar("active_status").default("ACTIVE"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 5.6 JOB PROFILES (Competency-linked role specification)
export const hrJobProfiles = pgTable("hr_job_profiles", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    jobFamilyId: varchar("job_family_id").notNull().references(() => hrJobFamilies.id),
    jobId: varchar("job_id").references(() => hrJobs.id), // Optional link to specific job

    name: varchar("name").notNull(), // e.g. "Sr. Software Engineer Profile"
    gradeRangeMin: varchar("grade_range_min"), // e.g. IC4
    gradeRangeMax: varchar("grade_range_max"), // e.g. IC5

    // Required competencies: [{ competency: string, proficiency: string }]
    requiredCompetencies: jsonb("required_competencies"),

    activeStatus: varchar("active_status").default("ACTIVE"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 5. POSITIONS
// Specific instances of a Job in a Dept (e.g., "Senior SE in Platform Team")
// Strict Interaction: Job + Dept + Location
export const hrPositions = pgTable("hr_positions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    code: varchar("code").notNull(),
    name: varchar("name").notNull(),

    // Core connections
    jobId: varchar("job_id").notNull().references(() => hrJobs.id),
    departmentId: varchar("department_id").notNull().references(() => hrOrganizations.id),
    locationId: varchar("location_id").references(() => hrLocations.id),

    // Headcount controls
    headcount: integer("headcount").default(1),
    hiringStatus: varchar("hiring_status").default("OPEN"), // OPEN, FROZEN, CLOSED

    // Valid Grades for this position
    validGrades: jsonb("valid_grades"), // Array of Grade IDs

    activeStatus: varchar("active_status").default("ACTIVE"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// SCHEMAS

export const insertLocationSchema = createInsertSchema(hrLocations);
export const insertOrganizationSchema = createInsertSchema(hrOrganizations);
export const insertJobSchema = createInsertSchema(hrJobs);
export const insertGradeSchema = createInsertSchema(hrGrades);
export const insertGradeStepSchema = createInsertSchema(hrGradeSteps);
export const insertPositionSchema = createInsertSchema(hrPositions);
export const insertJobFamilySchema = createInsertSchema(hrJobFamilies);
export const insertJobProfileSchema = createInsertSchema(hrJobProfiles);

export type HrLocation = typeof hrLocations.$inferSelect;
export type HrOrganization = typeof hrOrganizations.$inferSelect;
export type HrJob = typeof hrJobs.$inferSelect;
export type HrGrade = typeof hrGrades.$inferSelect;
export type HrGradeStep = typeof hrGradeSteps.$inferSelect;
export type HrPosition = typeof hrPositions.$inferSelect;
export type HrJobFamily = typeof hrJobFamilies.$inferSelect;
export type HrJobProfile = typeof hrJobProfiles.$inferSelect;
