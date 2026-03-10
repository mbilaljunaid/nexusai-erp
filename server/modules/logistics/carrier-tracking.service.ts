import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * CarrierTrackingService — TMS-OG-02
 *
 * Processes EDI 214 (Transportation Carrier Shipment Status Message) events
 * and maintains real-time shipment visibility.
 *
 * EDI 214 common status codes:
 *   X3 = Picked Up
 *   X6 = En Route (In Transit)
 *   X1 = Out for Delivery
 *   D1 = Delivered
 *   AF = Exception (Delay/Damage/Refused)
 *   AG = Estimated delivery change
 */
const EVENT_STATUS_MAP: Record<string, string> = {
    X3: 'PickedUp',
    X6: 'InTransit',
    X1: 'OutForDelivery',
    D1: 'Delivered',
    AF: 'Exception',
    AG: 'InTransit',
    J1: 'InTransit',
    A9: 'Tendered',
};

export class CarrierTrackingService {

    async createShipment(params: {
        tenantId: string;
        tenderId?: string;
        proNumber?: string;
        trackingNumber?: string;
        carrierScac: string;
        originCity?: string;
        destCity?: string;
    }) {
        const [shipment] = (await db.execute(sql`
            INSERT INTO shipment_trackings (
                tenant_id, tender_id, pro_number, tracking_number,
                carrier_scac, current_status, origin_city, dest_city
            ) VALUES (
                ${params.tenantId}, ${params.tenderId ?? null}, ${params.proNumber ?? null},
                ${params.trackingNumber ?? null}, ${params.carrierScac},
                'Tendered', ${params.originCity ?? null}, ${params.destCity ?? null}
            ) RETURNING *
        `)) as any;
        return shipment;
    }

    /**
     * Process an EDI 214 status update.
     * Maps standard AT7/AT8 status codes to friendly status values.
     */
    async processEDI214(params: {
        shipmentId?: string;
        proNumber?: string;
        tenantId: string;
        eventCode: string;
        eventDescription?: string;
        eventCity?: string;
        eventState?: string;
        eventTime?: string;
        eta?: string;
        lat?: number;
        lng?: number;
    }) {
        // Resolve shipment
        let shipment: any;
        if (params.shipmentId) {
            shipment = (await db.execute(sql`SELECT * FROM shipment_trackings WHERE id = ${params.shipmentId}`) as any).rows?.[0];
        } else if (params.proNumber) {
            shipment = (await db.execute(sql`SELECT * FROM shipment_trackings WHERE tenant_id = ${params.tenantId} AND pro_number = ${params.proNumber}`) as any).rows?.[0];
        }
        if (!shipment) throw new Error('Shipment not found');

        const newStatus = EVENT_STATUS_MAP[params.eventCode.toUpperCase()] ?? 'InTransit';
        const eventTime = params.eventTime ? new Date(params.eventTime) : new Date();

        // Insert tracking event
        const [event] = (await db.execute(sql`
            INSERT INTO tracking_events (
                shipment_id, event_code, event_description,
                event_city, event_state, event_time
            ) VALUES (
                ${shipment.id}, ${params.eventCode.toUpperCase()}, ${params.eventDescription ?? EVENT_STATUS_MAP[params.eventCode.toUpperCase()] ?? params.eventCode},
                ${params.eventCity ?? null}, ${params.eventState ?? null}, ${eventTime.toISOString()}
            ) RETURNING *
        `)) as any;

        // Update shipment status
        await db.execute(sql`
            UPDATE shipment_trackings SET
                current_status = ${newStatus},
                current_city   = COALESCE(${params.eventCity ?? null}, current_city),
                current_state  = COALESCE(${params.eventState ?? null}, current_state),
                current_lat    = COALESCE(${params.lat ?? null}, current_lat),
                current_lng    = COALESCE(${params.lng ?? null}, current_lng),
                eta            = COALESCE(${params.eta ?? null}::TIMESTAMPTZ, eta),
                last_event_at  = ${eventTime.toISOString()},
                edi_214_count  = edi_214_count + 1
            WHERE id = ${shipment.id}
        `);

        return {
            shipmentId: shipment.id,
            proNumber: shipment.pro_number,
            previousStatus: shipment.current_status,
            newStatus,
            event,
        };
    }

    async getShipmentStatus(shipmentId: string) {
        const shipment = (await db.execute(sql`SELECT * FROM shipment_trackings WHERE id = ${shipmentId}`) as any).rows?.[0];
        if (!shipment) throw new Error('Shipment not found');
        const events = (await db.execute(sql`
            SELECT * FROM tracking_events WHERE shipment_id = ${shipmentId}
            ORDER BY event_time DESC
        `) as any).rows;
        return { shipment, events };
    }

    async listShipments(tenantId: string, status?: string, carrierId?: string) {
        let query = sql`SELECT * FROM shipment_trackings WHERE tenant_id = ${tenantId}`;
        if (status) query = sql`${query} AND current_status = ${status}`;
        if (carrierId) query = sql`${query} AND carrier_scac = ${carrierId}`;
        query = sql`${query} ORDER BY last_event_at DESC NULLS LAST LIMIT 200`;
        return (await db.execute(query) as any).rows;
    }

    async getExceptions(tenantId: string) {
        return (await db.execute(sql`
            SELECT st.*, te.event_description AS exception_reason
            FROM shipment_trackings st
            LEFT JOIN LATERAL (
                SELECT event_description FROM tracking_events
                WHERE shipment_id = st.id AND event_code = 'AF'
                ORDER BY event_time DESC LIMIT 1
            ) te ON TRUE
            WHERE st.tenant_id = ${tenantId} AND st.current_status = 'Exception'
            ORDER BY st.last_event_at DESC
        `) as any).rows;
    }

    async getDeliveryPerformance(tenantId: string) {
        return (await db.execute(sql`
            SELECT
                carrier_scac,
                COUNT(*) AS total_shipments,
                COUNT(*) FILTER (WHERE current_status = 'Delivered') AS delivered,
                COUNT(*) FILTER (WHERE current_status = 'Exception') AS exceptions,
                ROUND(
                    100.0 * COUNT(*) FILTER (WHERE current_status = 'Delivered') /
                    NULLIF(COUNT(*), 0), 2
                ) AS on_time_pct
            FROM shipment_trackings
            WHERE tenant_id = ${tenantId}
            GROUP BY carrier_scac
            ORDER BY on_time_pct DESC NULLS LAST
        `) as any).rows;
    }

    async getSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE current_status = 'InTransit') AS in_transit,
                COUNT(*) FILTER (WHERE current_status = 'Delivered') AS delivered,
                COUNT(*) FILTER (WHERE current_status = 'Exception') AS exceptions,
                COUNT(*) FILTER (WHERE current_status = 'OutForDelivery') AS out_for_delivery
            FROM shipment_trackings WHERE tenant_id = ${tenantId}
        `) as any).rows?.[0];
    }
}

export const carrierTrackingService = new CarrierTrackingService();
