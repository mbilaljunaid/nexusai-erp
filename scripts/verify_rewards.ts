
import { db } from "../server/db";
import { RecruitmentService } from "../server/services/RecruitmentService";
import { CompensationService } from "../server/services/CompensationService";
import { PayrollService } from "../server/services/PayrollService";
import { hrmSalaryBases, hrmWorkerSalaries } from "../shared/schema/rewards_compensation";
import { hrPersons, hrWorkRelationships, hrAssignments } from "../shared/schema/hr_worker";
import { hrOrganizations, hrJobs, hrLocations } from "../shared/schema/hr_structures";
import { hrmRecRequisitions, hrmRecCandidates, hrmRecApplications } from "../shared/schema/talent_recruitment";
import { hrmPayGroups, hrmPayElements } from "../shared/schema/rewards_payroll";
import { sql, eq } from "drizzle-orm";

async function verifyRewards() {
    console.log("=== STARTING WORKFORCE REWARDS VERIFICATION ===");
    const tenantId = "VERIFY_TENANT_" + Date.now();

    try {
        // 1. SETUP FOUNDATION (Org, Job, Person)
        const [org] = await db.insert(hrOrganizations).values({
            tenantId, name: "Engineering", classificationCode: "DEPT"
        }).returning();

        const [job] = await db.insert(hrJobs).values({
            tenantId, name: "Senior Dev", code: "SDEV"
        }).returning();

        const [person] = await db.insert(hrPersons).values({
            tenantId, firstName: "John", lastName: "Payroll", personNumber: "PAY-" + Date.now(),
            email: "john.payroll@example.com"
        }).returning();

        const [workRel] = await db.insert(hrWorkRelationships).values({
            tenantId, personId: person.id, legalEmployerId: org.id, dateStart: new Date().toISOString()
        }).returning();

        const [assignment] = await db.insert(hrAssignments).values({
            tenantId, personId: person.id, workRelationshipId: workRel.id,
            jobId: job.id, assignmentNumber: "A-" + person.personNumber,
            effectiveStartDate: new Date().toISOString()
        }).returning();

        console.log("✅ Foundation Created: Person", person.id, "Assignment", assignment.id);

        // 2. SETUP SALARY BASIS
        const salaryBasis = await CompensationService.createSalaryBasis({
            tenantId, name: "US Annual Verified", code: "US_ANN_" + Date.now(),
            frequency: "ANNUALLY", annualizationFactor: "1.0", currency: "USD", status: "ACTIVE"
        });
        console.log("✅ Salary Basis Created:", salaryBasis.id);

        // 3. RECRUITMENT INTEGRATION FLOW
        // Create Requisition -> Candidate (Linked to Person) -> Application -> Offer -> ACCEPT
        const req = await RecruitmentService.createRequisition({
            tenantId, title: "Reward Engineer", requisitionNumber: "REQ-VERIFY-" + Date.now()
        });

        const candidate = await RecruitmentService.createCandidate({
            tenantId, firstName: "John", lastName: "Payroll", email: person.email, linkedPersonId: person.id
        });

        const app = await RecruitmentService.applyForJob({
            tenantId, candidateId: candidate.id, requisitionId: req.id
        });

        // 4. Create Offer
        const offer = await RecruitmentService.createOffer({
            tenantId, applicationId: app.id, baseSalary: 120000, currency: "USD", startDate: "2026-01-01"
        });
        console.log("✅ Offer Created:", offer.id, "Amount:", offer.baseSalary);

        // 5. ACCEPT OFFER (Should Trigger Salary Creation)
        await RecruitmentService.acceptOffer(offer.id);
        console.log("✅ Offer Accepted (Integration Triggered)");

        // 6. VERIFY SALARY CREATION
        const salary = await CompensationService.getWorkerSalary(assignment.id);
        if (!salary) throw new Error("Salary Integration Failed: No Salary found for assignment");
        if (Number(salary.amount) !== 120000) throw new Error("Salary Amount Mismatch");
        console.log("✅ INTEGRATION SUCCESS: Salary Record Created:", salary.id);

        // 7. PAYROLL SETUP
        const [group] = await db.insert(hrmPayGroups).values({
            tenantId, name: "US Verified Monthly", frequency: "MONTHLY"
        }).returning();

        const elem = await PayrollService.createElement({
            tenantId, name: "Basic Salary", classification: "EARNINGS", taxable: true
        });

        // 7b. SETUP DEDUCTIONS
        const taxElem = await PayrollService.createElement({
            tenantId, name: "Income Tax", classification: "TAX"
        });
        const healthElem = await PayrollService.createElement({
            tenantId, name: "Health Insurance", classification: "DEDUCTION"
        });
        console.log("✅ Elements Created: Basic, Tax, Health");

        // 8. RUN PAYROLL
        const run = await PayrollService.createRun({
            tenantId, payGroupId: group.id, periodName: "2026-01",
            periodStartDate: "2026-01-01", periodEndDate: "2026-01-31", paymentDate: "2026-01-31"
        });
        console.log("✅ Payroll Run Created:", run.id);

        // 9. CALCULATE
        const result = await PayrollService.calculateRun(run.id, tenantId);
        console.log("✅ Payroll Calculated:", result);

        if (result.processedCount === 0) console.warn("⚠️ Warning: processedCount is 0. Check Assignment Active Status logic.");

        // 10. VERIFY RUN RESULTS
        const results = await PayrollService.getRunResults(run.id);
        const myResults = results.filter(r => r.assignmentId === assignment.id);

        if (myResults.length === 0) throw new Error("No Run Result found for assignment");

        const basic = myResults.find(r => r.elementName === "Basic Salary");
        const tax = myResults.find(r => r.elementName === "Income Tax");
        const health = myResults.find(r => r.elementName === "Health Insurance");

        console.log("✅ Verified Result Lines:");
        console.log("   - Basic:", basic?.amount);
        console.log("   - Tax:", tax?.amount);
        console.log("   - Health:", health?.amount);

        const net = Number(basic?.amount || 0) + Number(tax?.amount || 0) + Number(health?.amount || 0);
        console.log("   - Calculated Net:", net);

        // Expect: 10000 - 2000 (20%) - 200 = 7800
        if (Math.abs(net - 7800) > 0.1) throw new Error(`Net Pay Mismatch. Expected ~7800, got ${net}`);

        console.log("=== VERIFICATION COMPLETE: ALL SYSTEMS GO ===");
        process.exit(0);
    } catch (err) {
        console.error("❌ VERIFICATION FAILED:", err);
        process.exit(1);
    }
}

verifyRewards();
