"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintFailureCodesRelations = exports.maintFailureCodes = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * Maintenance Failure Codes (L3)
 * Implements a Problem -> Cause -> Remedy hierarchy for reliability reporting.
 */
exports.maintFailureCodes = (0, pg_core_1.pgTable)("maint_failure_codes", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    code: (0, pg_core_1.varchar)("code", { length: 50 }).notNull().unique(), // e.g., OVERHEAT
    name: (0, pg_core_1.varchar)("name", { length: 150 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    // Type: PROBLEM, CAUSE, REMEDY
    type: (0, pg_core_1.varchar)("type", { length: 20 }).notNull(),
    // Hierarchy
    parentId: (0, pg_core_1.varchar)("parent_id"), // Link to parent for hierarchy (e.g. Cause linked to Problem)
    active: (0, pg_core_1.varchar)("active", { length: 1 }).default("Y"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.maintFailureCodesRelations = (0, drizzle_orm_1.relations)(exports.maintFailureCodes, ({ one, many }) => ({
    parent: one(exports.maintFailureCodes, {
        fields: [exports.maintFailureCodes.parentId],
        references: [exports.maintFailureCodes.id],
        relationName: "failure_hierarchy",
    }),
    children: many(exports.maintFailureCodes, {
        relationName: "failure_hierarchy",
    }),
}));
//# sourceMappingURL=maintenance_failure.js.map