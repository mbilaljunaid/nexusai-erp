
import { pgTable, text, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

/**
 * Maintenance Failure Codes (L3)
 * Implements a Problem -> Cause -> Remedy hierarchy for reliability reporting.
 */
export const maintFailureCodes = pgTable("maint_failure_codes", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    code: varchar("code", { length: 50 }).notNull().unique(), // e.g., OVERHEAT
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),

    // Type: PROBLEM, CAUSE, REMEDY
    type: varchar("type", { length: 20 }).notNull(),

    // Hierarchy
    parentId: varchar("parent_id"), // Link to parent for hierarchy (e.g. Cause linked to Problem)

    active: varchar("active", { length: 1 }).default("Y"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const maintFailureCodesRelations = relations(maintFailureCodes, ({ one, many }) => ({
    parent: one(maintFailureCodes, {
        fields: [maintFailureCodes.parentId],
        references: [maintFailureCodes.id],
        relationName: "failure_hierarchy",
    }),
    children: many(maintFailureCodes, {
        relationName: "failure_hierarchy",
    }),
}));
