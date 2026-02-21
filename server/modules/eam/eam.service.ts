import { db } from "../../db";
import { sql } from "drizzle-orm";

/** PermitToWorkService — EAM-OG-01 */
export class PermitToWorkService {
    async create(params: {
        tenantId: string; permitType?: string; assetId?: string; location?: string;
        description?: string; hazards?: string[]; precautions?: string[];
        requestedBy: string; contractor?: string; startDatetime?: string; endDatetime?: string;
    }) {
        const permitNumber = `PTW-${Date.now().toString(36).toUpperCase()}`;
        const initEvent = { at: new Date().toISOString(), by: params.requestedBy, action: 'CREATED', note: 'Permit created' };
        const [r] = (await db.execute(sql`
            INSERT INTO permits_to_work (tenant_id, permit_number, permit_type, asset_id, location, description, hazards, precautions, requested_by, contractor, start_datetime, end_datetime, status, events)
            VALUES (${params.tenantId}, ${permitNumber}, ${params.permitType ?? 'COLD_WORK'},
                ${params.assetId ?? null}, ${params.location ?? null}, ${params.description ?? null},
                ${JSON.stringify(params.hazards ?? [])}::jsonb, ${JSON.stringify(params.precautions ?? [])}::jsonb,
                ${params.requestedBy}, ${params.contractor ?? null},
                ${params.startDatetime ?? null}, ${params.endDatetime ?? null},
                'Pending_Approval', ${JSON.stringify([initEvent])}::jsonb)
            RETURNING *
        `)) as any;
        return r;
    }

    async transition(permitId: string, actor: string, action: 'APPROVE' | 'ISSUE' | 'SUSPEND' | 'RESUME' | 'CLOSE' | 'CANCEL', note?: string) {
        const statusMap: Record<string, string> = {
            APPROVE: 'Approved', ISSUE: 'Active', SUSPEND: 'Suspended', RESUME: 'Active', CLOSE: 'Closed', CANCEL: 'Cancelled'
        };
        const newStatus = statusMap[action];
        const event = { at: new Date().toISOString(), by: actor, action, note: note ?? action };
        await db.execute(sql`
            UPDATE permits_to_work SET status = ${newStatus},
                approved_by = CASE WHEN ${action} = 'APPROVE' THEN ${actor} ELSE approved_by END,
                issued_by   = CASE WHEN ${action} = 'ISSUE'   THEN ${actor} ELSE issued_by END,
                closed_at   = CASE WHEN ${action} IN ('CLOSE', 'CANCEL') THEN NOW() ELSE closed_at END,
                events = events || ${JSON.stringify([event])}::jsonb
            WHERE id = ${permitId}
        `);
        return { permitId, status: newStatus };
    }

    async extend(permitId: string, newEnd: string, requestedBy: string, approvedBy?: string) {
        const ext = { requested_by: requestedBy, new_end: newEnd, approved_by: approvedBy ?? null, at: new Date().toISOString() };
        await db.execute(sql`
            UPDATE permits_to_work SET end_datetime = ${newEnd},
                extensions = extensions || ${JSON.stringify([ext])}::jsonb
            WHERE id = ${permitId}
        `);
        return { permitId, newEnd };
    }

