import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * SupplierCertificationService — SUP-OG-02
 *
 * Manages supplier compliance certificates:
 * 1. Add / update cert records with issuing body, dates, doc URL
 * 2. Verify certs (internal compliance team)
 * 3. Detect expiring certs (configurable alert window)
 * 4. Mark expired / revoked
 * 5. Portfolio view: cert coverage across suppliers
 */

const KNOWN_CERT_TYPES = [
    'ISO9001', 'ISO14001', 'ISO45001', 'ISO27001',
    'SOC2', 'GDPR', 'SMETA', 'FSSC22000',
    'REACH', 'ROHS', 'CUSTOM',
];

export class SupplierCertificationService {

    async addCertification(params: {
        tenantId: string;
        supplierId: string;
        certType: string;
        certNumber?: string;
        issuingBody?: string;
        issueDate?: string;
        expiryDate?: string;
        documentUrl?: string;
        alertDaysBefore?: number;
    }) {
        if (!KNOWN_CERT_TYPES.includes(params.certType)) {
            params.certType = 'CUSTOM';
        }
        const [cert] = (await db.execute(sql`
            INSERT INTO supplier_certifications (
                tenant_id, supplier_id, cert_type, cert_number, issuing_body,
                issue_date, expiry_date, document_url, alert_days_before
            ) VALUES (
                ${params.tenantId}, ${params.supplierId}, ${params.certType},
                ${params.certNumber ?? null}, ${params.issuingBody ?? null},
                ${params.issueDate ?? null}, ${params.expiryDate ?? null},
                ${params.documentUrl ?? null}, ${params.alertDaysBefore ?? 30}
            ) RETURNING *
        `)) as any;
        return cert;
    }

    async verifyCertification(certId: string, verifiedBy: string) {
        await db.execute(sql`
            UPDATE supplier_certifications
            SET verified_by = ${verifiedBy}, verified_at = NOW(), status = 'Active'
            WHERE id = ${certId}
        `);
        return { certId, status: 'Active', verifiedBy };
    }

    async revokeCertification(certId: string, reason?: string) {
        await db.execute(sql`
            UPDATE supplier_certifications SET status = 'Revoked' WHERE id = ${certId}
        `);
        return { certId, status: 'Revoked', reason };
    }

    async listCertifications(tenantId: string, supplierId?: string, status?: string, certType?: string) {
        let q = sql`SELECT * FROM supplier_certifications WHERE tenant_id = ${tenantId}`;
        if (supplierId) q = sql`${q} AND supplier_id = ${supplierId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        if (certType) q = sql`${q} AND cert_type = ${certType}`;
        q = sql`${q} ORDER BY expiry_date ASC NULLS LAST LIMIT 500`;
        return (await db.execute(q) as any).rows;
    }

    /**
     * Get certs expiring within `daysAhead` that have auto_renew_alert = true
     */
    async getExpiringAlerts(tenantId: string, daysAhead = 60) {
        return (await db.execute(sql`
            SELECT *, (expiry_date - CURRENT_DATE) AS days_remaining
            FROM supplier_certifications
            WHERE tenant_id = ${tenantId}
              AND status = 'Active'
              AND auto_renew_alert = TRUE
              AND expiry_date IS NOT NULL
              AND expiry_date <= CURRENT_DATE + ${daysAhead}
            ORDER BY expiry_date ASC
        `) as any).rows;
    }

    /**
     * Sweep expired certs — marks status = 'Expired' for past expiry_date
     */
    async processExpired(tenantId: string) {
        const result = await db.execute(sql`
            UPDATE supplier_certifications
            SET status = 'Expired'
            WHERE tenant_id = ${tenantId}
              AND status = 'Active'
              AND expiry_date < CURRENT_DATE
        `);
        return { updated: (result as any).rowCount ?? 0 };
    }

    /**
     * Portfolio health: cert coverage by type across all suppliers
     */
    async getCertificatePortfolio(tenantId: string) {
        return (await db.execute(sql`
            SELECT
                cert_type,
                COUNT(DISTINCT supplier_id) AS suppliers_with_cert,
                COUNT(*) FILTER (WHERE status = 'Active') AS active,
                COUNT(*) FILTER (WHERE status = 'Expired') AS expired,
                COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
                MIN(expiry_date) AS earliest_expiry
            FROM supplier_certifications
            WHERE tenant_id = ${tenantId}
            GROUP BY cert_type
            ORDER BY cert_type
        `) as any).rows;
    }

    async getSupplierCertSummary(tenantId: string, supplierId: string) {
        return (await db.execute(sql`
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'Active') AS active,
                COUNT(*) FILTER (WHERE status = 'Expired') AS expired,
                COUNT(*) FILTER (WHERE expiry_date <= CURRENT_DATE + 60 AND status = 'Active') AS expiring_soon
            FROM supplier_certifications
            WHERE tenant_id = ${tenantId} AND supplier_id = ${supplierId}
        `) as any).rows?.[0];
    }
}

export const supplierCertificationService = new SupplierCertificationService();
