import { db } from "../db";
import { icDataAccessSets, icOrgs } from "@shared/schema/intercompany";
import { eq, and, inArray } from "drizzle-orm";

export class IcSecurityService {

    // Assign access to a user for an org
    async assignAccess(userId: string, icOrgId: string, accessLevel: "FULL" | "READ_ONLY" = "FULL") {
        // Check if exists
        const existing = await db.select().from(icDataAccessSets)
            .where(and(eq(icDataAccessSets.userId, userId), eq(icDataAccessSets.icOrgId, icOrgId)));

        if (existing.length > 0) {
            return await db.update(icDataAccessSets)
                .set({ accessLevel })
                .where(eq(icDataAccessSets.id, existing[0].id))
                .returning();
        }

        return await db.insert(icDataAccessSets).values({
            userId,
            icOrgId,
            accessLevel
        }).returning();
    }

    // Get all authorized orgs for a user
    async getAuthorizedOrgs(userId: string) {
        // Simple join to get Org details
        const access = await db.select({
            orgId: icOrgs.id,
            orgName: icOrgs.orgName,
            accessLevel: icDataAccessSets.accessLevel
        })
            .from(icDataAccessSets)
            .innerJoin(icOrgs, eq(icDataAccessSets.icOrgId, icOrgs.id))
            .where(eq(icDataAccessSets.userId, userId));

        return access;
    }

    // Check if user has access to specific org
    async checkAccess(userId: string, icOrgId: string, requiredLevel: "FULL" | "READ_ONLY" = "READ_ONLY") {
        const access = await db.select().from(icDataAccessSets)
            .where(and(eq(icDataAccessSets.userId, userId), eq(icDataAccessSets.icOrgId, icOrgId)));

        if (access.length === 0) return false;

        if (requiredLevel === "FULL" && access[0].accessLevel !== "FULL") return false;

        return true;
    }

    // Middleware helper: Throw error if no access
    async validateAccess(userId: string, icOrgId: string, requiredLevel: "FULL" | "READ_ONLY" = "READ_ONLY") {
        const hasAccess = await this.checkAccess(userId, icOrgId, requiredLevel);
        if (!hasAccess) {
            throw new Error(`User ${userId} does not have ${requiredLevel} access to IC Org ${icOrgId}`);
        }
    }
}

export const icSecurityService = new IcSecurityService();
