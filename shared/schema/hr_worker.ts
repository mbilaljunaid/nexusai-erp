import { pgTable, varchar, timestamp, boolean, integer, numeric, date, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { hrOrganizations, hrJobs, hrPositions, hrGrades, hrLocations } from "./hr_structures";
import { z } from "zod";

// ========== WORKER MODEL (Oracle Fusion Style) ==========
// 1. PERSON (The Human)
// 2. WORK RELATIONSHIP (The Contract with Legal Employer)
// 3. ASSIGNMENT (The Role/Job/Position)

// 1. PERSONS
// Unique record for the human being. Immutable ID across rehires.
export const hrPersons = pgTable("hr_persons", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    personNumber: varchar("person_number").notNull().unique(), // User-facing ID (e.g. 10045)

    // Biological / Bio-Demographic
    firstName: varchar("first_name").notNull(),
    middleName: varchar("middle_name"),
    lastName: varchar("last_name").notNull(),

    dateOfBirth: date("date_of_birth"),
    nationalId: varchar("national_id"), // SSN, NIN. Should be encrypted in real app.
    country: varchar("country").default("US"), // For Regional Rules (e.g. US, UK, AE)

    // Contact
    gender: varchar("gender").default("U"), // M=Male, F=Female, U=Unknown/Other
    email: varchar("email"), // Personal or Work? Usually Work Email here, but Fusion separates.
    phone: varchar("phone"),

    userId: varchar("user_id"), // Link to System User (Authentication)

    createdBy: varchar("created_by"),
    updatedBy: varchar("updated_by"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 2. WORK RELATIONSHIPS
// Connects a Person to a Legal Employer.
// A person can have multiple relationships (e.g., Ex-Employee + Contingent Worker).
export const hrWorkRelationships = pgTable("hr_work_relationships", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    personId: varchar("person_id").notNull().references(() => hrPersons.id),
    legalEmployerId: varchar("legal_employer_id").notNull().references(() => hrOrganizations.id),
    entLegalEntityId: varchar("ent_legal_entity_id"), // Added for global enterprise scoping

    dateStart: date("date_start").notNull(),
    workerType: varchar("worker_type").default("EMPLOYEE"), // EMPLOYEE, CONTINGENT, PENDING_WORKER

    primaryFlag: boolean("primary_flag").default(true), // Main relationship

    terminationDate: date("termination_date"), // Null if active

    createdBy: varchar("created_by"),
    updatedBy: varchar("updated_by"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 3. ASSIGNMENTS
// The actual job execution context.
// Captures "WHO does WHAT, WHERE, for WHOM".
// This table should technically be date-effective (row per time slice), 
// but for V1 we will use "Current State" with "Effective Start/End" fields for future history support.
export const hrAssignments = pgTable("hr_assignments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    workRelationshipId: varchar("work_relationship_id").notNull().references(() => hrWorkRelationships.id),
    personId: varchar("person_id").notNull().references(() => hrPersons.id), // Denormalized for query speeed
    entLegalEntityId: varchar("ent_legal_entity_id"), // Scoping to specific LE

    assignmentNumber: varchar("assignment_number").notNull(), // E10045-1, E10045-2
    assignmentStatus: varchar("assignment_status").default("ACTIVE"), // ACTIVE, SUSPENDED, INACTIVE
    assignmentType: varchar("assignment_type").default("E"), // E=Employee, C=Contingent

    // Workforce Structures Links
    jobId: varchar("job_id").references(() => hrJobs.id),
    positionId: varchar("position_id").references(() => hrPositions.id),
    gradeId: varchar("grade_id").references(() => hrGrades.id),
    departmentId: varchar("department_id").references(() => hrOrganizations.id),
    locationId: varchar("location_id").references(() => hrLocations.id),

    managerId: varchar("manager_id").references(() => hrPersons.id), // Line Manager

    // Details
    primaryAssignmentFlag: boolean("primary_assignment_flag").default(true),
    fullTimeEquivalent: numeric("fte", { precision: 5, scale: 2 }).default("1.0"),

    // Oracle-parity fields
    probationEndDate: date("probation_end_date"),
    workingHoursPerWeek: numeric("working_hours_per_week", { precision: 4, scale: 1 }).default("40.0"),
    gradeStepId: varchar("grade_step_id"), // References hrGradeSteps (loose ref to avoid circular dep)

    // Effective Date Simulation (for now, latest active row)
    effectiveStartDate: date("effective_start_date").notNull(),
    effectiveEndDate: date("effective_end_date"), // Null = End of Time (4712-12-31)

    createdBy: varchar("created_by"),
    updatedBy: varchar("updated_by"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// DateTrack History Table — stores each effective-dated version of an assignment
// Each Correction/Update/Future-Date action inserts a new row with its own effectiveStartDate.
// The current "live" row is the one where effectiveStartDate <= SYSDATE < effectiveEndDate.
export const hrAssignmentHistory = pgTable("hr_assignment_history", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    assignmentId: varchar("assignment_id", { length: 36 }).notNull().references(() => hrAssignments.id, { onDelete: "cascade" }),

    // DateTrack metadata
    dateTrackMode: varchar("datetrack_mode", { length: 20 }).notNull(), // 'CORRECTION' | 'UPDATE' | 'FUTURE'
    effectiveStartDate: date("effective_start_date").notNull(),
    effectiveEndDate: date("effective_end_date"),   // null = 4712-12-31 (end of time)

    // Snapshot of assignment values at this effective date
    jobId: varchar("job_id", { length: 36 }),
    positionId: varchar("position_id", { length: 36 }),
    gradeId: varchar("grade_id", { length: 36 }),
    departmentId: varchar("department_id", { length: 36 }),
    locationId: varchar("location_id", { length: 36 }),
    managerId: varchar("manager_id", { length: 36 }),
    gradeStepId: varchar("grade_step_id", { length: 36 }),
    fullTimeEquivalent: numeric("fte", { precision: 5, scale: 2 }),
    workingHoursPerWeek: numeric("working_hours_per_week", { precision: 4, scale: 1 }),
    probationEndDate: date("probation_end_date"),

    // Audit trail
    changedBy: varchar("changed_by", { length: 255 }),
    changeReason: text("change_reason"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// SCHEMAS

export const insertPersonSchema = createInsertSchema(hrPersons);
export const insertWorkRelationshipSchema = createInsertSchema(hrWorkRelationships);
export const insertAssignmentSchema = createInsertSchema(hrAssignments);
export const insertAssignmentHistorySchema = createInsertSchema(hrAssignmentHistory);

export type HrPerson = typeof hrPersons.$inferSelect;
export type HrWorkRelationship = typeof hrWorkRelationships.$inferSelect;
export type HrAssignment = typeof hrAssignments.$inferSelect;
export type HrAssignmentHistory = typeof hrAssignmentHistory.$inferSelect;

