
import { db } from "@db";
import { hrPolicyAcknowledgements } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export class PolicyAcknowledgementService {

    // Record a user's consent
    static async acknowledgePolicy(data: typeof hrPolicyAcknowledgements.$inferInsert) {
        return db.insert(hrPolicyAcknowledgements).values(data).returning();
    }

    // Get all acknowledgements for a person
    static async getAcknowledgements(personId: string, tenantId: string) {
        return db.select()
            .from(hrPolicyAcknowledgements)
            .where(and(
                eq(hrPolicyAcknowledgements.personId, personId),
                eq(hrPolicyAcknowledgements.tenantId, tenantId)
            ))
            .orderBy(desc(hrPolicyAcknowledgements.acknowledgedAt));
    }

    // Check if a specific policy version is signed
    static async hasSigned(personId: string, policyCode: string, version: string, tenantId: string) {
        const result = await db.select()
            .from(hrPolicyAcknowledgements)
            .where(and(
                eq(hrPolicyAcknowledgements.personId, personId),
                eq(hrPolicyAcknowledgements.policyCode, policyCode),
                eq(hrPolicyAcknowledgements.consentVersion, version),
                eq(hrPolicyAcknowledgements.tenantId, tenantId)
            ))
            .limit(1);

        return result.length > 0;
    }

    // Get pending policies (Logic: Define required policies vs signed ones)
    // For now, we return a hardcoded list of "Global" policies minus what they signed.
    static async getPendingPolicies(personId: string, tenantId: string) {
        // In a real system, "Required Policies" would be in a DB table linked to Country/Role.
        // For MVP/Phase 6, we assume a static set of Global Policies.
        const requiredPolicies = [
            { code: "GDPR_PRIVACY", version: "v2026.1", title: "Global Data Privacy Policy" },
            { code: "IT_SECURITY", version: "v2025.4", title: "IT Acceptable Use Policy" },
            { code: "ETHICS", version: "v2026.0", title: "Code of Ethics & Conduct" }
        ];

        const output = [];

        for (const policy of requiredPolicies) {
            const signed = await this.hasSigned(personId, policy.code, policy.version, tenantId);
            if (!signed) {
                output.push(policy);
            }
        }

        return output;
    }
}
