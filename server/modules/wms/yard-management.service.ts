import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * YardManagementService — WMS-OG-02
 *
 * Manages dock doors and yard appointments:
 * 1. Create and configure dock doors (inbound / outbound / both)
 * 2. Schedule carrier appointments with conflict detection
 * 3. Check-in / start-activity / depart lifecycle
 * 4. No-show handling
 * 5. Dock utilization analytics
 */
export class YardManagementService {

    // ─── Docks ────────────────────────────────────────────────────────────────

    async createDock(params: {
        tenantId: string;
        warehouseId: string;
        dockNumber: string;
        dockType?: string;
        notes?: string;
    }) {
        const [dock] = (await db.execute(sql`
            INSERT INTO yard_docks (tenant_id, warehouse_id, dock_number, dock_type, notes)
            VALUES (${params.tenantId}, ${params.warehouseId}, ${params.dockNumber},
                    ${params.dockType ?? 'INBOUND'}, ${params.notes ?? null})
            ON CONFLICT (tenant_id, warehouse_id, dock_number) DO UPDATE SET dock_type = EXCLUDED.dock_type
            RETURNING *
        `)) as any;
        return dock;
    }

    async listDocks(tenantId: string, warehouseId: string) {
        return (await db.execute(sql`
            SELECT d.*,
                   COUNT(a.id) FILTER (WHERE a.status NOT IN ('Departed','NoShow') AND a.scheduled_start::DATE = CURRENT_DATE) AS today_appts
            FROM yard_docks d
            LEFT JOIN yard_appointments a ON a.dock_id = d.id
            WHERE d.tenant_id = ${tenantId} AND d.warehouse_id = ${warehouseId}
            GROUP BY d.id
            ORDER BY d.dock_number
        `) as any).rows;
    }

    async getDockStatus(tenantId: string, warehouseId: string) {
        return (await db.execute(sql`
            SELECT
                COUNT(*) AS total_docks,
                COUNT(*) FILTER (WHERE is_occupied) AS occupied,
                COUNT(*) FILTER (WHERE NOT is_occupied) AS available,
                COUNT(*) FILTER (WHERE dock_type = 'INBOUND') AS inbound_doors,
                COUNT(*) FILTER (WHERE dock_type = 'OUTBOUND') AS outbound_doors
            FROM yard_docks
            WHERE tenant_id = ${tenantId} AND warehouse_id = ${warehouseId}
        `) as any).rows?.[0];
    }

    // ─── Appointments ─────────────────────────────────────────────────────────

    async scheduleAppointment(params: {
        tenantId: string;
        warehouseId: string;
        dockId: string;
        carrierScac: string;
        trailerNumber?: string;
        direction?: string;
        scheduledStart: string;
        scheduledEnd: string;
        purchaseOrderRef?: string;
    }) {
        // Conflict check: dock already booked in this time window?
        const conflict = (await db.execute(sql`
            SELECT id FROM yard_appointments
            WHERE dock_id = ${params.dockId}
              AND status NOT IN ('Departed', 'NoShow')
              AND tstzrange(scheduled_start, scheduled_end, '[)') &&
                  tstzrange(${params.scheduledStart}::TIMESTAMPTZ, ${params.scheduledEnd}::TIMESTAMPTZ, '[)')
            LIMIT 1
        `) as any).rows?.[0];
        if (conflict) throw new Error(`Dock already has an appointment in this time window (conflict: ${conflict.id})`);

        const [appt] = (await db.execute(sql`
            INSERT INTO yard_appointments (
                tenant_id, warehouse_id, dock_id, carrier_scac, trailer_number,
                direction, scheduled_start, scheduled_end, purchase_order_ref
            ) VALUES (
                ${params.tenantId}, ${params.warehouseId}, ${params.dockId},
                ${params.carrierScac}, ${params.trailerNumber ?? null},
                ${params.direction ?? 'INBOUND'}, ${params.scheduledStart}, ${params.scheduledEnd},
                ${params.purchaseOrderRef ?? null}
            ) RETURNING *
        `)) as any;
        return appt;
    }