    async listByAsset(tenantId: string, assetId: string, status?: string) {
        let q = sql`SELECT * FROM permits_to_work WHERE tenant_id = ${tenantId} AND asset_id = ${assetId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        return (await db.execute(sql`${q} ORDER BY created_at DESC`) as any).rows;
    }

    async list(tenantId: string, status?: string, permitType?: string) {
        let q = sql`SELECT * FROM permits_to_work WHERE tenant_id = ${tenantId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        if (permitType) q = sql`${q} AND permit_type = ${permitType}`;
        return (await db.execute(sql`${q} ORDER BY created_at DESC LIMIT 300`) as any).rows;
    }

    async getExpiring(tenantId: string, hours = 24) {
        return (await db.execute(sql`
            SELECT * FROM permits_to_work
            WHERE tenant_id = ${tenantId} AND status = 'Active'
              AND end_datetime BETWEEN NOW() AND NOW() + INTERVAL '${sql.raw(String(hours))} hours'
            ORDER BY end_datetime
        `) as any).rows;
    }
}

/** CBMService — EAM-OG-02: Condition-Based Monitoring */
export class CBMService {
    async upsertThreshold(params: {
        tenantId: string; assetId: string; parameterName: string;
        warnLow?: number; warnHigh?: number; criticalLow?: number; criticalHigh?: number;
        actionOnWarn?: string; actionOnCrit?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO cbm_thresholds (tenant_id, asset_id, parameter_name, warn_low, warn_high, critical_low, critical_high, action_on_warn, action_on_crit)
            VALUES (${params.tenantId}, ${params.assetId}, ${params.parameterName},
                ${params.warnLow ?? null}, ${params.warnHigh ?? null},
                ${params.criticalLow ?? null}, ${params.criticalHigh ?? null},
                ${params.actionOnWarn ?? 'ALERT'}, ${params.actionOnCrit ?? 'CREATE_WO'})
            ON CONFLICT (tenant_id, asset_id, parameter_name)
            DO UPDATE SET warn_low = EXCLUDED.warn_low, warn_high = EXCLUDED.warn_high,
                critical_low = EXCLUDED.critical_low, critical_high = EXCLUDED.critical_high,
                action_on_warn = EXCLUDED.action_on_warn, action_on_crit = EXCLUDED.action_on_crit
            RETURNING *
        `)) as any;
        return r;
    }

    async recordReading(params: {
        tenantId: string; assetId: string; parameterName: string; parameterUnit?: string;
        readingValue: number; source?: string;
    }) {
        // Check threshold
        const thresh = (await db.execute(sql`
            SELECT * FROM cbm_thresholds
            WHERE tenant_id = ${params.tenantId} AND asset_id = ${params.assetId} AND parameter_name = ${params.parameterName}
        `) as any).rows?.[0];

        let alertGenerated = false;
        let alertLevel: 'NONE' | 'WARN' | 'CRITICAL' = 'NONE';

        if (thresh) {
            const v = params.readingValue;
            const isCrit = (thresh.critical_low !== null && v < Number(thresh.critical_low)) ||
                (thresh.critical_high !== null && v > Number(thresh.critical_high));
            const isWarn = !isCrit && ((thresh.warn_low !== null && v < Number(thresh.warn_low)) ||
                (thresh.warn_high !== null && v > Number(thresh.warn_high)));
            if (isCrit) { alertGenerated = true; alertLevel = 'CRITICAL'; }
            else if (isWarn) { alertGenerated = true; alertLevel = 'WARN'; }
        }

        const [r] = (await db.execute(sql`
            INSERT INTO cbm_readings (tenant_id, asset_id, parameter_name, parameter_unit, reading_value, source, alert_generated)
            VALUES (${params.tenantId}, ${params.assetId}, ${params.parameterName},
                ${params.parameterUnit ?? null}, ${params.readingValue},
                ${params.source ?? 'MANUAL'}, ${alertGenerated})
            RETURNING *
        `)) as any;
        return { ...r, alertLevel, threshold: thresh };
    }

    async getTrend(tenantId: string, assetId: string, parameterName: string, limit = 50) {
        return (await db.execute(sql`
            SELECT reading_value, reading_at, source, alert_generated
            FROM cbm_readings
            WHERE tenant_id = ${tenantId} AND asset_id = ${assetId} AND parameter_name = ${parameterName}
            ORDER BY reading_at DESC LIMIT ${limit}
        `) as any).rows;
    }

    async getActiveAlerts(tenantId: string) {
        return (await db.execute(sql`
            SELECT DISTINCT ON (asset_id, parameter_name)
                asset_id, parameter_name, reading_value, reading_at
            FROM cbm_readings
            WHERE tenant_id = ${tenantId} AND alert_generated = TRUE
            ORDER BY asset_id, parameter_name, reading_at DESC
        `) as any).rows;
    }
}

/** MeterPMService — EAM-OG-03: Meter-driven PM */
export class MeterPMService {
    async createMeter(params: {
        tenantId: string; assetId: string; meterName: string; unit: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO meters (tenant_id, asset_id, meter_name, unit, current_reading)
            VALUES (${params.tenantId}, ${params.assetId}, ${params.meterName}, ${params.unit}, 0)
            RETURNING *
        `)) as any;
        return r;
    }

