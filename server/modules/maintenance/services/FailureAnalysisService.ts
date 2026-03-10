
import { db } from "../../../db";
import { maintFailureCodes } from "@shared/schema";
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

    async getFailureCodesTree() {
        const allCodes = await db.select().from(maintFailureCodes).where(eq(maintFailureCodes.active, "Y"));

        // Build Problem -> Cause -> Remedy taxonomy
        const problems = allCodes.filter((c: any) => c.type === "PROBLEM");
        const causes = allCodes.filter((c: any) => c.type === "CAUSE");
        const remedies = allCodes.filter((c: any) => c.type === "REMEDY");

        return problems.map((p: any) => ({
            ...p,
            children: causes.filter((c: any) => c.parentId === p.id).map((c: any) => ({
                ...c,
                children: remedies.filter((r: any) => r.parentId === c.id)
            }))
        }));
    }

    async upsertFailureCodes(codes: any[]) {
        if (!codes || codes.length === 0) return [];

        const results = [];
        for (const c of codes) {
            const dataToUpsert = {
                code: c.code,
                name: c.name,
                description: c.description,
                type: c.type,
                parentId: c.parentId || null,
                active: c.active === false ? "N" : "Y"
            };

            if (c.id && c.id.includes("-")) {
                // UPDATE (uuid format)
                const [updated] = await db.update(maintFailureCodes)
                    .set(dataToUpsert)
                    .where(eq(maintFailureCodes.id, c.id))
                    .returning();
                results.push(updated);
            } else {
                // INSERT
                const [inserted] = await db.insert(maintFailureCodes)
                    .values(dataToUpsert)
                    .returning();
                results.push(inserted);
            }
        }
        return results;
    }

    async createFailureCode(data: any) {
        const [code] = await db.insert(maintFailureCodes).values(data).returning();
        return code;
    }
}

export const failureAnalysisService = new FailureAnalysisService();
