import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * CarrierManifestService — WMS-OG-03
 *
 * Manages carrier shipping manifests and ZPL II label generation.
 *
 * ZPL label includes:
 *   - Company / from address block
 *   - To address block
 *   - Tracking barcode (Code 128 / ^BCO)
 *   - Carrier routing indicator (service code)
 *   - weight / dims
 *   - Manifest reference
 */
export class CarrierManifestService {

    // ─── Manifest ─────────────────────────────────────────────────────────────

    async createManifest(params: {
        tenantId: string;
        carrierScac: string;
        shipDate: string;
        originWarehouse: string;
    }) {
        const manifestNumber = `MFT-${params.carrierScac}-${Date.now()}`;
        const [manifest] = (await db.execute(sql`
            INSERT INTO carrier_manifests (tenant_id, manifest_number, carrier_scac, ship_date, origin_warehouse)
            VALUES (${params.tenantId}, ${manifestNumber}, ${params.carrierScac}, ${params.shipDate}, ${params.originWarehouse})
            RETURNING *
        `)) as any;
        return manifest;
    }

    async addPackage(params: {
        manifestId: string;
        trackingNumber?: string;
        lpn?: string;
        orderId?: string;
        customerName?: string;
        shipTo: {
            address: string;
            city: string;
            state: string;
            zip: string;
            country?: string;
        };
        weightKg: number;
        dims?: { lengthCm: number; widthCm: number; heightCm: number };
        serviceCode?: string;
    }) {
        const trackingNumber = params.trackingNumber ?? `TRK${Date.now()}${Math.floor(Math.random() * 9999)}`;
        const zpl = this.generateZPL({
            trackingNumber,
            customerName: params.customerName,
            shipTo: params.shipTo,
            weightKg: params.weightKg,
            dims: params.dims,
            serviceCode: params.serviceCode ?? 'GROUND',
            orderId: params.orderId,
        });

        const [pkg] = (await db.execute(sql`
            INSERT INTO manifest_packages (
                manifest_id, tracking_number, lpn, order_id, customer_name,
                ship_to_address, ship_to_city, ship_to_state, ship_to_zip, ship_to_country,
                weight_kg, dims_l_cm, dims_w_cm, dims_h_cm, service_code, label_zpl
            ) VALUES (
                ${params.manifestId}, ${trackingNumber}, ${params.lpn ?? null}, ${params.orderId ?? null},
                ${params.customerName ?? null}, ${params.shipTo.address},
                ${params.shipTo.city}, ${params.shipTo.state}, ${params.shipTo.zip},
                ${params.shipTo.country ?? 'US'}, ${params.weightKg},
                ${params.dims?.lengthCm ?? null}, ${params.dims?.widthCm ?? null}, ${params.dims?.heightCm ?? null},
                ${params.serviceCode ?? 'GROUND'}, ${zpl}
            ) RETURNING *
        `)) as any;

        // Update manifest totals
        await db.execute(sql`
            UPDATE carrier_manifests
            SET total_packages = total_packages + 1,
                total_weight_kg = COALESCE(total_weight_kg, 0) + ${params.weightKg}
            WHERE id = ${params.manifestId}
        `);

        return { package: pkg, zpl };
    }

    async printLabel(packageId: string) {
        await db.execute(sql`
            UPDATE manifest_packages SET label_printed = TRUE, label_printed_at = NOW() WHERE id = ${packageId}
        `);
        const pkg = (await db.execute(sql`SELECT * FROM manifest_packages WHERE id = ${packageId}`) as any).rows?.[0];
        return { packageId, trackingNumber: pkg?.tracking_number, zpl: pkg?.label_zpl };
    }

    async closeManifest(manifestId: string) {
        const manifest = (await db.execute(sql`SELECT * FROM carrier_manifests WHERE id = ${manifestId}`) as any).rows?.[0];
        if (!manifest) throw new Error('Manifest not found');
        if (manifest.status === 'Closed' || manifest.status === 'Tendered') return manifest;

        await db.execute(sql`
            UPDATE carrier_manifests SET status = 'Closed', closed_at = NOW() WHERE id = ${manifestId}
        `);
        return { manifestId, status: 'Closed', packages: manifest.total_packages };
    }

