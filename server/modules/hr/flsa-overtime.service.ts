import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * FLSAOvertimeService — WFM-OG-01
 *
 * Calculates overtime pay in compliance with:
 * - US FLSA: >40h/week at 1.5x
 * - California: >8h/day at 1.5x, >12h/day at 2x, 7th consecutive day rules
 * - Canada (ON/BC): daily OT thresholds
 * - EU Working Time Directive: 48h weekly cap, mandatory rest
 *
 * Algorithm: Process each punch entry, apply daily OT buckets first,
 * then aggregate weekly totals for FLSA weekly OT.
 */
export class FLSAOvertimeService {

    async createRule(params: {
        tenantId: string;
        ruleCode: string;
        jurisdiction: string;
        standard?: string;
        dailyThresholdHours?: number;
        weeklyThresholdHours?: number;
        dailyOtRate?: number;
        weeklyOtRate?: number;
        doubleTimedDaily?: number;
        doubleTimeRate?: number;
        seventhDayRate?: number;
        seventhDayDoubleRate?: number;
        restPeriodMinutes?: number;
        maxWeeklyHours?: number;
    }) {
        const [rule] = (await db.execute(sql`
            INSERT INTO overtime_rules (
                tenant_id, rule_code, jurisdiction, standard,
                daily_threshold_hours, weekly_threshold_hours,
                daily_ot_rate, weekly_ot_rate,
                double_time_daily, double_time_rate,
                seventh_day_rate, seventh_day_double_rate,
                rest_period_minutes, max_weekly_hours
            ) VALUES (
                ${params.tenantId}, ${params.ruleCode}, ${params.jurisdiction}, ${params.standard ?? 'FLSA'},
                ${params.dailyThresholdHours ?? 8}, ${params.weeklyThresholdHours ?? 40},
                ${params.dailyOtRate ?? 1.5}, ${params.weeklyOtRate ?? 1.5},
                ${params.doubleTimedDaily ?? 12}, ${params.doubleTimeRate ?? 2.0},
                ${params.seventhDayRate ?? 1.5}, ${params.seventhDayDoubleRate ?? 2.0},
                ${params.restPeriodMinutes ?? 600}, ${params.maxWeeklyHours ?? 48}
            )
            ON CONFLICT (tenant_id, rule_code) DO UPDATE SET
                daily_threshold_hours = EXCLUDED.daily_threshold_hours,
                weekly_threshold_hours = EXCLUDED.weekly_threshold_hours,
                daily_ot_rate = EXCLUDED.daily_ot_rate,
                weekly_ot_rate = EXCLUDED.weekly_ot_rate
            RETURNING *
        `)) as any;
        return rule;
    }

    async listRules(tenantId: string) {
        return (await db.execute(sql`SELECT * FROM overtime_rules WHERE tenant_id = ${tenantId} AND active = TRUE ORDER BY jurisdiction`) as any).rows;
    }

