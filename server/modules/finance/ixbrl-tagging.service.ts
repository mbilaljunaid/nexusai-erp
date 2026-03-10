import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * IXBRLTaggingService — FC-OG-03 (Disclosure Management / iXBRL Tagging)
 *
 * Manages iXBRL tagging sessions for EDGAR (US), ESMA (EU), CH (CH GAAP),
 * and AU ASIC filings. Tags are stored per session and can be exported.
 */
export class IXBRLTaggingService {

    async createSession(params: {
        tenantId: string;
        periodName: string;
        filingStandard: 'EDGAR' | 'ESMA' | 'CH' | 'AU_ASIC';
        taxonomyVersion: string;
        documentUrl: string;
        createdBy: string;
    }) {
        const [session] = (await db.execute(sql`
            INSERT INTO ixbrl_tagging_sessions (
                tenant_id, period_name, filing_standard, taxonomy_version,
                document_url, status, created_by
            ) VALUES (
                ${params.tenantId}, ${params.periodName}, ${params.filingStandard},
                ${params.taxonomyVersion}, ${params.documentUrl}, 'InProgress', ${params.createdBy}
            )
            RETURNING *
        `)) as any;
        return session;
    }

    async addTag(sessionId: string, tag: {
        element: string;       // e.g. 'us-gaap:Assets'
        context: string;       // e.g. 'duration_2026-01-01_2026-12-31'
        value: string;         // e.g. '250000000'
        unit?: string;         // e.g. 'USD'
        decimals?: number;     // e.g. -6 for millions
    }) {
        const current = (await db.execute(sql`
            SELECT tags FROM ixbrl_tagging_sessions WHERE id = ${sessionId}
        `) as any).rows?.[0];
        if (!current) throw new Error(`Session ${sessionId} not found`);

        const tags = Array.isArray(current.tags) ? current.tags : [];
        tags.push({ ...tag, taggedAt: new Date().toISOString() });

        await db.execute(sql`
            UPDATE ixbrl_tagging_sessions
            SET tags = ${JSON.stringify(tags)}, updated_at = NOW()
            WHERE id = ${sessionId}
        `);
        return { sessionId, tagCount: tags.length };
    }

    async submitForFiling(sessionId: string) {
        await db.execute(sql`
            UPDATE ixbrl_tagging_sessions
            SET status = 'Reviewed', updated_at = NOW()
            WHERE id = ${sessionId} AND status = 'InProgress'
        `);
        return { sessionId, status: 'Reviewed' };
    }

    async markFiled(sessionId: string, outputUrl: string) {
        await db.execute(sql`
            UPDATE ixbrl_tagging_sessions
            SET status = 'Filed', output_url = ${outputUrl}, filed_at = NOW(), updated_at = NOW()
            WHERE id = ${sessionId} AND status = 'Reviewed'
        `);
        return { sessionId, status: 'Filed' };
    }

    async getSession(sessionId: string) {
        return (await db.execute(sql`
            SELECT * FROM ixbrl_tagging_sessions WHERE id = ${sessionId}
        `) as any).rows?.[0] ?? null;
    }

    async listSessions(tenantId: string, periodName?: string) {
        if (periodName) {
            return (await db.execute(sql`
                SELECT id, period_name, filing_standard, taxonomy_version, status, created_at
                FROM ixbrl_tagging_sessions
                WHERE tenant_id = ${tenantId} AND period_name = ${periodName}
                ORDER BY created_at DESC
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT id, period_name, filing_standard, taxonomy_version, status, created_at
            FROM ixbrl_tagging_sessions
            WHERE tenant_id = ${tenantId}
            ORDER BY created_at DESC LIMIT 50
        `) as any).rows;
    }

    /**
     * Export iXBRL-tagged HTML for a session
     * In production: call a headless browser service or iXBRL library (Arelle)
     */
    async exportIXBRL(sessionId: string): Promise<string> {
        const session = await this.getSession(sessionId);
        if (!session) throw new Error(`Session ${sessionId} not found`);

        const tags = Array.isArray(session.tags) ? session.tags : [];

        // Build iXBRL XML namespace header
        const ixbrlDoc = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:ix="http://www.xbrl.org/2013/inlineXBRL"
      xmlns:ixt="http://www.xbrl.org/inlineXBRL/transformation/2020-02-12">
<head>
  <title>iXBRL Filing — ${session.period_name} (${session.filing_standard})</title>
</head>
<body>
${tags.map((t: any) => `  <ix:nonFraction name="${t.element}" contextRef="${t.context}"
     unitRef="${t.unit ?? 'USD'}" decimals="${t.decimals ?? -3}">${t.value}</ix:nonFraction>`).join('\n')}
</body>
</html>`;
        return ixbrlDoc;
    }
}

export const ixbrlTaggingService = new IXBRLTaggingService();
