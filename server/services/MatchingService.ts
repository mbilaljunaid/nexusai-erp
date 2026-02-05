
import { db } from "../db";
import { hzParties, hzDupBatch, hzDupSets, hzDupSetParties } from "@shared/schema";
import { eq, like, or, and, ne, sql } from "drizzle-orm";

// Basic weighted Levenshtein implementation
function levenshtein(s1: string, s2: string): number {
    const track = Array(s2.length + 1).fill(null).map(() =>
        Array(s1.length + 1).fill(null));
    for (let i = 0; i <= s1.length; i += 1) { track[0][i] = i; }
    for (let j = 0; j <= s2.length; j += 1) { track[j][0] = j; }
    for (let j = 1; j <= s2.length; j += 1) {
        for (let i = 1; i <= s1.length; i += 1) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator, // substitution
            );
        }
    }
    return track[s2.length][s1.length];
}

function calculateSimilarity(s1: string, s2: string): number {
    if (!s1 || !s2) return 0;
    const longer = s1.length > s2.length ? s1 : s2;
    if (longer.length === 0) return 1.0;
    return (longer.length - levenshtein(s1, s2)) / longer.length;
}

export class MatchingService {

    /**
     * Run a duplicate detection batch
     * For MVP, we fetch all parties and run comparisons in-memory for the batch.
     * In prod, this would be chunked or assume existing index.
     */
    async runBatch(batchName: string = `Batch-${Date.now()}`) {
        console.log("Starting Duplicate Detection Batch:", batchName);

        // 1. Create Batch Record
        const [batch] = await db.insert(hzDupBatch).values({
            batchName: batchName,
            status: "RUNNING",
            matchRuleCode: "FUZZY_NAME_MATCH"
        }).returning();

        let totalRecordsProcessed = 0;
        let candidatesFound = 0;

        try {
            // 2. Fetch all active parties
            const parties = await db.select().from(hzParties).where(eq(hzParties.status, 'A'));
            totalRecordsProcessed = parties.length;

            // 3. Simple In-Memory Matching (O(N^2) - Warning: Expensive for large datasets)
            // Optimization: Only compare within same Party Type
            const organizations = parties.filter(p => p.partyType === 'ORGANIZATION');
            const persons = parties.filter(p => p.partyType === 'PERSON');

            const processedIds = new Set<string>();

            // Helper to process groups
            const processGroup = async (group: typeof parties) => {
                for (let i = 0; i < group.length; i++) {
                    const p1 = group[i];
                    if (processedIds.has(p1.id)) continue;

                    const matches = [];

                    for (let j = i + 1; j < group.length; j++) {
                        const p2 = group[j];
                        if (processedIds.has(p2.id)) continue;

                        const similarity = calculateSimilarity(p1.partyName.toLowerCase(), p2.partyName.toLowerCase());

                        // Threshold 85%
                        if (similarity >= 0.85) {
                            matches.push({ party: p2, score: Math.round(similarity * 100) });
                        }
                    }

                    if (matches.length > 0) {
                        candidatesFound += 1; // Count sets, not individuals

                        // Create Duplicate Set
                        const [dupSet] = await db.insert(hzDupSets).values({
                            batchId: batch.id,
                            status: "OPEN"
                        }).returning();

                        // Add Primary Candidate (p1)
                        await db.insert(hzDupSetParties).values({
                            setId: dupSet.id,
                            partyId: p1.id,
                            score: "100", // Self match
                        });
                        processedIds.add(p1.id);

                        // Add Secondary Candidates (matches)
                        for (const m of matches) {
                            await db.insert(hzDupSetParties).values({
                                setId: dupSet.id,
                                partyId: m.party.id,
                                score: String(m.score),
                            });
                            processedIds.add(m.party.id);
                        }
                    }
                }
            };

            await processGroup(organizations);
            await processGroup(persons);

            // 4. Update Batch Status
            await db.update(hzDupBatch).set({
                status: "COMPLETED",
                totalRecordsProcessed,
                candidatesFound,
                updatedAt: new Date()
            }).where(eq(hzDupBatch.id, batch.id));

            return {
                batchId: batch.id,
                totalRecordsProcessed,
                candidatesFound
            };

        } catch (error) {
            console.error("Batch Failed:", error);
            await db.update(hzDupBatch).set({
                status: "ERROR",
                updatedAt: new Date()
            }).where(eq(hzDupBatch.id, batch.id));
            throw error;
        }
    }

    /**
     * Get Open Duplicate Sets for Review
     */
    async getOpenSets() {
        return await db.query.hzDupSets.findMany({
            where: eq(hzDupSets.status, "OPEN"),
            with: {
                batch: true,
                parties: {
                    with: {
                        party: true
                    }
                }
            }
        });
    }

    /**
     * Resolve a duplicate set (Merge)
     * For now, we just mark status. Real merge logic is complex (survivorship).
     */
    async resolveSet(setId: string, survivorPartyId: string) {
        // Mark Set as MERGED
        await db.update(hzDupSets).set({
            status: "MERGED",
            updatedAt: new Date()
        }).where(eq(hzDupSets.id, setId));

        // Mark Parties
        await db.update(hzDupSetParties).set({
            mergeStatus: "MERGED_TO"
        }).where(and(eq(hzDupSetParties.setId, setId), eq(hzDupSetParties.partyId, survivorPartyId)));

        await db.update(hzDupSetParties).set({
            mergeStatus: "MERGED_FROM"
        }).where(and(eq(hzDupSetParties.setId, setId), ne(hzDupSetParties.partyId, survivorPartyId)));

        // TODO: In Phase 8, implement actual data repointing for FKs (Accounts, Contacts, Suppliers)

        return true;
    }

    /**
     * Count Open Sets for Dashboard
     */
    async countOpenSets() {
        const result = await db.select({ count: sql<number>`count(*)` })
            .from(hzDupSets)
            .where(eq(hzDupSets.status, "OPEN"));
        return Number(result[0].count);
    }
}

export const matchingService = new MatchingService();
