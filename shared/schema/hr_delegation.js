"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertHrDelegationSchema = exports.hrDelegations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
exports.hrDelegations = (0, pg_core_1.pgTable)("hr_delegations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    managerId: (0, pg_core_1.varchar)("manager_id").notNull(), // The manager delegating authority
    proxyId: (0, pg_core_1.varchar)("proxy_id").notNull(), // The person receiving authority
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    canApproveTransitions: (0, pg_core_1.boolean)("can_approve_transitions").default(true),
    canViewTeamAnalytics: (0, pg_core_1.boolean)("can_view_team_analytics").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertHrDelegationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrDelegations);
//# sourceMappingURL=hr_delegation.js.map