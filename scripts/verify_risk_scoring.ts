import "dotenv/config";
import { ComplianceRiskService } from "../server/modules/hr/services/ComplianceRiskService";
import { db } from "../server/db";
import { hrPersons, hrWorkRelationships } from "../shared/schema/hr_worker";
import { eq } from "drizzle-orm";

async function verifyRiskScoring() {
    console.log("Starting Phase 10: Predictive Risk Scoring Verification...");
    const tenantId = "test-tenant-" + Date.now();

    try {
        // 1. Setup Mock Person
        console.log("Seeding test worker...");
        const [person] = await db.insert(hrPersons).values({
            tenantId,
            personNumber: "RISK-001",
            firstName: "Risk",
            lastName: "Tester",
            email: "risk@example.com"
        }).returning();

        // 2. Test Low Risk Scenario
        console.log("\n--- Scenario 1: Standard Employee (Business Hours) ---");
        // Mock time to business hours (e.g. 10 AM)
        const lowRiskData = { personId: person.id, jobName: "Junior Developer" };
        const lowRisk = await ComplianceRiskService.predictRisk(tenantId, "HIRE", lowRiskData);
        console.log("Risk Score:", lowRisk.score);
        console.log("Risk Level:", lowRisk.level);
        console.log("Justifications:", lowRisk.justification);

        // 3. Test High Risk Scenario (Sensitive Job + After Hours)
        console.log("\n--- Scenario 2: Sensitive Role + Outside Hours ---");
        // Note: Outside hours depends on current system time, but we can verify job criticality
        const highRiskData = { personId: person.id, jobName: "Senior Payroll Administrator" };
        const highRisk = await ComplianceRiskService.predictRisk(tenantId, "PROMOTION", highRiskData);
        console.log("Risk Score (Critical Job):", highRisk.score);
        console.log("Risk Level:", highRisk.level);

        // 4. Test Frequency Risk (Multiple Work Relationships)
        console.log("\n--- Scenario 3: High Frequency Mover ---");
        await db.insert(hrWorkRelationships).values([
            { tenantId, personId: person.id, dateStart: "2020-01-01", workerType: "EMPLOYEE", primaryFlag: false },
            { tenantId, personId: person.id, dateStart: "2021-01-01", workerType: "EMPLOYEE", primaryFlag: false },
            { tenantId, personId: person.id, dateStart: "2022-01-01", workerType: "EMPLOYEE", primaryFlag: true }
        ]);

        const freqRisk = await ComplianceRiskService.predictRisk(tenantId, "HIRE", { personId: person.id });
        console.log("Risk Score (High Turnover):", freqRisk.score);
        console.log("Justifications:", freqRisk.justification.filter(j => j.includes("instability")));

        console.log("\n--- Verification Complete ---");

    } catch (error) {
        console.error("Error during verification:", error);
    } finally {
        process.exit(0);
    }
}

verifyRiskScoring();