    async recordReading(params: {
        tenantId: string; meterId: string; readingValue: number; recordedBy?: string;
    }) {
        const meter = (await db.execute(sql`SELECT * FROM meters WHERE id = ${params.meterId}`) as any).rows?.[0];
        if (!meter) throw new Error('Meter not found');
        const delta = params.readingValue - Number(meter.current_reading);

        // Update meter
        await db.execute(sql`
            UPDATE meters SET current_reading = ${params.readingValue}, last_reading_at = NOW()
            WHERE id = ${params.meterId}
        `);

        // Insert reading
        const [r] = (await db.execute(sql`
            INSERT INTO pm_meter_readings (tenant_id, meter_id, reading_value, delta, recorded_by)
            VALUES (${params.tenantId}, ${params.meterId}, ${params.readingValue}, ${delta}, ${params.recordedBy ?? null})
        `)) as any;

        // Check due PM schedules
        const dueSchedules = (await db.execute(sql`
            SELECT * FROM meter_pm_schedules
            WHERE meter_id = ${params.meterId} AND next_due_at_reading <= ${params.readingValue}
        `) as any).rows;

        // Update next-due for triggered schedules
        for (const sched of dueSchedules) {
            const nextDue = params.readingValue + Number(sched.interval_value);
            await db.execute(sql`
                UPDATE meter_pm_schedules SET last_done_at_reading = ${params.readingValue}, next_due_at_reading = ${nextDue}
                WHERE id = ${sched.id}
            `);
        }

        return { meterId: params.meterId, reading: params.readingValue, delta, triggeredSchedules: dueSchedules };
    }

    async createSchedule(params: {
        tenantId: string; meterId: string; assetId: string; taskName: string;
        intervalValue: number; leadValue?: number; workOrderTemplate?: any;
    }) {
        const meter = (await db.execute(sql`SELECT current_reading FROM meters WHERE id = ${params.meterId}`) as any).rows?.[0];
        const nextDue = Number(meter?.current_reading ?? 0) + params.intervalValue;
        const [r] = (await db.execute(sql`
            INSERT INTO meter_pm_schedules (tenant_id, meter_id, asset_id, task_name, interval_value, next_due_at_reading, lead_value, work_order_template)
            VALUES (${params.tenantId}, ${params.meterId}, ${params.assetId}, ${params.taskName},
                ${params.intervalValue}, ${nextDue}, ${params.leadValue ?? 0},
                ${JSON.stringify(params.workOrderTemplate ?? {})}::jsonb)
            RETURNING *
        `)) as any;
        return r;
    }

    async getDueSchedules(tenantId: string, includeLeadTime = true) {
        return (await db.execute(sql`
            SELECT s.*, m.current_reading, m.meter_name, m.unit,
                (s.next_due_at_reading - m.current_reading) AS remaining
            FROM meter_pm_schedules s
            JOIN meters m ON m.id = s.meter_id
            WHERE s.tenant_id = ${tenantId}
                AND m.current_reading >= (s.next_due_at_reading - CASE WHEN ${includeLeadTime} THEN s.lead_value ELSE 0 END)
            ORDER BY remaining
        `) as any).rows;
    }

    async listMeters(tenantId: string, assetId?: string) {
        let q = sql`SELECT m.*, COUNT(s.id)::int AS schedule_count FROM meters m LEFT JOIN meter_pm_schedules s ON s.meter_id = m.id WHERE m.tenant_id = ${tenantId}`;
        if (assetId) q = sql`${q} AND m.asset_id = ${assetId}`;
        return (await db.execute(sql`${q} GROUP BY m.id ORDER BY m.asset_id`) as any).rows;
    }
}

export const permitToWorkService = new PermitToWorkService();
export const cbmService = new CBMService();
export const meterPMService = new MeterPMService();
