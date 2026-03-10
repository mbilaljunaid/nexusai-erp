import { db } from "../server/db";
import {
    hrComplianceRules,
    hrComplianceViolations,
    hrComplianceEvents
} from "../shared/schema/hr_compliance";
import { hrPersons, hrWorkRelationships, hrAssignments } from "../shared/schema/hr_worker";
import { hrOrganizations } from "../shared/schema/hr_structures";
import { hrAor } from "../shared/schema/hr_aor";
import { ComplianceEngineService } from "../server/modules/hr/services/ComplianceEngineService";
import { ComplianceService } from "../server/modules/hr/services/ComplianceService";
import { eq, and, or } from "drizzle-orm";

async function verify() {
    console.log("🚀 Starting Phase 6 Verification: Metadata-Driven Compliance Engine...");

    const tenantId = "test-tenant-p6";
    const adminUserId = "admin-p6";
    const regionalHrId = "regional-hr-p6";

    try {
        // 1. Cleanup
        await db.delete(hrComplianceViolations).where(eq(hrComplianceViolations.tenantId, tenantId));
        await db.delete(hrComplianceEvents).where(eq(hrComplianceEvents.tenantId, tenantId));
        await db.delete(hrComplianceRules).where(eq(hrComplianceRules.tenantId, tenantId));
        await db.delete(hrAor).where(eq(hrAor.tenantId, tenantId));
        await db.delete(hrAssignments).where(eq(hrAssignments.tenantId, tenantId));
        await db.delete(hrWorkRelationships).where(eq(hrWorkRelationships.tenantId, tenantId));
        await db.delete(hrPersons).where(eq(hrPersons.tenantId, tenantId));
        await db.delete(hrOrganizations).where(eq(hrOrganizations.tenantId, tenantId));

        // 2. Setup Organizations
        const [deptFR] = await db.insert(hrOrganizations).values({
            tenantId, name: "France Operations", classificationCode: "DEPARTMENT", status: "ACTIVE"
        }).returning();

        const [deptUS] = await db.insert(hrOrganizations).values({
            tenantId, name: "US Operations", classificationCode: "DEPARTMENT", status: "ACTIVE"
        }).returning();

        const [leFR] = await db.insert(hrOrganizations).values({
            tenantId, name: "France Legal Employer", classificationCode: "LEGAL_EMPLOYER", status: "ACTIVE"
        }).returning();

        // 3. Setup Rules
        // Global rule: Require National ID
        await db.insert(hrComplianceRules).values({
            tenantId,
            code: "G_REQ_NID",
            name: "Global National ID Required",
            severity: "critical",
            category: "REGULATORY",
            legislationCode: "GLOBAL",
            automationLevel: "full",
            ruleLogic: { type: "REQUIRED_FIELD", field: "nationalId" },
            effectiveDate: new Date(),
            isActive: true
        });

        // FR-specific rule: Age >= 16
        await db.insert(hrComplianceRules).values({
            tenantId,
            code: "FR_AGE_16",
            name: "France Minimum Age Restriction",
            severity: "critical",
            category: "REGULATORY",
            legislationCode: "FR",
            automationLevel: "full",
            ruleLogic: { type: "MIN_AGE", threshold: 16 },
            effectiveDate: new Date(),
            isActive: true
        });

        // 4. Test Transaction - Underage French Worker without NID
        console.log("📝 Evaluating Underage French Worker...");
        const personData = {
            firstName: "Jean",
            lastName: "Dupont",
            dateOfBirth: "2015-01-01", // 9 years old in 2024
            nationalId: null // Missing
        };

        const results = await ComplianceEngineService.evaluateTransaction(
            tenantId, "PERSON", "worker-fr-1", personData, "FR"
        );

        console.log("✅ Evaluation completed. Violations produced:", results.filter(r => !r.isCompliant).length);

        const violations = await db.select().from(hrComplianceViolations).where(eq(hrComplianceViolations.tenantId, tenantId));
        if (violations.length !== 2) {
            throw new Error(`Expected 2 violations (Global NID and FR Age), but found ${violations.length}`);
        }
        console.log("✅ Legislative context filtering verified.");

        // 5. Test AOR Security
        console.log("🔐 Testing AOR Security for Compliance...");

        // Seed a person in FR Dept
        const [personFR] = await db.insert(hrPersons).values({
            tenantId, firstName: "Jean", lastName: "Dupont", personNumber: "FR001", email: "jean@example.fr"
        }).returning();

        const [relationship] = await db.insert(hrWorkRelationships).values({
            tenantId, personId: personFR.id, legalEmployerId: leFR.id, dateStart: new Date(), primaryFlag: true
        }).returning();

        await db.insert(hrAssignments).values({
            tenantId, personId: personFR.id, departmentId: deptFR.id, primaryAssignmentFlag: true,
            assignmentStatus: "ACTIVE", effectiveStartDate: new Date(), assignmentNumber: "ASG-FR-1",
            workRelationshipId: relationship.id
        });

        // Re-evaluate to link violations to real person
        await ComplianceEngineService.evaluateTransaction(tenantId, "PERSON", personFR.id, personData, "FR");

        // Set AOR for US HR - should NOT see FR violations
        await db.insert(hrAor).values({
            tenantId, personId: regionalHrId, scopeType: "DEPARTMENT", scopeValueId: deptUS.id, responsibilityType: "HR_REP"
        });

        const usHrViolations = await ComplianceService.listViolations(tenantId, regionalHrId);
        if (usHrViolations.length !== 0) {
            throw new Error(`US HR should see 0 violations for French dept, but saw ${usHrViolations.length}`);
        }
        console.log("✅ AOR Restriction (Deny) verified.");

        // Set AOR for FR HR - SHOULD see FR violations
        const frHrId = "fr-hr-p6";
        await db.insert(hrAor).values({
            tenantId, personId: frHrId, scopeType: "DEPARTMENT", scopeValueId: deptFR.id, responsibilityType: "HR_REP"
        });

        const frHrViolations = await ComplianceService.listViolations(tenantId, frHrId);
        if (frHrViolations.length === 0) {
            throw new Error(`FR HR should see violations for French dept, but saw 0`);
        }
        console.log("✅ AOR Access (Allow) verified.");

        console.log("\n🎊 Phase 6 SUCCESS: Metadata-Driven Compliance Engine & AOR Security verified.");

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verify();
