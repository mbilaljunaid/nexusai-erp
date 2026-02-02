import { pgTable, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// ========== SECURITY PROFILES (AOR) ==========
// Defines which data a user can see/manage

export const hrAor = pgTable("hr_aor", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    personId: varchar("person_id").notNull(), // The HR User/Manager

    scopeType: varchar("scope_type").notNull(), // LEGAL_EMPLOYER, DEPARTMENT, LOCATION, BUSINESS_UNIT
    scopeValueId: varchar("scope_value_id").notNull(), // The ID of the Dept/LE

    responsibilityType: varchar("responsibility_type"), // HR_REP, PAYROLL_REP, BENEFITS_REP

    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAorSchema = createInsertSchema(hrAor);
export type HrAor = typeof hrAor.$inferSelect;