    async checkIn(appointmentId: string, trailerNumber?: string) {
        const appt = (await db.execute(sql`SELECT * FROM yard_appointments WHERE id = ${appointmentId}`) as any).rows?.[0];
        if (!appt) throw new Error('Appointment not found');

        await db.execute(sql`
            UPDATE yard_appointments
            SET status = 'CheckedIn', actual_arrival = NOW(),
                trailer_number = COALESCE(${trailerNumber ?? null}, trailer_number)
            WHERE id = ${appointmentId}
        `);
        // Mark dock as occupied
        await db.execute(sql`
            UPDATE yard_docks SET is_occupied = TRUE, current_carrier = ${appt.carrier_scac},
                current_trailer = COALESCE(${trailerNumber ?? null}, trailer_number),
                appointment_start = ${appt.scheduled_start}, appointment_end = ${appt.scheduled_end},
                updated_at = NOW()
            WHERE id = ${appt.dock_id}
        `);
        return { appointmentId, status: 'CheckedIn' };
    }

    async startActivity(appointmentId: string, activity: 'Loading' | 'Unloading') {
        await db.execute(sql`
            UPDATE yard_appointments SET status = ${activity} WHERE id = ${appointmentId}
        `);
        return { appointmentId, status: activity };
    }

    async depart(appointmentId: string) {
        const appt = (await db.execute(sql`SELECT * FROM yard_appointments WHERE id = ${appointmentId}`) as any).rows?.[0];
        if (!appt) throw new Error('Appointment not found');

        await db.execute(sql`
            UPDATE yard_appointments SET status = 'Departed', actual_departure = NOW() WHERE id = ${appointmentId}
        `);
        await db.execute(sql`
            UPDATE yard_docks SET is_occupied = FALSE, current_carrier = NULL, current_trailer = NULL,
                appointment_start = NULL, appointment_end = NULL, updated_at = NOW()
            WHERE id = ${appt.dock_id}
        `);
        return { appointmentId, status: 'Departed' };
    }

    async markNoShow(appointmentId: string) {
        const appt = (await db.execute(sql`SELECT * FROM yard_appointments WHERE id = ${appointmentId}`) as any).rows?.[0];
        if (!appt) throw new Error('Appointment not found');
        await db.execute(sql`UPDATE yard_appointments SET status = 'NoShow' WHERE id = ${appointmentId}`);
        await db.execute(sql`
            UPDATE yard_docks SET is_occupied = FALSE, current_carrier = NULL, current_trailer = NULL, updated_at = NOW()
            WHERE id = ${appt.dock_id}
        `);
        return { appointmentId, status: 'NoShow' };
    }

    async listAppointments(tenantId: string, warehouseId: string, date?: string, status?: string) {
        let q = sql`
            SELECT a.*, d.dock_number, d.dock_type
            FROM yard_appointments a JOIN yard_docks d ON d.id = a.dock_id
            WHERE a.tenant_id = ${tenantId} AND a.warehouse_id = ${warehouseId}
        `;
        if (date) q = sql`${q} AND a.scheduled_start::DATE = ${date}::DATE`;
        if (status) q = sql`${q} AND a.status = ${status}`;
        q = sql`${q} ORDER BY a.scheduled_start ASC LIMIT 200`;
        return (await db.execute(q) as any).rows;
    }

    async getUtilizationReport(tenantId: string, warehouseId: string, fromDate: string, toDate: string) {
        return (await db.execute(sql`
            SELECT d.dock_number, d.dock_type,
                   COUNT(a.id) AS total_appointments,
                   COUNT(a.id) FILTER (WHERE a.status = 'Departed') AS completed,
                   COUNT(a.id) FILTER (WHERE a.status = 'NoShow') AS no_shows,
                   AVG(EXTRACT(EPOCH FROM (a.actual_departure - a.actual_arrival))/60)
                   FILTER (WHERE a.actual_arrival IS NOT NULL AND a.actual_departure IS NOT NULL) AS avg_dwell_mins
            FROM yard_docks d
            LEFT JOIN yard_appointments a ON a.dock_id = d.id
                AND a.scheduled_start::DATE BETWEEN ${fromDate}::DATE AND ${toDate}::DATE
            WHERE d.tenant_id = ${tenantId} AND d.warehouse_id = ${warehouseId}
            GROUP BY d.id, d.dock_number, d.dock_type
            ORDER BY total_appointments DESC
        `) as any).rows;
    }
}

export const yardManagementService = new YardManagementService();
