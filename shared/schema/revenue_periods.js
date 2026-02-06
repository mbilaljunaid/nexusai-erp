"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertRevenuePeriodSchema = exports.revenuePeriods = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
exports.revenuePeriods = (0, pg_core_1.pgTable)("revenue_periods", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    periodName: (0, pg_core_1.varchar)("period_name").notNull(), // e.g. "Jan-2026"
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date").notNull(),
    status: (0, pg_core_1.varchar)("status").default("Open"), // Open, Closed, Permanently Closed
    closedAt: (0, pg_core_1.timestamp)("closed_at"),
    closedBy: (0, pg_core_1.varchar)("closed_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertRevenuePeriodSchema = (0, drizzle_zod_1.createInsertSchema)(exports.revenuePeriods);
//# sourceMappingURL=revenue_periods.js.map