"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectCostCodeSchema = exports.insertCostCodeSchema = exports.constructionCostCodes = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.constructionCostCodes = (0, pg_core_1.pgTable)("construction_cost_codes", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    code: (0, pg_core_1.varchar)("code").notNull().unique(), // e.g., '03-30-00'
    name: (0, pg_core_1.varchar)("name").notNull(), // e.g., 'Cast-in-Place Concrete'
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.varchar)("category"), // e.g., 'Div 03 - Concrete'
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.insertCostCodeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.constructionCostCodes);
exports.selectCostCodeSchema = (0, drizzle_zod_1.createSelectSchema)(exports.constructionCostCodes);
//# sourceMappingURL=construction_master.js.map