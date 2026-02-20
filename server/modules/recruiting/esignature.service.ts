import { db } from "../../db";
import { sql } from "drizzle-orm";
import crypto from "crypto";

/**
 * ESignatureService — REC-OG-02
 * Manages offer letter and employment document e-signature lifecycle.
 * Supports inline HTML signing and external PDF link flow.
 */
export class ESignatureService {

    async createDocument(params: {
        tenantId: string; documentType?: string; applicantId: string;
        candidateName?: string; candidateEmail?: string;
        documentUrl?: string; htmlContent?: string;
        expiresInDays?: number;
    }) {
        const expiresAt = new Date(Date.now() + (params.expiresInDays ?? 7) * 86400000).toISOString();
        const [doc] = (await db.execute(sql`
            INSERT INTO esignature_documents (
                tenant_id, document_type, applicant_id, candidate_name, candidate_email,
                document_url, html_content, expires_at
            ) VALUES (
                ${params.tenantId}, ${params.documentType ?? 'OFFER_LETTER'}, ${params.applicantId},
                ${params.candidateName ?? null}, ${params.candidateEmail ?? null},
                ${params.documentUrl ?? null}, ${params.htmlContent ?? null}, ${expiresAt}
            ) RETURNING *
        `)) as any;
        return doc;
    }

    async sendForSignature(documentId: string) {
        const doc = await this._get(documentId);
        if (!doc) throw new Error('Document not found');
        // In production: trigger SendGrid/DocuSign notification here
        const signingLink = `https://app.example.com/sign/${documentId}?token=${crypto.randomBytes(16).toString('hex')}`;
        await db.execute(sql`
            UPDATE esignature_documents
            SET status = 'Sent', sent_at = NOW(),
                audit_trail = audit_trail || ${JSON.stringify([{ event: 'Sent', at: new Date().toISOString() }])}::jsonb
            WHERE id = ${documentId}
        `);
        return { documentId, signingLink, status: 'Sent' };
    }

    async markOpened(documentId: string, ipAddress?: string, userAgent?: string) {
        await db.execute(sql`
            UPDATE esignature_documents
            SET status = CASE WHEN status = 'Sent' THEN 'Opened' ELSE status END,
                opened_at = COALESCE(opened_at, NOW()),
                ip_address = COALESCE(ip_address, ${ipAddress ?? null}),
                user_agent = COALESCE(user_agent, ${userAgent ?? null}),
                audit_trail = audit_trail || ${JSON.stringify([{ event: 'Opened', at: new Date().toISOString(), ip: ipAddress }])}::jsonb
            WHERE id = ${documentId}
        `);
        return { documentId, status: 'Opened' };
    }

    async signDocument(documentId: string, signatureData: string, ipAddress?: string) {
        const doc = await this._get(documentId);
        if (!doc) throw new Error('Document not found');
        if (doc.status === 'Signed') throw new Error('Already signed');
        if (doc.expires_at && new Date(doc.expires_at) < new Date()) throw new Error('Document expired');

        await db.execute(sql`
            UPDATE esignature_documents
            SET status = 'Signed', signed_at = NOW(), signature_data = ${signatureData},
                ip_address = COALESCE(ip_address, ${ipAddress ?? null}),
                audit_trail = audit_trail || ${JSON.stringify([{ event: 'Signed', at: new Date().toISOString(), ip: ipAddress }])}::jsonb
            WHERE id = ${documentId}
        `);
        return { documentId, status: 'Signed', signedAt: new Date().toISOString() };
    }

    async declineDocument(documentId: string, reason?: string) {
        await db.execute(sql`
            UPDATE esignature_documents
            SET status = 'Declined', declined_at = NOW(),
                audit_trail = audit_trail || ${JSON.stringify([{ event: 'Declined', at: new Date().toISOString(), reason }])}::jsonb
            WHERE id = ${documentId}
        `);
        return { documentId, status: 'Declined' };
    }

    async listDocuments(tenantId: string, applicantId?: string, status?: string, docType?: string) {
        let q = sql`SELECT id, tenant_id, document_type, applicant_id, candidate_name, candidate_email, status, sent_at, opened_at, signed_at, expires_at, created_at FROM esignature_documents WHERE tenant_id = ${tenantId}`;
        if (applicantId) q = sql`${q} AND applicant_id = ${applicantId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        if (docType) q = sql`${q} AND document_type = ${docType}`;
        q = sql`${q} ORDER BY created_at DESC LIMIT 200`;
        return (await db.execute(q) as any).rows;
    }

    async getDocument(documentId: string) { return this._get(documentId); }

    async getAuditTrail(documentId: string) {
        const doc = (await db.execute(sql`SELECT audit_trail, candidate_name, candidate_email, status FROM esignature_documents WHERE id = ${documentId}`) as any).rows?.[0];
        return doc;
    }

    async getSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT
                COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
                COUNT(*) FILTER (WHERE status = 'Sent') AS sent,
                COUNT(*) FILTER (WHERE status = 'Signed') AS signed,
                COUNT(*) FILTER (WHERE status = 'Declined') AS declined,
                COUNT(*) FILTER (WHERE status = 'Expired' OR (expires_at < NOW() AND status NOT IN('Signed','Declined'))) AS expired
            FROM esignature_documents WHERE tenant_id = ${tenantId}
        `) as any).rows?.[0];
    }

    private async _get(id: string) {
        return (await db.execute(sql`SELECT * FROM esignature_documents WHERE id = ${id}`) as any).rows?.[0] ?? null;
    }
}

export const eSignatureService = new ESignatureService();
