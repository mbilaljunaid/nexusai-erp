
import { db } from "../db";
import {
    hzLocations, hzPartySites, hzPartySiteUses,
    InsertHzLocation, InsertHzPartySite, InsertHzPartySiteUse
} from "../../shared/schema";
import { eq } from "drizzle-orm";

export class LocationService {

    /**
     * Creates a new Location (Address)
     * Performs validation simulation
     */
    async createLocation(locationData: InsertHzLocation) {
        // Mock Address Validation Logic
        const updatedData = { ...locationData };
        if (!updatedData.validationStatus) {
            updatedData.validationStatus = 'VALIDATED'; // Simulate success
        }

        const [location] = await db.insert(hzLocations).values(updatedData).returning();
        return location;
    }

    /**
     * Creates a Party Site (linking a Party to a Location)
     */
    async createPartySite(partySiteData: InsertHzPartySite) {
        const [partySite] = await db.insert(hzPartySites).values(partySiteData).returning();
        return partySite;
    }

    /**
     * Adds a Site Use (e.g., BILL_TO) to a Party Site
     */
    async createPartySiteUse(siteUseData: InsertHzPartySiteUse) {
        const [siteUse] = await db.insert(hzPartySiteUses).values(siteUseData).returning();
        return siteUse;
    }

    /**
     * Helper: Add a full address to a party
     */
    async addAddressToParty(partyId: string, locationData: InsertHzLocation, siteUseTypes: string[] = []) {
        return await db.transaction(async (tx) => {
            // 1. Create Location
            const [location] = await tx.insert(hzLocations).values(locationData).returning();

            // 2. Create Party Site
            const [partySite] = await tx.insert(hzPartySites).values({
                partyId,
                locationId: location.id,
                status: 'A'
            }).returning();

            // 3. Create Site Uses
            const uses = [];
            for (const useType of siteUseTypes) {
                const [use] = await tx.insert(hzPartySiteUses).values({
                    partySiteId: partySite.id,
                    siteUseType: useType,
                    status: 'A'
                }).returning();
                uses.push(use);
            }

            return { location, partySite, siteUses: uses };
        });
    }

    async getPartyLocations(partyId: string) {
        const sites = await db.query.hzPartySites.findMany({
            where: eq(hzPartySites.partyId, partyId),
            with: {
                // In Drizzle we need relations defined to fetch 'location', but we haven't defined them in schema yet.
                // We'll trust the caller for now or do a join manually if needed.
                // Since this is MVP foundation, we will return the sites and the caller might need to fetch locations.
            }
        });

        // Manual join for now as relations might not be set up in index.ts relations object
        // Actually, we haven't defined 'relations' in the schema files.
        // We will fetch locations separately for this implementation
        const enrichedSites = [];
        for (const site of sites) {
            const location = await db.query.hzLocations.findFirst({
                where: eq(hzLocations.id, site.locationId)
            });
            enrichedSites.push({ ...site, location });
        }

        return enrichedSites;
    }
}

export const locationService = new LocationService();
