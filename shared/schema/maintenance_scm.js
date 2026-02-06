"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMaintWorkOrderMaterialSchema = exports.maintWorkOrderMaterialsRelations = exports.maintWorkOrderMaterials = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const maintenance_1 = require("./maintenance");
const scm_1 = require("./scm");
// 10. Work Order Materials (Spare Parts / Consumables)
exports.maintWorkOrderMaterials = (0, pg_core_1.pgTable)("maint_work_order_materials", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    workOrderId: (0, pg_core_1.varchar)("work_order_id").references(() => maintenance_1.maintWorkOrders.id).notNull(),
    // Link to Inventory
    inventoryId: (0, pg_core_1.varchar)("inventory_id").references(() => scm_1.inventory.id).notNull(),
    // Planning
    plannedQuantity: (0, pg_core_1.integer)("planned_quantity").default(1),
    // Actuals
    actualQuantity: (0, pg_core_1.integer)("actual_quantity").default(0),
    unitCost: (0, pg_core_1.numeric)("unit_cost", { precision: 10, scale: 2 }), // Snapshot cost at issue
    // Status
    isReserved: (0, pg_core_1.varchar)("is_reserved").default("false"), // "true", "false"
    purchaseRequisitionLineId: (0, pg_core_1.varchar)("pr_line_id"), // Link to scm_purchase_requisition_lines
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.maintWorkOrderMaterialsRelations = (0, drizzle_orm_1.relations)(exports.maintWorkOrderMaterials, ({ one }) => ({
    workOrder: one(maintenance_1.maintWorkOrders, {
        fields: [exports.maintWorkOrderMaterials.workOrderId],
        references: [maintenance_1.maintWorkOrders.id],
    }),
    item: one(scm_1.inventory, {
        fields: [exports.maintWorkOrderMaterials.inventoryId],
        references: [scm_1.inventory.id],
    }),
}));
exports.insertMaintWorkOrderMaterialSchema = (0, drizzle_zod_1.createInsertSchema)(exports.maintWorkOrderMaterials);
//# sourceMappingURL=maintenance_scm.js.map