"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertAssignmentSchema = exports.insertWorkRelationshipSchema = exports.insertPersonSchema = exports.hrAssignments = exports.hrWorkRelationships = exports.hrPersons = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const hr_structures_1 = require("./hr_structures");
// ========== WORKER MODEL (Oracle Fusion Style) ==========
// 1. PERSON (The Human)
// 2. WORK RELATIONSHIP (The Contract with Legal Employer)
// 3. ASSIGNMENT (The Role/Job/Position)
// 1. PERSONS
// Unique record for the human being. Immutable ID across rehires.
exports.hrPersons = (0, pg_core_1.pgTable)("hr_persons", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    personNumber: (0, pg_core_1.varchar)("person_number").notNull().unique(), // User-facing ID (e.g. 10045)
    // Biological / Bio-Demographic
    firstName: (0, pg_core_1.varchar)("first_name").notNull(),
    middleName: (0, pg_core_1.varchar)("middle_name"),
    lastName: (0, pg_core_1.varchar)("last_name").notNull(),
    dateOfBirth: (0, pg_core_1.date)("date_of_birth"),
    nationalId: (0, pg_core_1.varchar)("national_id"), // SSN, NIN. Should be encrypted in real app.
    country: (0, pg_core_1.varchar)("country").default("US"), // For Regional Rules (e.g. US, UK, AE)
    // Contact
    gender: (0, pg_core_1.varchar)("gender").default("U"), // M=Male, F=Female, U=Unknown/Other
    email: (0, pg_core_1.varchar)("email"), // Personal or Work? Usually Work Email here, but Fusion separates.
    phone: (0, pg_core_1.varchar)("phone"),
    userId: (0, pg_core_1.varchar)("user_id"), // Link to System User (Authentication)
    createdBy: (0, pg_core_1.varchar)("created_by"),
    updatedBy: (0, pg_core_1.varchar)("updated_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. WORK RELATIONSHIPS
// Connects a Person to a Legal Employer.
// A person can have multiple relationships (e.g., Ex-Employee + Contingent Worker).
exports.hrWorkRelationships = (0, pg_core_1.pgTable)("hr_work_relationships", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    personId: (0, pg_core_1.varchar)("person_id").notNull().references(() => exports.hrPersons.id),
    legalEmployerId: (0, pg_core_1.varchar)("legal_employer_id").notNull().references(() => hr_structures_1.hrOrganizations.id),
    dateStart: (0, pg_core_1.date)("date_start").notNull(),
    workerType: (0, pg_core_1.varchar)("worker_type").default("EMPLOYEE"), // EMPLOYEE, CONTINGENT, PENDING_WORKER
    primaryFlag: (0, pg_core_1.boolean)("primary_flag").default(true), // Main relationship
    terminationDate: (0, pg_core_1.date)("termination_date"), // Null if active
    createdBy: (0, pg_core_1.varchar)("created_by"),
    updatedBy: (0, pg_core_1.varchar)("updated_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. ASSIGNMENTS
// The actual job execution context.
// Captures "WHO does WHAT, WHERE, for WHOM".
// This table should technically be date-effective (row per time slice), 
// but for V1 we will use "Current State" with "Effective Start/End" fields for future history support.
exports.hrAssignments = (0, pg_core_1.pgTable)("hr_assignments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    workRelationshipId: (0, pg_core_1.varchar)("work_relationship_id").notNull().references(() => exports.hrWorkRelationships.id),
    personId: (0, pg_core_1.varchar)("person_id").notNull().references(() => exports.hrPersons.id), // Denormalized for query speeed
    assignmentNumber: (0, pg_core_1.varchar)("assignment_number").notNull(), // E10045-1, E10045-2
    assignmentStatus: (0, pg_core_1.varchar)("assignment_status").default("ACTIVE"), // ACTIVE, SUSPENDED, INACTIVE
    assignmentType: (0, pg_core_1.varchar)("assignment_type").default("E"), // E=Employee, C=Contingent
    // Workforce Structures Links
    jobId: (0, pg_core_1.varchar)("job_id").references(() => hr_structures_1.hrJobs.id),
    positionId: (0, pg_core_1.varchar)("position_id").references(() => hr_structures_1.hrPositions.id),
    gradeId: (0, pg_core_1.varchar)("grade_id").references(() => hr_structures_1.hrGrades.id),
    departmentId: (0, pg_core_1.varchar)("department_id").references(() => hr_structures_1.hrOrganizations.id),
    locationId: (0, pg_core_1.varchar)("location_id").references(() => hr_structures_1.hrLocations.id),
    managerId: (0, pg_core_1.varchar)("manager_id").references(() => exports.hrPersons.id), // Line Manager
    // Details
    primaryAssignmentFlag: (0, pg_core_1.boolean)("primary_assignment_flag").default(true),
    fullTimeEquivalent: (0, pg_core_1.numeric)("fte", { precision: 5, scale: 2 }).default("1.0"),
    // Effective Date Simulation (for now, latest active row)
    effectiveStartDate: (0, pg_core_1.date)("effective_start_date").notNull(),
    effectiveEndDate: (0, pg_core_1.date)("effective_end_date"), // Null = End of Time (4712-12-31)
    createdBy: (0, pg_core_1.varchar)("created_by"),
    updatedBy: (0, pg_core_1.varchar)("updated_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// SCHEMAS
exports.insertPersonSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrPersons);
exports.insertWorkRelationshipSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrWorkRelationships);
exports.insertAssignmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrAssignments);
//# sourceMappingURL=hr_worker.js.map