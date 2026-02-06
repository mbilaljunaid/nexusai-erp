"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertCostAnomalySchema = exports.costAnomalies = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
exports.costAnomalies = (0, pg_core_1.pgTable)("mfg_cost_anomalies", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    targetType: (0, pg_core_1.varchar)("target_type").notNull(), // PRODUCTION_ORDER, PURCHASE_ORDER
    targetId: (0, pg_core_1.varchar)("target_id").notNull(),
    anomalyType: (0, pg_core_1.varchar)("anomaly_type").notNull(), // IPV_VARIANCE, EFFICIENCY_LOW, SCRAP_EXCESS
    severity: (0, pg_core_1.varchar)("severity").notNull(), // LOW, MEDIUM, HIGH
    description: (0, pg_core_1.text)("description"),
    status: (0, pg_core_1.varchar)("status").default("PENDING"), // PENDING, DISMISSED, INVESTIGATING
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCostAnomalySchema = (0, drizzle_zod_1.createInsertSchema)(exports.costAnomalies);
//# sourceMappingURL=cost_ai.js.map