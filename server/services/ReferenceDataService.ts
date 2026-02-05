
import { db } from "../db";
import {
    fndLookupTypes, fndLookupValues,
    InsertFndLookupType, InsertFndLookupValue
} from "../../shared/schema";
import { eq, and } from "drizzle-orm";

export class ReferenceDataService {

    /**
     * Create a Lookup Type (Header)
     */
    async createLookupType(data: InsertFndLookupType) {
        const [lookupType] = await db.insert(fndLookupTypes).values(data).returning();
        return lookupType;
    }

    /**
     * Create a Lookup Value (Detail)
     */
    async createLookupValue(data: InsertFndLookupValue) {
        const [lookupValue] = await db.insert(fndLookupValues).values(data).returning();
        return lookupValue;
    }

    /**
     * Get all enabled values for a specific lookup type code
     */
    async getLookupValues(lookupTypeCode: string) {
        // First find the type ID
        const typeRecord = await db.query.fndLookupTypes.findFirst({
            where: eq(fndLookupTypes.lookupType, lookupTypeCode)
        });

        if (!typeRecord) return [];

        // Then find values
        const values = await db.select().from(fndLookupValues)
            .where(and(
                eq(fndLookupValues.lookupTypeId, typeRecord.id),
                eq(fndLookupValues.enabledFlag, true)
            ))
            .orderBy(fndLookupValues.sortOrder);

        return values;
    }
}

export const referenceDataService = new ReferenceDataService();