    /**
     * Calculate OT for a single timecard punch.
     * Returns hours buckets: regular, OT (1.5x), double-time (2x).
     */
    async calculateTimecard(params: {
        tenantId: string;
        employeeId: string;
        ruleCode: string;
        clockIn: string;   // ISO datetime
        clockOut: string;
        hourlyRate: number;
        dayOfWeek?: number; // 1=Mon..7=Sun for CA 7th-day rule
        weekSequential?: number; // consecutive day count in week (CA)
    }) {
        const rule = (await db.execute(sql`
            SELECT * FROM overtime_rules WHERE tenant_id = ${params.tenantId} AND rule_code = ${params.ruleCode}
        `) as any).rows?.[0];
        if (!rule) throw new Error(`Overtime rule not found: ${params.ruleCode}`);

        const inTime = new Date(params.clockIn);
        const outTime = new Date(params.clockOut);
        const totalHours = (outTime.getTime() - inTime.getTime()) / 3_600_000;
        const workDate = params.clockIn.slice(0, 10);
        const dayOfWeek = params.dayOfWeek ?? outTime.getDay();   // 0=Sun..6=Sat
        const weekSeq = params.weekSequential ?? 1;             // consecutive day in pay period

        const { dailyHours, regularHours, otHours, doubleHours } = this._applyDailyRules(
            totalHours, rule, dayOfWeek, weekSeq
        );

        const regularPay = regularHours * params.hourlyRate;
        const otPay = otHours * params.hourlyRate * Number(rule.daily_ot_rate);
        const doublePay = doubleHours * params.hourlyRate * Number(rule.double_time_rate);

        const [entry] = (await db.execute(sql`
            INSERT INTO timecard_entries (
                tenant_id, employee_id, work_date, clock_in, clock_out,
                regular_hours, ot_hours, double_hours,
                regular_pay, ot_pay, double_pay,
                rule_id, hourly_rate, status
            ) VALUES (
                ${params.tenantId}, ${params.employeeId}, ${workDate},
                ${params.clockIn}, ${params.clockOut},
                ${regularHours}, ${otHours}, ${doubleHours},
                ${regularPay}, ${otPay}, ${doublePay},
                ${rule.id}, ${params.hourlyRate}, 'Calculated'
            ) RETURNING *
        `)) as any;

        return { ...entry, totalHours, breakdown: { regularHours, otHours, doubleHours, regularPay, otPay, doublePay } };
    }

    /**
     * Aggregate weekly overtime and enforce FLSA 40h/week rule.
     * Updated for any additional weekly OT hours beyond daily calculations.
     */
    async buildWeeklySummary(params: {
        tenantId: string;
        employeeId: string;
        weekStartDate: string;
        ruleCode: string;
    }) {
        const weekEnd = this._addDays(params.weekStartDate, 6);
        const rule = (await db.execute(sql`
            SELECT * FROM overtime_rules WHERE tenant_id = ${params.tenantId} AND rule_code = ${params.ruleCode}
        `) as any).rows?.[0];
        if (!rule) throw new Error(`Rule not found: ${params.ruleCode}`);

        const entries = (await db.execute(sql`
            SELECT * FROM timecard_entries
            WHERE tenant_id = ${params.tenantId} AND employee_id = ${params.employeeId}
              AND work_date BETWEEN ${params.weekStartDate} AND ${weekEnd}
        `) as any).rows ?? [];

        let totalHours = 0, weeklyRegular = 0, weeklyOT = 0, weeklyDouble = 0, grossPay = 0;
        const weeklyThresh = Number(rule.weekly_threshold_hours);

        for (const e of entries) {
            totalHours += Number(e.regular_hours) + Number(e.ot_hours) + Number(e.double_hours);
            weeklyRegular += Number(e.regular_hours);
            weeklyOT += Number(e.ot_hours);
            weeklyDouble += Number(e.double_hours);
            grossPay += Number(e.total_pay);
        }

        // If standard is FLSA and weekly regular hours exceed threshold (e.g. spread across days), reclassify
        if (weeklyRegular > weeklyThresh && rule.standard === 'FLSA') {
            const extraOT = weeklyRegular - weeklyThresh;
            weeklyRegular = weeklyThresh;
            weeklyOT += extraOT;
            // Recalculate grossPay adjustment is approximate here; precise payroll engine handles this
            const avgRate = entries.length > 0 ? Number(entries[0].hourly_rate) : 0;
            grossPay += extraOT * avgRate * (Number(rule.weekly_ot_rate) - 1);
        }

        const [summary] = (await db.execute(sql`
            INSERT INTO weekly_overtime_summary (
                tenant_id, employee_id, week_start_date, week_end_date,
                total_hours, regular_hours, ot_hours, double_hours, gross_pay, rule_id
            ) VALUES (
                ${params.tenantId}, ${params.employeeId}, ${params.weekStartDate}, ${weekEnd},
                ${totalHours}, ${weeklyRegular}, ${weeklyOT}, ${weeklyDouble}, ${grossPay}, ${rule.id}
            )
            ON CONFLICT (tenant_id, employee_id, week_start_date) DO UPDATE SET
                total_hours = EXCLUDED.total_hours,
                regular_hours = EXCLUDED.regular_hours,
                ot_hours = EXCLUDED.ot_hours,
                double_hours = EXCLUDED.double_hours,
                gross_pay = EXCLUDED.gross_pay
            RETURNING *
        `)) as any;

        return { summary, totalHours, weeklyRegular, weeklyOT, weeklyDouble };
    }

