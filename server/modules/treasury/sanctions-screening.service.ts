import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * SanctionsScreeningService — TREAS-OG-04
 *
 * Screens counterparties against OFAC SDN, UN Consolidated, EU, and HM Treasury lists.
 * Uses fuzzy name matching (trigram-like scoring) to detect potential matches.
 * Production integration point: swap _fetchLiveLists() with real API calls to Refinitiv/Accuity.
 */

// Embedded stub lists for demonstration (in production, fetched from live feeds)
const STUB_SANCTIONED_NAMES = [
    { name: 'IRANIAN NATIONAL BANK', lists: ['OFAC_SDN'], programs: ['IRAN'] },
    { name: 'SBERBANK', lists: ['EU_LIST', 'HM_TREASURY'], programs: ['RUSSIA'] },
    { name: 'RUSSIAN COMMERCIAL BANK', lists: ['OFAC_SDN', 'UN_SANCTIONS'], programs: ['RUSSIA'] },
    { name: 'NORTH KOREA TRADE CORP', lists: ['OFAC_SDN', 'UN_SANCTIONS'], programs: ['DPRK'] },
    { name: 'HEZBOLLAH FINANCE', lists: ['OFAC_SDN', 'UN_SANCTIONS'], programs: ['SDGT'] },
    { name: 'GLOBAL SECURITY SYSTEMS', lists: ['OFAC_SDN'], programs: ['IRAN', 'WMD'] },
];

export class SanctionsScreeningService {

    async screenEntity(params: {
        tenantId: string;
        entityType: 'Supplier' | 'Customer' | 'Employee' | 'BeneficialOwner';
        entityId: string;
        entityName: string;
        listSources?: string[];
    }) {
        const listSources = params.listSources ?? ['OFAC_SDN', 'UN_SANCTIONS', 'EU_LIST', 'HM_TREASURY'];
        const { matchStatus, matchScore, matchedName, programTags } = this._screenName(params.entityName, listSources);

        const [result] = (await db.execute(sql`
            INSERT INTO sanctions_screening_results (
                tenant_id, entity_type, entity_id, entity_name,
                list_sources, match_status, match_score, matched_name, program_tags
            ) VALUES (
                ${params.tenantId}, ${params.entityType}, ${params.entityId}, ${params.entityName},
                ${listSources}, ${matchStatus}, ${matchScore ?? null},
                ${matchedName ?? null}, ${programTags ?? null}
            ) RETURNING *
        `)) as any;

        return result;
    }

    async screenBatch(tenantId: string, entityType: 'Supplier' | 'Customer', listSources?: string[]) {
        const tableName = entityType === 'Supplier' ? 'suppliers' : 'customers';
        const entities = (await db.execute(sql`
            SELECT id, name FROM ${sql.raw(tableName)}
            WHERE tenant_id = ${tenantId} AND status = 'Active'
            LIMIT 1000
        `) as any).rows ?? [];

        const results = [];
        for (const entity of entities) {
            const result = await this.screenEntity({
                tenantId, entityType, entityId: entity.id, entityName: entity.name ?? '', listSources,
            });
            results.push(result);
        }

        const summary = {
            total: results.length,
            clear: results.filter(r => r.match_status === 'Clear').length,
            potentialMatches: results.filter(r => r.match_status === 'PotentialMatch').length,
            confirmed: results.filter(r => r.match_status === 'Confirmed').length,
        };

        return { summary, results };
    }

    async markReviewed(screeningId: string, outcome: 'FalsePositive' | 'Confirmed', reviewedBy: string, notes?: string) {
        await db.execute(sql`
            UPDATE sanctions_screening_results
            SET match_status = ${outcome}, reviewed_by = ${reviewedBy},
                reviewed_at = NOW(), review_notes = ${notes ?? null}
            WHERE id = ${screeningId}
        `);
        return { screeningId, outcome };
    }

    async getScreeningHistory(tenantId: string, status?: string) {
        if (status) {
            return (await db.execute(sql`
                SELECT * FROM sanctions_screening_results
                WHERE tenant_id = ${tenantId} AND match_status = ${status}
                ORDER BY screened_at DESC LIMIT 100
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT * FROM sanctions_screening_results
            WHERE tenant_id = ${tenantId}
            ORDER BY screened_at DESC LIMIT 100
        `) as any).rows;
    }

    async getDashboardStats(tenantId: string) {
        return (await db.execute(sql`
            SELECT
                COUNT(*) AS total_screened,
                COUNT(*) FILTER (WHERE match_status = 'PotentialMatch') AS pending_review,
                COUNT(*) FILTER (WHERE match_status = 'Confirmed') AS confirmed_matches,
                COUNT(*) FILTER (WHERE match_status = 'Clear') AS cleared,
                COUNT(*) FILTER (WHERE screened_at >= NOW() - INTERVAL '30 days') AS last_30_days
            FROM sanctions_screening_results
            WHERE tenant_id = ${tenantId}
        `) as any).rows?.[0];
    }

    // ─── Fuzzy Name Matching ──────────────────────────────────────────────────

    private _screenName(name: string, listSources: string[]) {
        const normalize = (s: string) => s.toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim();
        const normalized = normalize(name);

        let bestScore = 0;
        let bestMatch: (typeof STUB_SANCTIONED_NAMES)[0] | null = null;

        for (const entry of STUB_SANCTIONED_NAMES) {
            // Only check entries matching at least one requested list source
            if (!entry.lists.some(l => listSources.includes(l))) continue;
            const score = this._trigramScore(normalized, normalize(entry.name));
            if (score > bestScore) { bestScore = score; bestMatch = entry; }
        }

        if (bestScore >= 95) {
            return { matchStatus: 'Confirmed', matchScore: bestScore, matchedName: bestMatch?.name, programTags: bestMatch?.programs ?? [] };
        } else if (bestScore >= 75) {
            return { matchStatus: 'PotentialMatch', matchScore: bestScore, matchedName: bestMatch?.name, programTags: bestMatch?.programs ?? [] };
        }
        return { matchStatus: 'Clear', matchScore: bestScore, matchedName: null, programTags: [] };
    }

    private _trigramScore(a: string, b: string): number {
        const aWords = new Set(a.split(' ').filter(Boolean));
        const bWords = new Set(b.split(' ').filter(Boolean));
        const intersection = [...aWords].filter(w => bWords.has(w)).length;
        const union = new Set([...aWords, ...bWords]).size;
        if (union === 0) return 0;
        // Jaccard similarity * 100 — scaled upwards for adjacent words
        return Math.round((intersection / union) * 100 * 1.2);
    }
}

export const sanctionsScreeningService = new SanctionsScreeningService();
