"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertPositionSchema = exports.insertGradeSchema = exports.insertJobSchema = exports.insertOrganizationSchema = exports.insertLocationSchema = exports.hrPositions = exports.hrGrades = exports.hrJobs = exports.hrOrganizations = exports.hrLocations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// ========== WORKFORCE STRUCTURES ==========
// 1. LOCATIONS
// Physical addresses for Orgs, Jobs, or Workers
exports.hrLocations = (0, pg_core_1.pgTable)("hr_locations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    code: (0, pg_core_1.varchar)("code").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.varchar)("description"),
    activeStatus: (0, pg_core_1.varchar)("active_status").default("ACTIVE"), // ACTIVE, INACTIVE
    // Address details
    addressLine1: (0, pg_core_1.varchar)("address_line_1"),
    addressLine2: (0, pg_core_1.varchar)("address_line_2"),
    city: (0, pg_core_1.varchar)("city"),
    state: (0, pg_core_1.varchar)("state"),
    postalCode: (0, pg_core_1.varchar)("postal_code"),
    country: (0, pg_core_1.varchar)("country"), // ISO 2-char code
    // Meta
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. ORGANIZATIONS
// Departments, Divisions, Legal Employers, Business Units
exports.hrOrganizations = (0, pg_core_1.pgTable)("hr_organizations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    classificationCode: (0, pg_core_1.varchar)("classification_code").notNull(), // DEPT, DIV, LEGAL_EMPLOYER, BU, PSU
    locationId: (0, pg_core_1.varchar)("location_id").references(() => exports.hrLocations.id),
    managerId: (0, pg_core_1.varchar)("manager_id"), // Link to Person (Nullable if person not migrated yet)
    activeStatus: (0, pg_core_1.varchar)("active_status").default("ACTIVE"),
    // Legal Employer Details
    taxId: (0, pg_core_1.varchar)("tax_id"), // TIN/EIN
    registrationNumber: (0, pg_core_1.varchar)("registration_number"), // Company Registration Number
    legalAddressId: (0, pg_core_1.varchar)("legal_address_id"), // If different from main location
    // Tree / Hierarchy Support
    parentId: (0, pg_core_1.varchar)("parent_id"), // Ad-hoc tree for now
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. JOBS
// Generic roles (e.g., "Software Engineer", "Accountant") independent of department
exports.hrJobs = (0, pg_core_1.pgTable)("hr_jobs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    code: (0, pg_core_1.varchar)("code").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    jobFamilyId: (0, pg_core_1.varchar)("job_family_id"),
    validGradeId: (0, pg_core_1.varchar)("valid_grade_id"), // Minimum grade?
    activeStatus: (0, pg_core_1.varchar)("active_status").default("ACTIVE"),
    fullTimeEquivalent: (0, pg_core_1.numeric)("fte", { precision: 5, scale: 2 }).default("1.0"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 4. GRADES
// Compensation levels and steps
exports.hrGrades = (0, pg_core_1.pgTable)("hr_grades", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    code: (0, pg_core_1.varchar)("code").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    payScaleId: (0, pg_core_1.varchar)("pay_scale_id"),
    activeStatus: (0, pg_core_1.varchar)("active_status").default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 5. POSITIONS
// Specific instances of a Job in a Dept (e.g., "Senior SE in Platform Team")
// Strict Interaction: Job + Dept + Location
exports.hrPositions = (0, pg_core_1.pgTable)("hr_positions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    code: (0, pg_core_1.varchar)("code").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    // Core connections
    jobId: (0, pg_core_1.varchar)("job_id").notNull().references(() => exports.hrJobs.id),
    departmentId: (0, pg_core_1.varchar)("department_id").notNull().references(() => exports.hrOrganizations.id),
    locationId: (0, pg_core_1.varchar)("location_id").references(() => exports.hrLocations.id),
    // Headcount controls
    headcount: (0, pg_core_1.integer)("headcount").default(1),
    hiringStatus: (0, pg_core_1.varchar)("hiring_status").default("OPEN"), // OPEN, FROZEN, CLOSED
    // Valid Grades for this position
    validGrades: (0, pg_core_1.jsonb)("valid_grades"), // Array of Grade IDs
    activeStatus: (0, pg_core_1.varchar)("active_status").default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// SCHEMAS
exports.insertLocationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrLocations);
exports.insertOrganizationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrOrganizations);
exports.insertJobSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrJobs);
exports.insertGradeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrGrades);
exports.insertPositionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrPositions);
//# sourceMappingURL=hr_structures.js.map