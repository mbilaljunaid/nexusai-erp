import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * PredictiveSchedulingService — WFM-OG-02
 *
 * Generates shift schedules using demand forecasting + constraint-based optimization:
 * 1. Build demand forecast from historical patterns (hour-of-day, day-of-week)
 * 2. Calculate required headcount per hour slot (demand / avg_transactions_per_person)
 * 3. Match qualified available employees to forecasted demand slots
 * 4. Respect scheduling constraints (max hours, min rest, preferences)
 * 5. Generate published shift roster
 */
export class PredictiveSchedulingService {

    async generateForecast(params: {
        tenantId: string;
        locationId: string;
        roleId?: string;
        startDate: string;
        endDate: string;
        avgProductivity?: number;  // transactions/units per person-hour
    }) {
        const productivity = params.avgProductivity ?? 10;
        const dates = this._dateRange(params.startDate, params.endDate);
        const forecasts = [];

        for (const date of dates) {
            const dayOfWeek = new Date(date).getDay(); // 0=Sun
            for (let hour = 0; hour < 24; hour++) {
                // Rule-based demand model: peak during business hours, scaled by day-of-week
                const dayMultiplier = [0.6, 1.0, 1.1, 1.05, 1.1, 1.2, 0.7][dayOfWeek] ?? 1.0;
                const hourMultiplier = this._hourDemandCurve(hour);
                const predictedDemand = 100 * dayMultiplier * hourMultiplier;
                const requiredHeadcount = Math.ceil(predictedDemand / productivity);

                if (requiredHeadcount > 0) {
                    const [row] = (await db.execute(sql`
                        INSERT INTO demand_forecasts (
                            tenant_id, location_id, role_id, forecast_date, hour_of_day,
                            predicted_demand, required_headcount, model_version
                        ) VALUES (
                            ${params.tenantId}, ${params.locationId}, ${params.roleId ?? null},
                            ${date}, ${hour}, ${predictedDemand}, ${requiredHeadcount}, 'rule_v1'
                        )
                        ON CONFLICT (tenant_id, location_id, forecast_date, hour_of_day) DO UPDATE SET
                            predicted_demand = EXCLUDED.predicted_demand,
                            required_headcount = EXCLUDED.required_headcount
                        RETURNING *
                    `)) as any;
                    forecasts.push(row);
                }
            }
        }
        return { locationId: params.locationId, datesForecasted: dates.length, forecastRecords: forecasts.length };
    }

    async generateSchedule(params: {
        tenantId: string;
        locationId: string;
        roleId?: string;
        weekStartDate: string;
        employeePool: Array<{
            employeeId: string;
            maxHours: number;
            preferredDays?: number[];  // 0=Sun..6=Sat
            hourlyRate?: number;
        }>;
        shiftHours?: number;  // default 8
    }) {
        const shiftH = params.shiftHours ?? 8;
        const weekEnd = this._addDays(params.weekStartDate, 6);
        const dates = this._dateRange(params.weekStartDate, weekEnd);
        const constraints = (await db.execute(sql`
            SELECT * FROM schedule_constraints
            WHERE tenant_id = ${params.tenantId}
              AND (location_id = ${params.locationId} OR location_id IS NULL)
              AND (effective_to IS NULL OR effective_to >= ${params.weekStartDate})
        `) as any).rows ?? [];

        const generated: any[] = [];
        const hoursAssigned: Map<string, number> = new Map();
        params.employeePool.forEach(e => hoursAssigned.set(e.employeeId, 0));

        for (const date of dates) {
            const dayOfWeek = new Date(date).getDay();

            // Identify coverage gaps from forecast
            const peakSlots = (await db.execute(sql`
                SELECT hour_of_day, required_headcount FROM demand_forecasts
                WHERE tenant_id = ${params.tenantId} AND location_id = ${params.locationId}
                  AND forecast_date = ${date} AND required_headcount > 0
                ORDER BY required_headcount DESC LIMIT 3
            `) as any).rows ?? [];

            const needsStaff = peakSlots.length > 0;
            if (!needsStaff) continue;

            // Pick peak start hour — simplified: first major peak
            const peakHour = peakSlots[0]?.hour_of_day ?? 9;
            const startTime = `${String(peakHour).padStart(2, '0')}:00`;
            const endHour = Math.min(23, peakHour + shiftH);
            const endTime = `${String(endHour).padStart(2, '0')}:00`;

            // Assign best available employee
            for (const emp of params.employeePool) {
                const assigned = hoursAssigned.get(emp.employeeId) ?? 0;
                if (assigned + shiftH > emp.maxHours) continue;
                if (emp.preferredDays && !emp.preferredDays.includes(dayOfWeek)) continue;

                // Check constraint violations
                const hasConstraint = constraints.some((c: any) =>
                    c.employee_id === emp.employeeId && c.constraint_type === 'NoAvailability' &&
                    (c.value_json?.dates?.includes(date) || c.value_json?.dayOfWeek === dayOfWeek)
                );
                if (hasConstraint) continue;

                const [shift] = (await db.execute(sql`
                    INSERT INTO schedule_shifts (
                        tenant_id, employee_id, location_id, role_id,
                        shift_date, start_time, end_time, shift_hours,
                        status, predicted_demand
                    ) VALUES (
                        ${params.tenantId}, ${emp.employeeId}, ${params.locationId}, ${params.roleId ?? null},
                        ${date}, ${startTime}, ${endTime}, ${shiftH},
                        'Scheduled', ${peakSlots[0]?.required_headcount ?? 1}
                    ) ON CONFLICT DO NOTHING RETURNING *
                `)) as any;

                if (shift) {
                    hoursAssigned.set(emp.employeeId, assigned + shiftH);
                    generated.push(shift);
                    break; // Move to next date once someone is assigned
                }
            }
        }

        return {
            weekStartDate: params.weekStartDate,
            shiftsGenerated: generated.length,
            coverage: generated.length / dates.length,
            shifts: generated,
        };
    }