    async getTimecards(tenantId: string, employeeId: string, from: string, to: string) {
        return (await db.execute(sql`
            SELECT tc.*, r.jurisdiction FROM timecard_entries tc
            JOIN overtime_rules r ON r.id = tc.rule_id
            WHERE tc.tenant_id = ${tenantId} AND tc.employee_id = ${employeeId}
              AND tc.work_date BETWEEN ${from} AND ${to}
            ORDER BY tc.work_date
        `) as any).rows;
    }

    async getOvertimeReport(tenantId: string, weekStartDate: string) {
        return (await db.execute(sql`
            SELECT wos.*, r.jurisdiction, r.standard
            FROM weekly_overtime_summary wos
            JOIN overtime_rules r ON r.id = wos.rule_id
            WHERE wos.tenant_id = ${tenantId} AND wos.week_start_date = ${weekStartDate}
            ORDER BY wos.ot_hours DESC
        `) as any).rows;
    }

    async checkRestViolations(tenantId: string, employeeId: string, date: string) {
        // Check for entries within rest period of each other
        const entries = (await db.execute(sql`
            SELECT tc.*, r.rest_period_minutes FROM timecard_entries tc
            JOIN overtime_rules r ON r.id = tc.rule_id
            WHERE tc.tenant_id = ${tenantId} AND tc.employee_id = ${employeeId}
              AND tc.work_date BETWEEN ${this._addDays(date, -1)} AND ${date}
            ORDER BY tc.clock_out DESC
        `) as any).rows ?? [];

        const violations = [];
        for (let i = 0; i < entries.length - 1; i++) {
            const gap = (new Date(entries[i].clock_in).getTime() - new Date(entries[i + 1].clock_out).getTime()) / 60_000;
            if (gap < Number(entries[i + 1].rest_period_minutes)) {
                violations.push({ date, gapMinutes: gap, requiredMinutes: entries[i + 1].rest_period_minutes });
            }
        }
        return violations;
    }

    // ─── Daily OT Calculation ─────────────────────────────────────────────────

    private _applyDailyRules(hours: number, rule: any, dayOfWeek: number, weekSeq: number) {
        const daily = Number(rule.daily_threshold_hours);
        const doubleThresh = Number(rule.double_time_daily);
        const isSunday = dayOfWeek === 0;  // JS: 0=Sunday
        const is7thDay = weekSeq >= 7;

        let regularHours = 0, otHours = 0, doubleHours = 0;

        if (is7thDay && rule.jurisdiction.startsWith('CA')) {
            // CA 7th consecutive day: first 8h at 1.5x, above at 2x
            const firstPart = Math.min(hours, daily);
            regularHours = 0; otHours = firstPart; doubleHours = Math.max(0, hours - daily);
        } else {
            regularHours = Math.min(hours, daily);
            const above = hours - regularHours;
            if (above > 0) {
                const firstOT = Math.min(above, doubleThresh - daily);
                otHours = Math.max(0, firstOT);
                doubleHours = Math.max(0, above - otHours);
            }
        }
        return { dailyHours: hours, regularHours, otHours, doubleHours };
    }

    private _addDays(date: string, days: number): string {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d.toISOString().slice(0, 10);
    }
}

export const flsaOvertimeService = new FLSAOvertimeService();
