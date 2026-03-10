import { db } from "../db";
import { hrDelegations } from "@shared/schema/hr_delegation";
import { eq, and, gt, or, isNull } from "drizzle-orm";

export class DelegationService {
    static async createProxy(data: {
        tenantId: string;
        managerId: string;
        proxyId: string;
        startDate: Date;
        endDate?: Date;
        canApproveTransitions?: boolean;
        canViewTeamAnalytics?: boolean;
    }) {
        const [proxy] = await db.insert(hrDelegations).values({
            ...data,
            isActive: true
        }).returning();
        return proxy;
    }

    static async getActiveProxiesForManager(managerId: string, tenantId: string) {
        const now = new Date();
        return await db.select()
            .from(hrDelegations)
            .where(and(
                eq(hrDelegations.managerId, managerId),
                eq(hrDelegations.tenantId, tenantId),
                eq(hrDelegations.isActive, true),
                or(
                    isNull(hrDelegations.endDate),
                    gt(hrDelegations.endDate, now)
                )
            ));
    }

    static async getManagersDelegatedToProxy(proxyId: string, tenantId: string) {
        const now = new Date();
        return await db.select()
            .from(hrDelegations)
            .where(and(
                eq(hrDelegations.proxyId, proxyId),
                eq(hrDelegations.tenantId, tenantId),
                eq(hrDelegations.isActive, true),
                or(
                    isNull(hrDelegations.endDate),
                    gt(hrDelegations.endDate, now)
                )
            ));
    }

    static async revokeProxy(id: string) {
        const [proxy] = await db.update(hrDelegations)
            .set({ isActive: false })
            .where(eq(hrDelegations.id, id))
            .returning();
        return proxy;
    }

    /**
     * Checks if a user has delegated authority from a specific manager
     * @param proxyId The user acting as proxy
     * @param managerId The manager whose authority is being used
     */
    static async hasAuthority(proxyId: string, managerId: string, tenantId: string, permission: "APPROVE" | "VIEW") {
        const now = new Date();
        const results = await db.select()
            .from(hrDelegations)
            .where(and(
                eq(hrDelegations.proxyId, proxyId),
                eq(hrDelegations.managerId, managerId),
                eq(hrDelegations.tenantId, tenantId),
                eq(hrDelegations.isActive, true),
                or(
                    isNull(hrDelegations.endDate),
                    gt(hrDelegations.endDate, now)
                ),
                permission === "APPROVE"
                    ? eq(hrDelegations.canApproveTransitions, true)
                    : eq(hrDelegations.canViewTeamAnalytics, true)
            ));

        return results.length > 0;
    }
}
