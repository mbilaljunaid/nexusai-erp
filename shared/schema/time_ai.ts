import { pgTable, text, serial, integer, boolean, timestamp, numeric, date, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { hrmTimeEntries } from "./time_labor";

// 1. AI FORECASTS (Department Level)
export const hrmAiForecasts = pgTable("hrm_ai_forecasts", {
    id: serial("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    departmentId: text("department_id").notNull(),
    forecastDate: date("forecast_date").notNull(), // The future date being predicted
    projectedHours: numeric("projected_hours").notNull(),
    confidenceScore: integer("confidence_score").default(0), // 0-100
    createdAt: timestamp("created_at").defaultNow(),
});

// 2. AI ANOMALIES / RISKS (Person/Entry Level)
export const hrmAiAnomalies = pgTable("hrm_ai_anomalies", {
    id: serial("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    personId: text("person_id").notNull(),
    type: text("type").notNull(), // FATIGUE_RISK, LATE_PATTERN, GHOST_CLOCK_IN
    riskScore: integer("risk_score").default(0), // 0-100 (High = Bad)
    riskReason: text("risk_reason"), // "Worked 8 consecutive days"
    status: text("status").default('OPEN'), // OPEN, DISMISSED, RESOLVED
    detectedAt: timestamp("detected_at").defaultNow(),
    metadata: jsonb("metadata"), // Store related TimeEntryId or other context
});

export const hrmAiAnomaliesRelations = relations(hrmAiAnomalies, ({ one }) => ({
    // If we wanted to link to time entries strictly, we could, but often anomalies span multiple entries
}));
