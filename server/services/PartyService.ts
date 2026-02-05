
import { db } from "../db";
import {
    hzParties, hzOrganizationProfiles, hzPersonProfiles, hzRelationships,
    InsertHzParty, InsertHzOrganizationProfile, InsertHzPersonProfile, InsertHzRelationship
} from "../../shared/schema";
import { eq, sql, or } from "drizzle-orm";

export class PartyService {

    /**
     * Creates a new Organization Party
     */
    async createOrganization(partyData: InsertHzParty, orgProfileData: Omit<InsertHzOrganizationProfile, "partyId">) {
        return await db.transaction(async (tx) => {
            // 1. Create the Party record
            const [party] = await tx.insert(hzParties).values({
                ...partyData,
                partyType: 'ORGANIZATION'
            }).returning();

            // 2. Create the Organization Profile
            const [profile] = await tx.insert(hzOrganizationProfiles).values({
                ...orgProfileData,
                partyId: party.id
            }).returning();

            return { party, profile };
        });
    }

    /**
     * Creates a new Person Party
     */
    async createPerson(partyData: InsertHzParty, personProfileData: Omit<InsertHzPersonProfile, "partyId">) {
        return await db.transaction(async (tx) => {
            // 1. Create the Party record
            const [party] = await tx.insert(hzParties).values({
                ...partyData,
                partyType: 'PERSON'
            }).returning();

            // 2. Create the Person Profile
            const [profile] = await tx.insert(hzPersonProfiles).values({
                ...personProfileData,
                partyId: party.id
            }).returning();

            return { party, profile };
        });
    }

    /**
     * Get Party Details (with Profile)
     */
    async getParty(partyId: string) {
        const party = await db.query.hzParties.findFirst({
            where: eq(hzParties.id, partyId)
        });

        if (!party) return null;

        let profile = null;
        if (party.partyType === 'ORGANIZATION') {
            profile = await db.query.hzOrganizationProfiles.findFirst({
                where: eq(hzOrganizationProfiles.partyId, partyId)
            });
        } else if (party.partyType === 'PERSON') {
            profile = await db.query.hzPersonProfiles.findFirst({
                where: eq(hzPersonProfiles.partyId, partyId)
            });
        }

        return { party, profile };
    }

    /**
     * Search Parties
     */
    async searchParties(query: string) {
        // Simple mock search for now using Drizzle's ilike if possible or just naive implementation
        // For now, implementing basic retrieval
        return await db.select().from(hzParties).limit(50);
    }

    /**
     * Count Total Parties
     */
    async countParties() {
        const result = await db.select({ count: sql<number>`count(*)` }).from(hzParties);
        return Number(result[0].count);
    }

    /**
     * Get Relationships for a Party
     */
    async getRelationships(partyId: string) {
        // Find all relationships where this party is either Subject or Object
        const rels = await db.select().from(hzRelationships)
            .where(or(
                eq(hzRelationships.subjectId, partyId),
                eq(hzRelationships.objectId, partyId)
            ));

        // Enrich with Party Names (Manual 'join' helper)
        const enriched = await Promise.all(rels.map(async (r) => {
            const otherId = r.subjectId === partyId ? r.objectId : r.subjectId;
            const otherParty = await db.query.hzParties.findFirst({
                where: eq(hzParties.id, otherId),
                columns: { partyName: true, partyType: true }
            });
            return {
                ...r,
                relatedPartyName: otherParty?.partyName,
                relatedPartyType: otherParty?.partyType,
                direction: r.subjectId === partyId ? 'Subject' : 'Object' // 'Subject' means Party -> Other
            };
        }));

        return enriched;
    }

    /**
     * Create a Relationship (Internal use for now or Verification)
     */
    async createRelationship(data: InsertHzRelationship) {
        const [rel] = await db.insert(hzRelationships).values(data).returning();
        return rel;
    }
}

export const partyService = new PartyService();
