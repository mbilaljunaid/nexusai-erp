
import { db } from "@db";
import { hrSodRules } from "@shared/schema"; // Ensure this export exists in your local schema definition
import { eq, or, and } from "drizzle-orm";

export interface ConflictResult {
    conflict: boolean;
    rule?: {
        roleA: string;
        roleB: string;
        riskLevel: string;
        description: string | null;
    };
}

export class SoDService {

    /**
     * Checks if a set of roles contains any toxic combinations defined in the SoD Matrix.
     * @param roles List of role codes to check (e.g., ["PAYROLL_ADMIN", "AUDITOR"])
     * @param tenantId Tenant ID
     * @returns List of conflicts found
     */
    static async detectConflicts(roles: string[], tenantId: string): Promise<ConflictResult[]> {
        if (roles.length < 2) return [];

        const conflicts: ConflictResult[] = [];

        // Fetch all rules for this tenant
        // Optimization: In a real app, cache these rules or filter by the roles provided
        const rules = await db.select().from(hrSodRules).where(eq(hrSodRules.tenantId, tenantId));

        for (const rule of rules) {
            const hasA = roles.includes(rule.roleCodeA);
            const hasB = roles.includes(rule.roleCodeB);

            if (hasA && hasB) {
                conflicts.push({
                    conflict: true,
                    rule: {
                        roleA: rule.roleCodeA,
                        roleB: rule.roleCodeB,
                        riskLevel: rule.riskLevel,
                        description: rule.description
                    }
                });
            }
        }

        return conflicts;
    }

    /**
     * Validates if a user can be assigned a new role without violating SoD.
     * Throws an error if a CRITICAL conflict is found.
     * @param currentRoles Existing roles of the user
     * @param newRole The role being assigned
     * @param tenantId Tenant ID
     */
    static async validateAssignment(currentRoles: string[], newRole: string, tenantId: string) {
        const proposedRoles = [...currentRoles, newRole];
        const conflicts = await this.detectConflicts(proposedRoles, tenantId);

        const criticalConflict = conflicts.find(c => c.rule?.riskLevel === "CRITICAL");

        if (criticalConflict) {
            throw new Error(`SoD Violation: Cannot assign '${newRole}'. Conflict with '${criticalConflict.rule?.roleA === newRole ? criticalConflict.rule?.roleB : criticalConflict.rule?.roleA}'. Risk: CRITICAL.`);
        }

        return conflicts; // Return warnings if any non-critical conflicts exist
    }
}
