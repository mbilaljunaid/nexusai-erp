
import { db } from "../db";
import {
    hzParties, hzOrganizationProfiles, hzPersonProfiles,
    InsertHzParty, InsertHzOrganizationProfile, InsertHzPersonProfile
} from "../../shared/schema";
import { eq, sql } from "drizzle-orm";

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
}

export const partyService = new PartyService();
