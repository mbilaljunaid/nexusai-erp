"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMaintWorkOrderResourceSchema = exports.maintWorkOrderResourcesRelations = exports.maintWorkOrderResources = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const maintenance_1 = require("./maintenance");
const common_1 = require("./common");
// 11. Work Order Resources (Labor)
exports.maintWorkOrderResources = (0, pg_core_1.pgTable)("maint_work_order_resources", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    workOrderId: (0, pg_core_1.varchar)("work_order_id").references(() => maintenance_1.maintWorkOrders.id).notNull(),
    // Technician
    userId: (0, pg_core_1.varchar)("user_id").references(() => common_1.users.id).notNull(),
    // Planning
    plannedHours: (0, pg_core_1.numeric)("planned_hours", { precision: 5, scale: 2 }).default("0"),
    // Actuals
    actualHours: (0, pg_core_1.numeric)("actual_hours", { precision: 5, scale: 2 }).default("0"),
    hourlyRate: (0, pg_core_1.numeric)("hourly_rate", { precision: 10, scale: 2 }), // Snapshot rate
    // Status
    status: (0, pg_core_1.varchar)("status").default("ASSIGNED"), // ASSIGNED, IN_PROGRESS, COMPLETED
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.maintWorkOrderResourcesRelations = (0, drizzle_orm_1.relations)(exports.maintWorkOrderResources, ({ one }) => ({
    workOrder: one(maintenance_1.maintWorkOrders, {
        fields: [exports.maintWorkOrderResources.workOrderId],
        references: [maintenance_1.maintWorkOrders.id],
    }),
    technician: one(common_1.users, {
        fields: [exports.maintWorkOrderResources.userId],
        references: [common_1.users.id],
    }),
}));
exports.insertMaintWorkOrderResourceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.maintWorkOrderResources);
//# sourceMappingURL=maintenance_res.js.map