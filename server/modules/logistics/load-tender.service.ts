import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * LoadTenderService — TMS-OG-01
 *
 * Manages EDI 204 (Load Tender) / EDI 990 (Load Tender Response) lifecycle:
 * 1. Create load tender with stops
 * 2. Generate EDI 204 payload (simplified ANSI X12 structure)
 * 3. Record carrier response (Accept/Decline/Conditional)
 * 4. Workflow: Draft → Sent → Accepted/Declined/Cancelled
 */
export class LoadTenderService {

    async createTender(params: {
        tenantId: string;
        carrierId: string;  // SCAC code
        origin: { city: string; state: string; zip?: string; country?: string };
        destination: { city: string; state: string; zip?: string; country?: string };
        pickupDate: string;
        deliveryDate?: string;
        equipmentType?: string;
        weightLbs?: number;
        palletCount?: number;
        commodity?: string;
        freightCharge?: number;
        currencyCode?: string;
        referenceNumber?: string;
        stops?: Array<{
            stopType: string;
            locationName?: string;
            city: string;
            state: string;
            zip?: string;
            scheduledDate?: string;
            scheduledTime?: string;
            referenceId?: string;
        }>;
    }) {
        const tenderNumber = `TND-${Date.now()}`;

        const [tender] = (await db.execute(sql`
            INSERT INTO load_tenders (
                tenant_id, tender_number, carrier_scac, reference_number,
                origin_city, origin_state, origin_zip, origin_country,
                dest_city, dest_state, dest_zip, dest_country,
                pickup_date, delivery_date, equipment_type,
                weight_lbs, pallet_count, commodity, freight_charge, currency_code
            ) VALUES (
                ${params.tenantId}, ${tenderNumber}, ${params.carrierId}, ${params.referenceNumber ?? null},
                ${params.origin.city}, ${params.origin.state}, ${params.origin.zip ?? null}, ${params.origin.country ?? 'US'},
                ${params.destination.city}, ${params.destination.state}, ${params.destination.zip ?? null}, ${params.destination.country ?? 'US'},
                ${params.pickupDate}, ${params.deliveryDate ?? null}, ${params.equipmentType ?? 'TL'},
                ${params.weightLbs ?? null}, ${params.palletCount ?? null},
                ${params.commodity ?? null}, ${params.freightCharge ?? null}, ${params.currencyCode ?? 'USD'}
            ) RETURNING *
        `)) as any;

        // Insert stops if provided
        const stops = [];
        if (params.stops?.length) {
            for (let i = 0; i < params.stops.length; i++) {
                const s = params.stops[i];
                const [stop] = (await db.execute(sql`
                    INSERT INTO tender_stops (
                        tender_id, stop_sequence, stop_type, location_name,
                        city, state, zip, scheduled_date, scheduled_time, reference_id
                    ) VALUES (
                        ${tender.id}, ${i + 1}, ${s.stopType}, ${s.locationName ?? null},
                        ${s.city}, ${s.state}, ${s.zip ?? null},
                        ${s.scheduledDate ?? null}, ${s.scheduledTime ?? null}, ${s.referenceId ?? null}
                    ) RETURNING *
                `)) as any;
                stops.push(stop);
            }
        }

        return { tender, stops };
    }

    /** Generate simplified EDI 204 payload for the tender */
    generateEDI204(tender: any, stops: any[]) {
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, '').slice(2); // YYMMDD
        const time = now.toTimeString().slice(0, 5).replace(':', '');           // HHMM
        const ctrl = String(Math.floor(Math.random() * 900000000) + 100000000);

