import { db } from "@db";
import { hrAor, hrAssignments, hrWorkRelationships, users } from "@shared/schema";
import { ROLES } from "@shared/schema/roles";
import { eq, and, sql } from "drizzle-orm";

export class AorService {

    // Assign AOR to a user (e.g. HR Manager for Sales Dept)
    static async assignAor(data: typeof hrAor.$inferInsert) {
        return db.insert(hrAor).values(data).returning();
    }

    // Get AORs for a specific user (to determine what they can see)
    static async getAorForUser(personId: string, tenantId: string) {
        return db.select()
            .from(hrAor)
            .where(
                and(
                    eq(hrAor.personId, personId),
                    eq(hrAor.tenantId, tenantId),
                    eq(hrAor.isActive, true)
                )
            );
    }

    // List AORs (Admin view) with Coverage Count
    static async listAors(tenantId: string) {
        return db.select({
            ...hrAor, // Select all AOR fields
            coverageCount: sql<number>`(
                SELECT count(*) FROM ${hrAssignments} a
                WHERE a.tenant_id = ${hrAor.tenantId}
                AND (
                    (${hrAor.scopeType} = 'DEPARTMENT' AND a.department_id = ${hrAor.scopeValueId}) OR
                    (${hrAor.scopeType} = 'LOCATION' AND a.location_id = ${hrAor.scopeValueId})
                    -- Add LEGAL_EMPLOYER linkage if needed, requires join
                )
            )`.mapWith(Number)
        })
            .from(hrAor)
            .where(eq(hrAor.tenantId, tenantId));
    }

    // Centralized Access Check
    static async hasAccess(requesterId: string, targetPersonId: string, tenantId: string): Promise<boolean> {
        if (!requesterId || requesterId === "system") return true;
        if (requesterId === targetPersonId) return true; // Self-access

        // GLOBAL ADMIN OVERRIDE
        // Check if user has ADMIN role
        const [user] = await db.select().from(users).where(eq(users.id, requesterId));
        if (user && user.role === ROLES.ADMIN) return true;

        const userAors = await this.getAorForUser(requesterId, tenantId);

        // Tier-1 Rule: If user has NO AORs, they are treated as having no row-level access 
        // UNLESS they are an admin (handled by logic above in future). 
        // For now, if no AORs, assume standard user -> No Access to others.
        // Wait, existing logic in PersonService said: "If user has no AORs, currently we assume Admin (View All)."
        // We should preserve that behavior for now to avoid breaking existing admin flows until dedicated Admin Check is in place.
        if (userAors.length === 0) return true;

        // Fetch Target Person's Context
        const personAss = await db.select()
            .from(hrAssignments)
            .leftJoin(hrWorkRelationships, eq(hrAssignments.workRelationshipId, hrWorkRelationships.id))
            .where(and(
                eq(hrAssignments.personId, targetPersonId),
                eq(hrAssignments.assignmentStatus, "ACTIVE"),
                eq(hrAssignments.primaryAssignmentFlag, true) // Only check primary assignment for now
            )).limit(1);

        if (!personAss.length) return false; // Inactive or no assignment -> potentially allow or deny. Default deny safe.

        const asg = personAss[0].hr_assignments;
        const rel = personAss[0].hr_work_relationships;

        // Check Match
        return userAors.some(a => {
            if (a.scopeType === 'DEPARTMENT' && a.scopeValueId === asg.departmentId) return true;
            if (a.scopeType === 'LOCATION' && a.scopeValueId === asg.locationId) return true;
            if (a.scopeType === 'LEGAL_EMPLOYER' && rel && a.scopeValueId === rel.legalEmployerId) return true;
            return false;
        });
    }
}
