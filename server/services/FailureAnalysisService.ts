
import { db } from "../db";
import { maintFailureCodes } from "../../shared/schema/index";
import { eq, and } from "drizzle-orm";

/**
 * Failure Analysis Service (Reliability engineering)
 * Implements L3 Failure Hierarchies.
 */
class FailureAnalysisService {
    async listFailureCodes(type?: string, parentId?: string) {
        let query = db.select().from(maintFailureCodes);
        const conditions = [];

        if (type) conditions.push(eq(maintFailureCodes.type, type));
        if (parentId) conditions.push(eq(maintFailureCodes.parentId, parentId));

        if (conditions.length > 0) {
            return await db.select().from(maintFailureCodes).where(and(...conditions));
        }

        return await query;
    }

    async createFailureCode(data: any) {
        const [code] = await db.insert(maintFailureCodes).values(data).returning();
        return code;
    }
}

export const failureAnalysisService = new FailureAnalysisService();