        const segments = [
            `ISA*00*          *00*          *02*${(tender.tenant_id || '').slice(0, 15).padEnd(15)}*02*${tender.carrier_scac.padEnd(15)}*${date}*${time}*U*00401*${ctrl}*0*P*~`,
            `GS*SM*${tender.tenant_id?.slice(0, 8) ?? 'SHIPPER'}*${tender.carrier_scac}*${date}*${time}*1*X*004010~`,
            `ST*204*0001~`,
            `B2**${tender.carrier_scac}**${tender.tender_number}**${tender.equipment_type}~`,
            `B2A*00~`,
            `L11*${tender.reference_number ?? tender.tender_number}*BM~`,
            ...stops.map((s, i) => [
                `S5*${i + 1}*${s.stop_type}~`,
                `N1*${s.stop_type === 'PU' ? 'SH' : 'CN'}*${s.location_name ?? s.city}~`,
                `N3*${s.city}~`,
                `N4*${s.city}*${s.state}*${s.zip ?? ''}*US~`,
                `G62*10*${s.scheduled_date?.replace(/-/g, '') ?? date}~`,
            ]).flat(),
            `AT7*~`,  // shipment status placeholder
            tender.weight_lbs ? `L0*1*${tender.weight_lbs}*B*${tender.pallet_count ?? 1}*PC*${tender.freight_charge ?? 0}*PE~` : '',
            `SE*${15 + stops.length * 5}*0001~`,
            `GE*1*1~`,
            `IEA*1*${ctrl}~`,
        ].filter(Boolean);

        return segments.join('\n');
    }

    async sendTender(tenderId: string) {
        // Mark as sent + generate EDI 204
        const tender = (await db.execute(sql`SELECT * FROM load_tenders WHERE id = ${tenderId}`) as any).rows?.[0];
        if (!tender) throw new Error('Tender not found');
        const stops = (await db.execute(sql`SELECT * FROM tender_stops WHERE tender_id = ${tenderId} ORDER BY stop_sequence`) as any).rows;

        const edi204 = this.generateEDI204(tender, stops);

        await db.execute(sql`
            UPDATE load_tenders SET status = 'Sent', edi_204_sent = TRUE, sent_at = NOW() WHERE id = ${tenderId}
        `);
        return { tenderId, status: 'Sent', edi204 };
    }

    /** Process EDI 990 response from carrier */
    async processEDI990(params: {
        tenderId: string;
        carrierResponse: 'Accept' | 'Decline' | 'Conditional';
        responseNote?: string;
    }) {
        const statusMap = { Accept: 'Accepted', Decline: 'Declined', Conditional: 'Conditional' };
        await db.execute(sql`
            UPDATE load_tenders
            SET status = ${statusMap[params.carrierResponse]},
                carrier_response = ${params.carrierResponse},
                edi_990_received = TRUE,
                responded_at = NOW()
            WHERE id = ${params.tenderId}
        `);
        return { tenderId: params.tenderId, status: statusMap[params.carrierResponse] };
    }

    async cancelTender(tenderId: string) {
        await db.execute(sql`UPDATE load_tenders SET status = 'Cancelled' WHERE id = ${tenderId}`);
        return { tenderId, status: 'Cancelled' };
    }

    async listTenders(tenantId: string, status?: string) {
        if (status) {
            return (await db.execute(sql`
                SELECT * FROM load_tenders WHERE tenant_id = ${tenantId} AND status = ${status}
                ORDER BY created_at DESC LIMIT 100
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT * FROM load_tenders WHERE tenant_id = ${tenantId}
            ORDER BY created_at DESC LIMIT 100
        `) as any).rows;
    }

    async getTenderWithStops(tenderId: string) {
        const tender = (await db.execute(sql`SELECT * FROM load_tenders WHERE id = ${tenderId}`) as any).rows?.[0];
        if (!tender) throw new Error('Tender not found');
        const stops = (await db.execute(sql`SELECT * FROM tender_stops WHERE tender_id = ${tenderId} ORDER BY stop_sequence`) as any).rows;
        return { tender, stops };
    }

    async getSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'Draft') AS draft,
                COUNT(*) FILTER (WHERE status = 'Sent') AS sent,
                COUNT(*) FILTER (WHERE status = 'Accepted') AS accepted,
                COUNT(*) FILTER (WHERE status = 'Declined') AS declined,
                SUM(freight_charge) FILTER (WHERE status = 'Accepted') AS total_freight
            FROM load_tenders WHERE tenant_id = ${tenantId}
        `) as any).rows?.[0];
    }
}

export const loadTenderService = new LoadTenderService();
