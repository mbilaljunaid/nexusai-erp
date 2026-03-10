import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * SupplierQualificationService — SUP-OG-03
 *
 * Manages supplier qualification questionnaires:
 * 1. Create reusable qualification templates with weighted sections + questions
 * 2. Supplier fills out responses → submits
 * 3. Internal reviewer scores each section → auto-calculates weighted total
 * 4. Risk tier assigned: Low / Medium / High / Critical
 * 5. Approve (with valid_until date) or Reject
 */

// Default risk tiers based on score
function scoreToRiskTier(score: number): string {
    if (score >= 85) return 'Low';
    if (score >= 70) return 'Medium';
    if (score >= 50) return 'High';
    return 'Critical';
}

export class SupplierQualificationService {

    // ─── Templates ────────────────────────────────────────────────────────────

    async createTemplate(params: {
        tenantId: string;
        templateName: string;
        category?: string;
        passingScore?: number;
        sections: Array<{
            sectionTitle: string;
            weight: number;
            questions: Array<{ q: string; type: 'TEXT' | 'YESNO' | 'SCALE' | 'UPLOAD'; required: boolean }>;
        }>;
    }) {
        const [tpl] = (await db.execute(sql`
            INSERT INTO supplier_qualification_templates (
                tenant_id, template_name, category, sections, passing_score
            ) VALUES (
                ${params.tenantId}, ${params.templateName}, ${params.category ?? null},
                ${JSON.stringify(params.sections)}, ${params.passingScore ?? 70}
            ) RETURNING *
        `)) as any;
        return tpl;
    }

    async listTemplates(tenantId: string) {
        return (await db.execute(sql`
            SELECT * FROM supplier_qualification_templates
            WHERE tenant_id = ${tenantId} AND is_active = TRUE
            ORDER BY template_name
        `) as any).rows;
    }

    // ─── Qualifications ───────────────────────────────────────────────────────

    async startQualification(params: {
        tenantId: string;
        supplierId: string;
        templateId: string;
    }) {
        const [qual] = (await db.execute(sql`
            INSERT INTO supplier_qualifications (tenant_id, supplier_id, template_id)
            VALUES (${params.tenantId}, ${params.supplierId}, ${params.templateId})
            RETURNING *
        `)) as any;
        return qual;
    }

    async saveResponses(qualificationId: string, responses: Record<string, any>) {
        await db.execute(sql`
            UPDATE supplier_qualifications
            SET responses = ${JSON.stringify(responses)}, updated_at = NOW()
            WHERE id = ${qualificationId}
        `);
        return { qualificationId, saved: Object.keys(responses).length };
    }

    async submit(qualificationId: string) {
        const qual = (await db.execute(sql`SELECT * FROM supplier_qualifications WHERE id = ${qualificationId}`) as any).rows?.[0];
        if (!qual) throw new Error('Qualification not found');
        if (qual.status !== 'Draft') throw new Error(`Cannot submit: current status is ${qual.status}`);

        await db.execute(sql`
            UPDATE supplier_qualifications
            SET status = 'Submitted', submitted_at = NOW(), updated_at = NOW()
            WHERE id = ${qualificationId}
        `);
        return { qualificationId, status: 'Submitted' };
    }

    async beginReview(qualificationId: string, reviewerId: string) {
        await db.execute(sql`
            UPDATE supplier_qualifications
            SET status = 'UnderReview', reviewer_id = ${reviewerId}, updated_at = NOW()
            WHERE id = ${qualificationId}
        `);
        return { qualificationId, status: 'UnderReview' };
    }

