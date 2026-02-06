"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructionResourceAllocations = exports.constructionResources = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const ppm_1 = require("./ppm");
exports.constructionResources = (0, pg_core_1.pgTable)("construction_resources", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    type: (0, pg_core_1.varchar)("type").notNull(), // LABOR, EQUIPMENT, MATERIAL
    category: (0, pg_core_1.varchar)("category"), // e.g. Operator, Excavator, Structural Steel
    hourlyRate: (0, pg_core_1.numeric)("hourly_rate", { precision: 18, scale: 2 }),
    unitOfMeasure: (0, pg_core_1.varchar)("uom").default("HOUR"), // HOUR, DAY, TON, etc.
    status: (0, pg_core_1.varchar)("status").default("AVAILABLE"), // AVAILABLE, IN_USE, MAINTENANCE, RETIRED
    metadata: (0, pg_core_1.varchar)("metadata"), // JSON-like string for specific details (serial numbers, certifications)
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.constructionResourceAllocations = (0, pg_core_1.pgTable)("construction_resource_allocations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    resourceId: (0, pg_core_1.varchar)("resource_id").references(() => exports.constructionResources.id).notNull(),
    projectId: (0, pg_core_1.varchar)("project_id").references(() => ppm_1.ppmProjects.id).notNull(),
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date").notNull(),
    allocationPercent: (0, pg_core_1.integer)("allocation_percent").default(100),
    actualUsage: (0, pg_core_1.numeric)("actual_usage", { precision: 18, scale: 2 }).default("0.00"),
    status: (0, pg_core_1.varchar)("status").default("PLANNED"), // PLANNED, ACTIVE, COMPLETED, CANCELLED
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
//# sourceMappingURL=construction_resources.js.map