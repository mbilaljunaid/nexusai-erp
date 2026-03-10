
import { db } from "@db";
import { ComplianceEngineService } from "../server/modules/hr/services/ComplianceEngineService";
import { hrComplianceRules, hrComplianceEvents, hrComplianceViolations } from "@shared/schema/hr_compliance";
import { eq } from "drizzle-orm";

async function verifyTimeRules() {
    console.log("Starting Time-Based Rule Verification...");

    const tenantId = "tenant-verify-time-" + Date.now();
    
    // Cleanup previous run if any (mock tenant, unlikely needed but good practice)
    
    // 1. Setup Data - Create Rules
    console.log("1. Setting up Rules...");
    
    // Rule A: Probation Check - 90 Days post hire (Non-recurring)
    // "Trigger if (Today - dateStart) > 90" (Simple GREATER_THAN logic existing)
    const [probationRule] = await db.insert(hrComplianceRules).values({
        tenantId,
        code: "TEST-PROBATION",
        name: "Probation Period Expiry",
        severity: "medium",
        automationLevel: "full",
        effectiveDate: new Date(),
        ruleLogic: {
            type: "TIME_TRIGGER",
            dateField: "dateStart",
            operator: "GREATER_THAN",
            value: 90,
            remediation: ["Conduct Probation Review"]
        }
    }).returning();

    // Rule B: Annual Certification (Recurring)
    // "Trigger if (Today - dateStart) % 365 < 30" (e.g. within 30 days of anniversary)
    // We will implement MODULO operator support in the engine for this.
    const [annualRule] = await db.insert(hrComplianceRules).values({
        tenantId,
        code: "TEST-ANNUAL",
        name: "Annual Certification Required",
        severity: "high",
        automationLevel: "full",
        effectiveDate: new Date(),
        ruleLogic: {
            type: "TIME_TRIGGER",
            dateField: "dateStart",
            operator: "MODULO", // This is the NEW feature we handle
            modulus: 365,
            window: 30, // Trigger if remainder is < 30 (i.e., just passed anniversary)
            remediation: ["Request Annual Certification"]
        }
    }).returning();

    // 2. Mock Entities & Evaluate Rule A (Probation)
    console.log("2. Verifying Probation Rule (Standard)...");
    
    const oldEmployee = { dateStart: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString() }; // 100 days ago
    const newEmployee = { dateStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }; // 10 days ago

    const resProbationOld = await ComplianceEngineService.evaluateTransaction(tenantId, "PERSON", "emp-old", oldEmployee);
    const resProbationNew = await ComplianceEngineService.evaluateTransaction(tenantId, "PERSON", "emp-new", newEmployee);

    const oldFailed = resProbationOld.find(r => r.ruleId === probationRule.id && !r.isCompliant);
    const newPassed = resProbationNew.find(r => r.ruleId === probationRule.id && r.isCompliant);

    if (oldFailed && newPassed) {
        console.log("✅ Probation Rule Logic Correct: Old employee flagged, New employee ignored.");
    } else {
        console.error("❌ Probation Rule Logic Failed", { oldFailed, newPassed });
    }

    // 3. Mock Entities & Evaluate Rule B (Annual Recurring)
    console.log("3. Verifying Annual Recurring Rule (New Feature)...");

    // Anniversary was 10 days ago (375 days total tenure). 375 % 365 = 10. 10 < 30 (Window). SHOULD FAIL (Trigger Violation).
    const anniversaryEmployee = { dateStart: new Date(Date.now() - 375 * 24 * 60 * 60 * 1000).toISOString() };
    
    // Mid-year (180 days). 180 % 365 = 180. 180 > 30. SHOULD PASS.
    const midYearEmployee = { dateStart: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() };

    const resAnnualAnniversary = await ComplianceEngineService.evaluateTransaction(tenantId, "PERSON", "emp-anniv", anniversaryEmployee);
    const resAnnualMidYear = await ComplianceEngineService.evaluateTransaction(tenantId, "PERSON", "emp-mid", midYearEmployee);

    const annivFailed = resAnnualAnniversary.find(r => r.ruleId === annualRule.id && !r.isCompliant);
    const midPassed = resAnnualMidYear.find(r => r.ruleId === annualRule.id && r.isCompliant);

    if (annivFailed && midPassed) {
        console.log("✅ Annual Recurring Rule Logic Correct: Anniversary employee flagged, Mid-year employee compliant.");
    } else {
        console.error("❌ Annual Recurring Rule Logic Failed", { annivFailed, midPassed });
    }

    console.log("Verification Complete.");
    process.exit(0);
}

verifyTimeRules().catch(console.error);
