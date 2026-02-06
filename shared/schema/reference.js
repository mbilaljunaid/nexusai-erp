"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertFndLookupValueSchema = exports.insertFndLookupTypeSchema = exports.fndLookupValues = exports.fndLookupTypes = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ==========================================
// 1. FND_LOOKUP_TYPES (Header)
// ==========================================
exports.fndLookupTypes = (0, pg_core_1.pgTable)("fnd_lookup_types", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    lookupType: (0, pg_core_1.varchar)("lookup_type", { length: 30 }).notNull().unique(), // e.g., 'HZ_PARTY_TYPE'
    applicationId: (0, pg_core_1.varchar)("application_id"), // Module ID
    userLookupName: (0, pg_core_1.varchar)("user_lookup_name").notNull(), // User friendly name
    description: (0, pg_core_1.text)("description"),
    customizationLevel: (0, pg_core_1.varchar)("customization_level", { length: 1 }).default("U"), // U=User, S=System, E=Extensible
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// 2. FND_LOOKUP_VALUES (Detail)
// ==========================================
exports.fndLookupValues = (0, pg_core_1.pgTable)("fnd_lookup_values", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    lookupTypeId: (0, pg_core_1.varchar)("lookup_type_id").references(() => exports.fndLookupTypes.id).notNull(),
    lookupCode: (0, pg_core_1.varchar)("lookup_code", { length: 30 }).notNull(), // e.g., 'ORGANIZATION'
    meaning: (0, pg_core_1.varchar)("meaning").notNull(), // Display Value
    description: (0, pg_core_1.text)("description"),
    enabledFlag: (0, pg_core_1.boolean)("enabled_flag").default(true),
    startDateActive: (0, pg_core_1.timestamp)("start_date_active"),
    endDateActive: (0, pg_core_1.timestamp)("end_date_active"),
    sortOrder: (0, pg_core_1.integer)("sort_order"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// Zod Schemas
// ==========================================
exports.insertFndLookupTypeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.fndLookupTypes).extend({
    lookupType: zod_1.z.string().min(1),
    userLookupName: zod_1.z.string().min(1),
});
exports.insertFndLookupValueSchema = (0, drizzle_zod_1.createInsertSchema)(exports.fndLookupValues).extend({
    lookupTypeId: zod_1.z.string().min(1),
    lookupCode: zod_1.z.string().min(1),
    meaning: zod_1.z.string().min(1),
});
//# sourceMappingURL=reference.js.map