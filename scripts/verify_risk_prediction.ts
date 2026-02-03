import { ComplianceRiskService } from "../server/modules/hr/services/ComplianceRiskService";
import { db } from "../server/db";
import { hrWorkRelationships, hrAssignments, hrPersons, hrOrganizations } from "../shared/schema/index";
import { eq } from "drizzle-orm";

async function verifyRiskPrediction() {
    console.log("🚀 Starting AI Risk Prediction Verification...");

    const tenantId = "test-tenant-risk-" + Date.now();

    try {
        // 1. Setup Test Data (Organization -> Person)
        console.log("Setting up test organization and person...");
        const [org] = await db.insert(hrOrganizations).values({
            tenantId,
            name: "Test Risk Corp",
            classificationCode: "LEGAL_EMPLOYER",
            activeStatus: "ACTIVE"
        }).returning();

        const [person] = await db.insert(hrPersons).values({
            firstName: "Risk",
            lastName: "Tester",
            nationalId: "RISK-999",
            tenantId,
            personNumber: "R-" + Date.now()
        }).returning();

        // 2. High Risk Scenario: High Turnover (Frequent work relationships)
        console.log("\n--- Scenario 1: High Turnover Risk ---");
        await db.insert(hrWorkRelationships).values([
            { personId: person.id, tenantId, legalEmployerId: org.id, dateStart: "2020-01-01", workerType: "EMPLOYEE" },
            { personId: person.id, tenantId, legalEmployerId: org.id, dateStart: "2021-01-01", workerType: "EMPLOYEE" },
            { personId: person.id, tenantId, legalEmployerId: org.id, dateStart: "2022-01-01", workerType: "EMPLOYEE" }
        ]);

        const highTurnoverAnalysis = await ComplianceRiskService.predictRisk(tenantId, "HIRE", {
            personId: person.id,
            jobName: "Software Engineer"
        });

        console.log("Risk Score:", highTurnoverAnalysis.score);
        console.log("Level:", highTurnoverAnalysis.level);
        console.log("Justifications:", highTurnoverAnalysis.justification);

        if (highTurnoverAnalysis.score >= 30) {
            console.log("✅ High turnover risk detected successfully.");
        } else {
            console.error("❌ Failed to detect high turnover risk.");
            process.exit(1);
        }

        // 3. Sensitive Role Risk
        console.log("\n--- Scenario 2: Sensitive Role Risk ---");
        const sensitiveRoleAnalysis = await ComplianceRiskService.predictRisk(tenantId, "HIRE", {
            jobName: "Chief Finance Officer"
        });

        console.log("Risk Score:", sensitiveRoleAnalysis.score);
        console.log("Justifications:", sensitiveRoleAnalysis.justification);

        if (sensitiveRoleAnalysis.justification.some(j => j.toLowerCase().includes("sensitive financial"))) {
            console.log("✅ Sensitive role risk detected successfully.");
        } else {
            console.error("❌ Failed to detect sensitive role risk.");
            process.exit(1);
        }

        // 4. Low Risk Scenario
        console.log("\n--- Scenario 3: Low Risk ---");
        const lowRiskAnalysis = await ComplianceRiskService.predictRisk(tenantId, "HIRE", {
            jobName: "Junior Developer"
        });

        console.log("Risk Score:", lowRiskAnalysis.score);
        if (lowRiskAnalysis.level === "low") {
            console.log("✅ Low risk scenario confirmed.");
        } else {
            console.error("❌ Failed to confirm low risk.");
            process.exit(1);
        }

        // Cleanup
        console.log("\nCleaning up...");
        await db.delete(hrWorkRelationships).where(eq(hrWorkRelationships.tenantId, tenantId));
        await db.delete(hrPersons).where(eq(hrPersons.tenantId, tenantId));
        await db.delete(hrOrganizations).where(eq(hrOrganizations.id, org.id));

        console.log("✨ AI Risk Prediction Verification Complete.");
    } catch (error) {
        console.error("❌ Error during verification:", error);
        process.exit(1);
    }
}

verifyRiskPrediction().catch(console.error);
