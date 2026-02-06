"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMaintWorkOrderCostSchema = exports.maintWorkOrderCostsRelations = exports.maintWorkOrderCosts = exports.maintGlStatusEnum = exports.maintCostTypeEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const maintenance_1 = require("./maintenance");
exports.maintCostTypeEnum = (0, pg_core_1.pgEnum)("maint_cost_type", [
    "MATERIAL",
    "LABOR",
    "OVERHEAD",
    "OUTSIDE_PROCESSING"
]);
exports.maintGlStatusEnum = (0, pg_core_1.pgEnum)("maint_gl_status", [
    "PENDING",
    "POSTED",
    "ERROR"
]);
exports.maintWorkOrderCosts = (0, pg_core_1.pgTable)("maint_work_order_costs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    workOrderId: (0, pg_core_1.varchar)("work_order_id").references(() => maintenance_1.maintWorkOrders.id).notNull(),
    costType: (0, pg_core_1.varchar)("cost_type", { length: 30 }).notNull(), // MATERIAL, LABOR...
    description: (0, pg_core_1.text)("description"), // e.g. "Bearing 6205 x 2"
    quantity: (0, pg_core_1.numeric)("quantity"),
    unitCost: (0, pg_core_1.numeric)("unit_cost"),
    totalCost: (0, pg_core_1.numeric)("total_cost").notNull(),
    currency: (0, pg_core_1.varchar)("currency", { length: 3 }).default("USD"),
    sourceReference: (0, pg_core_1.varchar)("source_reference"), // ID of material issue or labor log
    date: (0, pg_core_1.timestamp)("date").defaultNow(),
    glStatus: (0, pg_core_1.varchar)("gl_status", { length: 20 }).default("PENDING"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.maintWorkOrderCostsRelations = (0, drizzle_orm_1.relations)(exports.maintWorkOrderCosts, ({ one }) => ({
    workOrder: one(maintenance_1.maintWorkOrders, {
        fields: [exports.maintWorkOrderCosts.workOrderId],
        references: [maintenance_1.maintWorkOrders.id],
    }),
}));
exports.insertMaintWorkOrderCostSchema = (0, drizzle_zod_1.createInsertSchema)(exports.maintWorkOrderCosts);
//# sourceMappingURL=maintenance_costing.js.map