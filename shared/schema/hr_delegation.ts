import { pgTable, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

export const hrDelegations = pgTable("hr_delegations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    managerId: varchar("manager_id").notNull(), // The manager delegating authority
    proxyId: varchar("proxy_id").notNull(), // The person receiving authority

    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),

    isActive: boolean("is_active").default(true),

    canApproveTransitions: boolean("can_approve_transitions").default(true),
    canViewTeamAnalytics: boolean("can_view_team_analytics").default(false),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertHrDelegationSchema = createInsertSchema(hrDelegations);
export type HrDelegation = typeof hrDelegations.$inferSelect;
export type NewHrDelegation = typeof hrDelegations.$inferInsert;
