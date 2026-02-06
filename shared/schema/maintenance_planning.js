"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMaintWorkCenterSchema = exports.maintWorkCentersRelations = exports.maintWorkCenters = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const maintenance_1 = require("./maintenance");
exports.maintWorkCenters = (0, pg_core_1.pgTable)("maint_work_centers", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    code: (0, pg_core_1.varchar)("code", { length: 50 }).notNull().unique(), // e.g. "MECH", "ELEC"
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    plantId: (0, pg_core_1.varchar)("plant_id"), // Optional: For multi-plant support in future
    capacityPerDay: (0, pg_core_1.numeric)("capacity_per_day").default("24"), // Hours available per day (e.g. 3 shifts * 8 = 24)
    active: (0, pg_core_1.boolean)("active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.maintWorkCentersRelations = (0, drizzle_orm_1.relations)(exports.maintWorkCenters, ({ many }) => ({
    operations: many(maintenance_1.maintWorkOrderOperations),
}));
exports.insertMaintWorkCenterSchema = (0, drizzle_zod_1.createInsertSchema)(exports.maintWorkCenters);
//# sourceMappingURL=maintenance_planning.js.map