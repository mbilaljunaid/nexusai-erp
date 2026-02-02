
import { db } from "../server/db";
import { CompensationService } from "../server/services/CompensationService";
import { PayrollAnalyticsService } from "../server/services/PayrollAnalyticsService";
import { TaxService } from "../server/services/TaxService";
import { hrmSalaryBases, hrmWorkerSalaries, hrmCompensationPlans } from "../shared/schema/rewards_compensation";
import { hrmPayrollRuns, hrmPayrollRunResults, hrmPayGroups, hrmPayElements } from "../shared/schema/rewards_payroll";
import { hrPersons, hrWorkRelationships, hrAssignments } from "../shared/schema/hr_worker";
import { hrOrganizations } from "../shared/schema/hr_structures";
import { addDays, subDays, format } from "date-fns";
import { eq } from "drizzle-orm";

async function verifyRewardsTier1() {
    console.log("💰 Verifying Workforce Rewards Tier-1 Parity...");
    const tenantId = "test_rewards_" + Date.now();

    // 1. Setup Master Data
    const [org] = await db.insert(hrOrganizations).values({
        tenantId,
        name: "Finance Corp",
        classificationCode: "DEPT",
        activeStatus: "ACTIVE"
    }).returning();

    const [person] = await db.insert(hrPersons).values({
        tenantId,
        personNumber: "FIN-" + Date.now(),
        firstName: "Penny",
        lastName: "Worth",
        email: `penny${Date.now()}@test.com`,
    }).returning();

    // 1b. Create Work Relationship & Assignment (Required for Salary)
    const [workRel] = await db.insert(hrWorkRelationships).values({
        tenantId,
        personId: person.id,
        legalEmployerId: org.id,
        dateStart: "2025-01-01",
        workerType: "EMPLOYEE"
    }).returning();

    const [assignment] = await db.insert(hrAssignments).values({
        tenantId,
        workRelationshipId: workRel.id,
        personId: person.id,
        assignmentName: "Finance Analyst",
        assignmentNumber: "ASG-" + Date.now(),
        assignmentStatus: "ACTIVE",
        effectiveStartDate: "2025-01-01"
    }).returning();

    const assignmentId = assignment.id;

    // 2. RETRO-PAY DETECTION TEST
    // Scenario: We have a closed payroll run for Jan. We try to add a salary increase effective Jan 1st.
    console.log("\n🧪 Testing Retro-Pay Detection...");

    // Create Pay Group
    const [payGroup] = await db.insert(hrmPayGroups).values({
        tenantId,
        name: "Monthly Salaried",
        code: "MTH",
        frequency: "MONTHLY"
    }).returning();

    // Create a Closed Payroll Run
    const [closedRun] = await db.insert(hrmPayrollRuns).values({
        tenantId,
        payGroupId: payGroup.id,
        periodName: "Jan 2026",
        periodStartDate: "2026-01-01",
        periodEndDate: "2026-01-31",
        status: "COMPLETED",
        runType: "REGULAR",
        paymentDate: "2026-02-01" // Required for completed runs
    }).returning();

    // Create Salary Basis
    const [salaryBasis] = await db.insert(hrmSalaryBases).values({
        tenantId,
        name: "Annual Salary",
        code: "ANNUAL_" + Date.now(),
        period: "ANNUAL",
        currency: "USD"
    }).returning();

    // Create a new salary effective BEFORE the closed run
    const backdatedSalary = {
        tenantId,
        assignmentId,
        salaryBasisId: salaryBasis.id,
        amount: "120000",
        currency: "USD",
        dateFrom: "2026-01-15", // Mid-Jan, but Jan is closed
        isActive: true
    };

    // Capture console.warn
    const originalWarn = console.warn;
    let warningCaptured = false;
    console.warn = (...args) => {
        if (args[0].includes("[RETRO-PAY DETECTED]")) warningCaptured = true;
        originalWarn(...args);
    };

    await CompensationService.assignSalary(backdatedSalary);
    console.warn = originalWarn;

    if (warningCaptured) {
        console.log("✅ Retro-Pay Logic Verified (Warning Triggered)");
    } else {
        console.error("❌ Retro-Pay Logic Failed (No Warning)");
    }

    // 3. ANOMALY DETECTION TEST
    console.log("\n🧪 Testing Anomaly Detection (Variance)...");

    // Create Pay Element
    const [element] = await db.insert(hrmPayElements).values({
        tenantId,
        name: "Basic Salary",
        classification: "EARNING",
        inputType: "RECURRING"
    }).returning();

    // Run 1: Normal Pay ($5000)
    await db.insert(hrmPayrollRunResults).values({
        tenantId,
        payrollRunId: closedRun.id, // Reusing existing run for simplicity as 'Previous'
        assignmentId,
        elementId: element.id,
        elementName: "Basic Salary",
        amount: "5000",
        classification: "EARNING"
    });

    // Run 2: Huge Pay ($50,000) - current run
    const [currentRun] = await db.insert(hrmPayrollRuns).values({
        tenantId,
        payGroupId: payGroup.id,
        periodName: "Feb 2026",
        periodStartDate: "2026-02-01",
        periodEndDate: "2026-02-28",
        status: "DRAFT",
        runType: "REGULAR",
        paymentDate: "2026-03-01"
    }).returning();

    await db.insert(hrmPayrollRunResults).values({
        tenantId,
        payrollRunId: currentRun.id,
        assignmentId,
        elementId: element.id,
        elementName: "Basic Salary",
        amount: "50000", // 10x Jump
        classification: "EARNING"
    });

    const anomalies = await PayrollAnalyticsService.detectAnomalies(currentRun.id);
    const varianceAnomaly = anomalies.find(a => a.type === "HIGH_VARIANCE");

    if (varianceAnomaly) {
        console.log(`✅ Anomaly Detected: ${varianceAnomaly.description} (Variance: ${varianceAnomaly.variancePercent}%)`);
    } else {
        console.error("❌ Anomaly Logic Failed (No High Variance)");
        console.log("Anomalies found:", anomalies);
    }

    // 4. TAX CALCULATION TEST
    console.log("\n🧪 Testing Progressive Tax Engine...");
    const grossIncome = 150000;
    const tax = TaxService.calculateFederalTax(grossIncome);
    // Rough calc: 
    // Std Ded: 14600 -> Taxable: 135400
    // Brackets (approx):
    // 10% of ~11k = 1100
    // 12% of ~37k = 4440
    // 22% of ~55k = 12100
    // 24% of ~32k = 7680
    // Total approx = 25320

    console.log(`Gross: $${grossIncome}, Tax: $${tax}`);
    if (tax > 24000 && tax < 27000) {
        console.log("✅ Tax Calculation sane (Within expected range)");
    } else {
        console.error(`❌ Tax Calculation suspicious: ${tax}`);
    }

    console.log("🎉 Rewards Verification Complete");
    process.exit(0);
}

verifyRewardsTier1().catch(console.error);