    async tenderManifest(manifestId: string) {
        await db.execute(sql`
            UPDATE carrier_manifests SET status = 'Tendered' WHERE id = ${manifestId}
        `);
        return { manifestId, status: 'Tendered' };
    }

    async listManifests(tenantId: string, status?: string) {
        if (status) {
            return (await db.execute(sql`
                SELECT * FROM carrier_manifests WHERE tenant_id = ${tenantId} AND status = ${status}
                ORDER BY created_at DESC LIMIT 100
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT * FROM carrier_manifests WHERE tenant_id = ${tenantId}
            ORDER BY created_at DESC LIMIT 100
        `) as any).rows;
    }

    async getManifestPackages(manifestId: string) {
        return (await db.execute(sql`
            SELECT * FROM manifest_packages WHERE manifest_id = ${manifestId}
            ORDER BY created_at ASC
        `) as any).rows;
    }

    async getManifestSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT
                COUNT(*) FILTER (WHERE status = 'Open') AS open_manifests,
                COUNT(*) FILTER (WHERE status = 'Closed') AS closed_manifests,
                COUNT(*) FILTER (WHERE status = 'Tendered') AS tendered_manifests,
                SUM(total_packages) AS total_packages_today
            FROM carrier_manifests
            WHERE tenant_id = ${tenantId} AND ship_date = CURRENT_DATE
        `) as any).rows?.[0];
    }

    // ─── ZPL II Label Generator ───────────────────────────────────────────────

    generateZPL(params: {
        trackingNumber: string;
        customerName?: string;
        shipTo: { address: string; city: string; state: string; zip: string; country?: string };
        weightKg: number;
        dims?: { lengthCm: number; widthCm: number; heightCm: number };
        serviceCode?: string;
        orderId?: string;
    }) {
        const { trackingNumber, customerName, shipTo, weightKg, dims, serviceCode, orderId } = params;
        const weightLbs = (weightKg * 2.20462).toFixed(1);
        const svcLabel = (serviceCode ?? 'GROUND').padEnd(10);

        // Human-readable dims
        const dimsStr = dims
            ? `${dims.lengthCm.toFixed(0)} x ${dims.widthCm.toFixed(0)} x ${dims.heightCm.toFixed(0)} cm`
            : 'N/A';

        return [
            '^XA',
            '^MMT',
            '^PW812',
            '^LL1218',
            '^LS0',
            // Carrier routing indicator
            `^FO30,30^ADN,36,20^FD${svcLabel}^FS`,
            // Tracking barcode (Code 128)
            `^FO30,80^BCO,100,Y,N,N^FD${trackingNumber}^FS`,
            // Tracking number text
            `^FO30,195^ADN,18,10^FD${trackingNumber}^FS`,
            // Divider
            '^FO30,220^GB752,3,3^FS',
            // Ship To block
            `^FO30,235^ADN,28,15^FDSHIP TO:^FS`,
            `^FO30,270^ADN,24,13^FD${(customerName ?? 'CUSTOMER').toUpperCase()}^FS`,
            `^FO30,300^ADN,24,13^FD${shipTo.address.toUpperCase()}^FS`,
            `^FO30,330^ADN,24,13^FD${shipTo.city.toUpperCase()}, ${shipTo.state} ${shipTo.zip}^FS`,
            `^FO30,360^ADN,24,13^FD${(shipTo.country ?? 'US').toUpperCase()}^FS`,
            // Divider
            '^FO30,395^GB752,3,3^FS',
            // Weight / dims
            `^FO30,410^ADN,18,10^FDWT: ${weightLbs} LBS  DIMS: ${dimsStr}^FS`,
            // Order ref
            orderId ? `^FO30,435^ADN,18,10^FDORDER: ${orderId}^FS` : '',
            '^XZ',
        ].filter(Boolean).join('\n');
    }
}

export const carrierManifestService = new CarrierManifestService();
