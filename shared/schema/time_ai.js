"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hrmAiAnomaliesRelations = exports.hrmAiAnomalies = exports.hrmAiForecasts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// 1. AI FORECASTS (Department Level)
exports.hrmAiForecasts = (0, pg_core_1.pgTable)("hrm_ai_forecasts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    tenantId: (0, pg_core_1.text)("tenant_id").notNull(),
    departmentId: (0, pg_core_1.text)("department_id").notNull(),
    forecastDate: (0, pg_core_1.date)("forecast_date").notNull(), // The future date being predicted
    projectedHours: (0, pg_core_1.numeric)("projected_hours").notNull(),
    confidenceScore: (0, pg_core_1.integer)("confidence_score").default(0), // 0-100
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// 2. AI ANOMALIES / RISKS (Person/Entry Level)
exports.hrmAiAnomalies = (0, pg_core_1.pgTable)("hrm_ai_anomalies", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    tenantId: (0, pg_core_1.text)("tenant_id").notNull(),
    personId: (0, pg_core_1.text)("person_id").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // FATIGUE_RISK, LATE_PATTERN, GHOST_CLOCK_IN
    riskScore: (0, pg_core_1.integer)("risk_score").default(0), // 0-100 (High = Bad)
    riskReason: (0, pg_core_1.text)("risk_reason"), // "Worked 8 consecutive days"
    status: (0, pg_core_1.text)("status").default('OPEN'), // OPEN, DISMISSED, RESOLVED
    detectedAt: (0, pg_core_1.timestamp)("detected_at").defaultNow(),
    metadata: (0, pg_core_1.jsonb)("metadata"), // Store related TimeEntryId or other context
});
exports.hrmAiAnomaliesRelations = (0, drizzle_orm_1.relations)(exports.hrmAiAnomalies, ({ one }) => ({
// If we wanted to link to time entries strictly, we could, but often anomalies span multiple entries
}));
//# sourceMappingURL=time_ai.js.map