    /**
     * Score & approve. sectionScores: { [sectionTitle]: 0-100 }
     * Weighted sum computed server-side using template weights.
     */
    async approve(params: {
        qualificationId: string;
        reviewerId: string;
        sectionScores: Record<string, number>;
        reviewerNotes?: string;
        validMonths?: number;
    }) {
        const qual = (await db.execute(sql`
            SELECT q.*, t.sections, t.passing_score
            FROM supplier_qualifications q
            JOIN supplier_qualification_templates t ON t.id = q.template_id
            WHERE q.id = ${params.qualificationId}
        `) as any).rows?.[0];
        if (!qual) throw new Error('Qualification not found');

        const sections: any[] = typeof qual.sections === 'string' ? JSON.parse(qual.sections) : qual.sections;
        const totalWeight = sections.reduce((s: number, sec: any) => s + (sec.weight ?? 0), 0) || 100;
        const weightedScore = sections.reduce((s: number, sec: any) => {
            const rawScore = params.sectionScores[sec.sectionTitle] ?? 0;
            return s + (rawScore * (sec.weight ?? 0)) / totalWeight;
        }, 0);

        const finalScore = Math.min(100, Math.round(weightedScore * 10) / 10);
        const riskTier = scoreToRiskTier(finalScore);
        const validMonths = params.validMonths ?? 12;
        const validUntil = new Date();
        validUntil.setMonth(validUntil.getMonth() + validMonths);

        await db.execute(sql`
            UPDATE supplier_qualifications
            SET status = 'Approved', reviewer_id = ${params.reviewerId},
                reviewed_at = NOW(), score = ${finalScore}, risk_tier = ${riskTier},
                reviewer_notes = ${params.reviewerNotes ?? null},
                valid_until = ${validUntil.toISOString().slice(0, 10)},
                updated_at = NOW()
            WHERE id = ${params.qualificationId}
        `);

        return { qualificationId: params.qualificationId, status: 'Approved', score: finalScore, riskTier, validUntil };
    }

    async reject(qualificationId: string, reviewerId: string, notes: string) {
        await db.execute(sql`
            UPDATE supplier_qualifications
            SET status = 'Rejected', reviewer_id = ${reviewerId},
                reviewed_at = NOW(), reviewer_notes = ${notes}, updated_at = NOW()
            WHERE id = ${qualificationId}
        `);
        return { qualificationId, status: 'Rejected' };
    }

    async addDocument(params: { qualificationId: string; documentName: string; documentType?: string; documentUrl: string }) {
        const [doc] = (await db.execute(sql`
            INSERT INTO qualification_documents (qualification_id, document_name, document_type, document_url)
            VALUES (${params.qualificationId}, ${params.documentName}, ${params.documentType ?? null}, ${params.documentUrl})
            RETURNING *
        `)) as any;
        return doc;
    }

    async listQualifications(tenantId: string, supplierId?: string, status?: string) {
        let q = sql`
            SELECT sq.*, t.template_name, t.passing_score
            FROM supplier_qualifications sq
            JOIN supplier_qualification_templates t ON t.id = sq.template_id
            WHERE sq.tenant_id = ${tenantId}
        `;
        if (supplierId) q = sql`${q} AND sq.supplier_id = ${supplierId}`;
        if (status) q = sql`${q} AND sq.status = ${status}`;
        q = sql`${q} ORDER BY sq.updated_at DESC LIMIT 200`;
        return (await db.execute(q) as any).rows;
    }

    async getQualificationDetail(qualificationId: string) {
        const qual = (await db.execute(sql`
            SELECT sq.*, t.template_name, t.sections, t.passing_score
            FROM supplier_qualifications sq
            JOIN supplier_qualification_templates t ON t.id = sq.template_id
            WHERE sq.id = ${qualificationId}
        `) as any).rows?.[0];
        if (!qual) throw new Error('Qualification not found');

        const docs = (await db.execute(sql`
            SELECT * FROM qualification_documents WHERE qualification_id = ${qualificationId}
        `) as any).rows;

        return { qualification: qual, documents: docs };
    }

    async getSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'Approved') AS approved,
                COUNT(*) FILTER (WHERE status = 'Submitted' OR status = 'UnderReview') AS pending_review,
                COUNT(*) FILTER (WHERE status = 'Rejected') AS rejected,
                COUNT(*) FILTER (WHERE risk_tier = 'High' OR risk_tier = 'Critical') AS high_risk,
                ROUND(AVG(score) FILTER (WHERE status = 'Approved'), 1) AS avg_score
            FROM supplier_qualifications WHERE tenant_id = ${tenantId}
        `) as any).rows?.[0];
    }
}

export const supplierQualificationService = new SupplierQualificationService();
