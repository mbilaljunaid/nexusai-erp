"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertAorSchema = exports.hrAor = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// ========== SECURITY PROFILES (AOR) ==========
// Defines which data a user can see/manage
exports.hrAor = (0, pg_core_1.pgTable)("hr_aor", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    personId: (0, pg_core_1.varchar)("person_id").notNull(), // The HR User/Manager
    scopeType: (0, pg_core_1.varchar)("scope_type").notNull(), // LEGAL_EMPLOYER, DEPARTMENT, LOCATION, BUSINESS_UNIT
    scopeValueId: (0, pg_core_1.varchar)("scope_value_id").notNull(), // The ID of the Dept/LE
    responsibilityType: (0, pg_core_1.varchar)("responsibility_type"), // HR_REP, PAYROLL_REP, BENEFITS_REP
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertAorSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrAor);
//# sourceMappingURL=hr_aor.js.map