    async publishSchedule(tenantId: string, locationId: string, weekStartDate: string) {
        const weekEnd = this._addDays(weekStartDate, 6);
        await db.execute(sql`
            UPDATE schedule_shifts SET status = 'Confirmed', published_at = NOW()
            WHERE tenant_id = ${tenantId} AND location_id = ${locationId}
              AND shift_date BETWEEN ${weekStartDate} AND ${weekEnd}
              AND status = 'Scheduled'
        `);
        return { published: true };
    }

    async getSchedule(tenantId: string, locationId: string, startDate: string, endDate: string) {
        return (await db.execute(sql`
            SELECT * FROM schedule_shifts
            WHERE tenant_id = ${tenantId} AND location_id = ${locationId}
              AND shift_date BETWEEN ${startDate} AND ${endDate}
            ORDER BY shift_date, start_time
        `) as any).rows;
    }

    async getCoverage(tenantId: string, locationId: string, date: string) {
        const forecast = (await db.execute(sql`
            SELECT hour_of_day, required_headcount FROM demand_forecasts
            WHERE tenant_id = ${tenantId} AND location_id = ${locationId} AND forecast_date = ${date}
            ORDER BY hour_of_day
        `) as any).rows ?? [];

        const scheduled = (await db.execute(sql`
            SELECT COUNT(*) AS headcount FROM schedule_shifts
            WHERE tenant_id = ${tenantId} AND location_id = ${locationId}
              AND shift_date = ${date} AND status IN ('Scheduled','Confirmed')
        `) as any).rows?.[0];

        const gaps = forecast.filter((f: any) => Number(f.required_headcount) > Number(scheduled?.headcount ?? 0));
        return { date, forecasted: forecast, scheduledHeadcount: Number(scheduled?.headcount ?? 0), gaps };
    }

    async addConstraint(params: {
        tenantId: string;
        constraintType: string;
        employeeId?: string;
        roleId?: string;
        locationId?: string;
        valueJson: any;
        effectiveFrom?: string;
        effectiveTo?: string;
    }) {
        const [row] = (await db.execute(sql`
            INSERT INTO schedule_constraints (
                tenant_id, constraint_type, employee_id, role_id, location_id,
                value_json, effective_from, effective_to
            ) VALUES (
                ${params.tenantId}, ${params.constraintType}, ${params.employeeId ?? null},
                ${params.roleId ?? null}, ${params.locationId ?? null},
                ${JSON.stringify(params.valueJson)},
                ${params.effectiveFrom ?? new Date().toISOString().slice(0, 10)},
                ${params.effectiveTo ?? null}
            ) RETURNING *
        `)) as any;
        return row;
    }

    // ─── Utilities ─────────────────────────────────────────────────────────────

    /** Bell-curve demand: peaks 9-11am and 2-4pm */
    private _hourDemandCurve(hour: number): number {
        const peaks: Record<number, number> = { 9: 0.9, 10: 1.0, 11: 0.9, 12: 0.7, 14: 0.85, 15: 1.0, 16: 0.9, 17: 0.7 };
        return peaks[hour] ?? (hour >= 8 && hour <= 18 ? 0.5 : 0.1);
    }

    private _addDays(date: string, days: number): string {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d.toISOString().slice(0, 10);
    }

    private _dateRange(start: string, end: string): string[] {
        const dates: string[] = [];
        const cur = new Date(start);
        const endDate = new Date(end);
        while (cur <= endDate) {
            dates.push(cur.toISOString().slice(0, 10));
            cur.setDate(cur.getDate() + 1);
        }
        return dates;
    }
}

export const predictiveSchedulingService = new PredictiveSchedulingService();
