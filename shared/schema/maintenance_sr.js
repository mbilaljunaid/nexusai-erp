"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMaintServiceRequestSchema = exports.maintServiceRequestsRelations = exports.maintServiceRequests = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const fixedAssets_1 = require("./fixedAssets");
const common_1 = require("./common"); // This might still be wrong if users.ts doesn't exist, will check find_by_name result.
const maintenance_1 = require("./maintenance");
// 9. Service Requests (Breakdowns / Ticketing)
exports.maintServiceRequests = (0, pg_core_1.pgTable)("maint_service_requests", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    requestNumber: (0, pg_core_1.varchar)("request_number", { length: 50 }).notNull().unique(), // SR-2026-X
    description: (0, pg_core_1.text)("description").notNull(),
    priority: (0, pg_core_1.varchar)("priority", { length: 20 }).default("NORMAL"), // LOW, NORMAL, HIGH, CRITICAL
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("NEW"), // NEW, IN_REVIEW, CONVERTED, REJECTED, CLOSED
    // Links
    assetId: (0, pg_core_1.varchar)("asset_id").references(() => fixedAssets_1.faAssets.id).notNull(),
    requestedBy: (0, pg_core_1.varchar)("requested_by").references(() => common_1.users.id), // If authenticated
    workOrderId: (0, pg_core_1.varchar)("work_order_id").references(() => maintenance_1.maintWorkOrders.id), // Link to created WO
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.maintServiceRequestsRelations = (0, drizzle_orm_1.relations)(exports.maintServiceRequests, ({ one }) => ({
    asset: one(fixedAssets_1.faAssets, {
        fields: [exports.maintServiceRequests.assetId],
        references: [fixedAssets_1.faAssets.id],
    }),
    requester: one(common_1.users, {
        fields: [exports.maintServiceRequests.requestedBy],
        references: [common_1.users.id],
    }),
    workOrder: one(maintenance_1.maintWorkOrders, {
        fields: [exports.maintServiceRequests.workOrderId],
        references: [maintenance_1.maintWorkOrders.id],
    }),
}));
exports.insertMaintServiceRequestSchema = (0, drizzle_zod_1.createInsertSchema)(exports.maintServiceRequests);
//# sourceMappingURL=maintenance_sr.js.map