
import "dotenv/config";
import { db } from "../server/db";
import {
    hrmPayrollRuns, hrmPayrollRunResults, hrmPayGroups, hrmPayElements
} from "../shared/schema/rewards_payroll";
import { hrmWorkerSalaries, hrmSalaryBases } from "../shared/schema/rewards_compensation";
import { hrPersons, hrAssignments, hrWorkRelationships } from "../shared/schema/hr_worker";
import { hrOrganizations } from "../shared/schema/hr_structures";
import { hrmTimeSheets, hrmTimePeriods } from "../shared/schema/time_labor";
import { PayrollService } from "../server/services/PayrollService";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

async function verifyPayrollEngine() {
    console.log("Starting Payroll Engine Verification...");
    const tenantId = "test_tenant_payroll_" + Date.now();
    const periodName = "2026-02";
    const startDate = "2026-02-01";
    const endDate = "2026-02-28";

    try {
        // 1. Setup Dependencies
        console.log("Creating Org...");
        const [org] = await db.insert(hrOrganizations).values({
            tenantId, name: "Test Corp", classificationCode: "LEGAL_EMPLOYER"
        }).returning();

        // Salary Basis (Hourly)
        console.log("Creating Basis...");
        const [hourlyBasis] = await db.insert(hrmSalaryBases).values({
            tenantId, name: "Hourly USD", code: "H_USD_" + Date.now(), frequency: "HOURLY", currency: "USD"
        }).returning();

        // Pay Element (Basic Salary)
        console.log("Creating Element...");
        const [basicElem] = await db.insert(hrmPayElements).values({
            tenantId, name: "Basic Salary", classification: "EARNINGS", inputType: "CALCULATED"
        }).returning();

        // Pay Group
        console.log("Creating PayGroup...");
        const [payGroup] = await db.insert(hrmPayGroups).values({
            tenantId, name: "US Monthly", frequency: "MONTHLY"
        }).returning();

        // Time Period
        console.log("Creating Period...");
        const [period] = await db.insert(hrmTimePeriods).values({
            tenantId, name: periodName, startDate, endDate, status: "OPEN"
        }).returning();

        // 2. Create Employee
        console.log("Creating Person...");
        const [person] = await db.insert(hrPersons).values({
            tenantId, firstName: "John", lastName: "Hourly", personNumber: "H001_" + Date.now(), country: "US"
        }).returning();

        console.log("Creating Relationship...");
        const [rel] = await db.insert(hrWorkRelationships).values({
            tenantId, personId: person.id, legalEmployerId: org.id, dateStart: "2025-01-01"
        }).returning();

        console.log("Creating Assignment...");
        const [assign] = await db.insert(hrAssignments).values({
            tenantId, personId: person.id, workRelationshipId: rel.id, assignmentNumber: "H001-A",
            effectiveStartDate: "2025-01-01", assignmentStatus: "ACTIVE"
        }).returning();

        // 3. Assign Salary ($50/hr)
        console.log("Assigning Salary...");
        await db.insert(hrmWorkerSalaries).values({
            tenantId, assignmentId: assign.id, salaryBasisId: hourlyBasis.id, amount: "50.00", currency: "USD", dateFrom: "2025-01-01"
        });

        // 4. Create Timesheet (Approved) - 40h Reg, 5h OT
        console.log("Creating Timesheet...");
        await db.insert(hrmTimeSheets).values({
            tenantId, personId: person.id, periodId: period.id,
            status: "APPROVED",
            totalHours: "45.00", totalOvertime: "5.00",
            submissionDate: new Date()
        });

        // 5. Create Payroll Run
        console.log("Creating Run...");
        const [run] = await db.insert(hrmPayrollRuns).values({
            tenantId, payGroupId: payGroup.id, periodName, periodStartDate: startDate, periodEndDate: endDate, paymentDate: endDate, status: "OPEN"
        }).returning();

        console.log(`Run Created: ${run.id}. Starting Calculation...`);

        // 6. Execute Calculation
        const result = await PayrollService.calculateRun(run.id, tenantId);
        console.log("Calculation Result:", result);

        // 7. Verify Results
        const results = await db.select().from(hrmPayrollRunResults).where(eq(hrmPayrollRunResults.payrollRunId, run.id));

        console.log("--- Run Results ---");
        let totalEarnings = 0;

        for (const res of results) {
            console.log(`${res.elementName}: ${res.amount}`);
            // Simple Earnings Check
            if (Number(res.amount) > 0) {
                totalEarnings += Number(res.amount);
            }
        }

        // Assertions
        // Reg = 40 * 50 = 2000
        // OT = 5 * 50 * 1.5 = 375
        // Total = 2375
        const expected = 2375.00;

        if (Math.abs(totalEarnings - expected) < 0.01) {
            console.log(`SUCCESS: Total Earnings matched expected ${expected}`);
        } else {
            console.error(`FAILURE: Expected ${expected}, got ${totalEarnings}`);
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

verifyPayrollEngine();
