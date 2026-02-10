import { db } from "@db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { hrmTimeEntries, hrmShifts, hrmTimeSheets } from "@shared/schema/time_labor";
import { hrmAiForecasts, hrmAiAnomalies } from "@shared/schema/time_ai";
import { subDays, addDays, format, differenceInDays } from "date-fns";
import { callAIJson, getCapabilityPrompt } from "./nexus-ai-gateway";

export class TimeAIService {

    // 1. FORECASTING ENGINE (Heuristic: Moving Average of Last 4 Weeks)
    static async generateScheduleForecast(tenantId: string, departmentId: string, targetDate: string) {
        // Logic: Look at the same day of the week for the last 4 weeks
        const target = new Date(targetDate);
        const dayOfWeek = target.getDay(); // 0-6

        // Find last 4 occurrences of this day
        // Simplified: Just grabbing total hours for the last 30 days and averaging for simplicity in V1
        // In V2: We would query specific same-days.

        const startDate = subDays(target, 30);

        const history = await db.select({
            totalHours: sql`SUM(${hrmTimeEntries.durationMinutes}) / 60`.mapWith(Number)
        }).from(hrmTimeEntries)
            .where(and(
                eq(hrmTimeEntries.tenantId, tenantId),
                gte(hrmTimeEntries.date, format(startDate, 'yyyy-MM-dd'))
            ));

        const totalLast30 = history[0]?.totalHours || 0;
        const dailyAverage = totalLast30 / 30;

        // Heuristic Multiplier (e.g., Mondays are busy)
        let modifier = 1.0;
        if (dayOfWeek === 1) modifier = 1.2; // Monday
        if (dayOfWeek === 5) modifier = 0.8; // Friday

        const projected = Math.round(dailyAverage * modifier * 10) / 10;
        const confidence = 85; // Baseline confidence for simple moving average

        // Persist Forecast
        const [forecast] = await db.insert(hrmAiForecasts).values({
            tenantId,
            departmentId,
            forecastDate: targetDate,
            projectedHours: projected.toString(),
            confidenceScore: confidence
        }).returning();

        return forecast;
    }

    // 2. ANOMALY PREDICTION (Fatigue Risk)
    static async predictFatigueRisk(tenantId: string, personId: string) {
        // Logic: Check if employee has worked > 7 consecutive days
        const today = new Date();
        const lookback = subDays(today, 10);

        const recentEntries = await db.select({
            date: hrmTimeEntries.date
        })
            .from(hrmTimeEntries)
            .innerJoin(hrmTimeSheets, eq(hrmTimeEntries.timesheetId, hrmTimeSheets.id))
            .where(and(
                eq(hrmTimeEntries.tenantId, tenantId),
                eq(hrmTimeSheets.personId, personId),
                gte(hrmTimeEntries.date, format(lookback, 'yyyy-MM-dd'))
            ))
            .orderBy(desc(hrmTimeEntries.date));

        // Determine streak
        let streak = 0;
        if (recentEntries.length > 0) {
            // Simple check: Count distinct days in last 10 days
            // Handle Date objects by converting to string first
            const days = new Set(recentEntries.map(e => e.date instanceof Date ? e.date.toISOString().split('T')[0] : String(e.date)));
            streak = days.size;
        }

        if (streak >= 7) {
            // Generate AI Insight
            let riskReason = `Employee has worked ${streak} days in the last 10 days. Risk of burnout.`;
            try {
                const systemPrompt = await getCapabilityPrompt("Workforce Planner", "Analyze workforce fatigue risks.");
                const insight = await callAIJson<{ explanation: string, severity: string }>([
                    { role: "user", content: `Employee has worked ${streak} consecutive days. Analyze the fatigue risk impact.` }
                ], { systemPrompt });
                if (insight.explanation) riskReason = insight.explanation;
            } catch (e) {
                console.error("Failed to generate AI insight for fatigue risk", e);
            }

            // Create Risk Anomaly
            const [anomaly] = await db.insert(hrmAiAnomalies).values({
                tenantId,
                personId,
                type: "FATIGUE_RISK",
                riskScore: 90, // High Risk
                riskReason,
                status: "OPEN"
            }).returning();
            return anomaly;
        }

        return null;
    }
}
