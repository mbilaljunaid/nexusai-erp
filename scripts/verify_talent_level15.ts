
import { db } from "../server/db";
import { RecruitmentService } from "../server/services/RecruitmentService";
import { PerformanceService } from "../server/services/PerformanceService";
import { hrmRecRequisitions, hrmRecCandidates, hrmRecApplications, hrmRecOffers } from "../shared/schema/talent_recruitment";
import { hrmPerfGoals } from "../shared/schema/talent_performance";
import { hrPersons } from "../shared/schema/hr_worker";
import { eq } from "drizzle-orm";

async function verifyTalentLevel15() {
    console.log("🔍 Verifying Talent Management Level-15 Remediations...");
    const tenantId = "tenant_test_l15_" + Date.now();

    try {
        // 1. RECRUITMENT TESTS
        console.log("\n1️⃣  Testing Recruitment Module...");

        // Create Job
        const job = await RecruitmentService.createRequisition({
            tenantId,
            title: "Senior AI Engineer",
            department: "Engineering",
            description: "Build the future."
        });
        if (!job.id) throw new Error("Failed to create Job Requisition");
        console.log("✅ Job Created:", job.requisitionNumber);

        // Create Candidate
        const candidate = await RecruitmentService.createCandidate({
            tenantId,
            firstName: "Ada",
            lastName: "Lovelace",
            email: `ada.${Date.now()}@example.com`,
            skills: ["Algorithm", "Math"]
        });
        if (!candidate.id) throw new Error("Failed to create Candidate");
        console.log("✅ Candidate Created:", candidate.email);

        // Apply
        const application = await RecruitmentService.applyForJob({
            tenantId,
            candidateId: candidate.id,
            requisitionId: job.id,
            status: "APPLIED"
        });
        if (!application.id) throw new Error("Failed to submit Application");
        console.log("✅ Application Submitted:", application.status);

        // Update Stage
        await RecruitmentService.updateApplicationStatus(application.id, "INTERVIEW", "Technical Round");
        console.log("✅ Application Moved to Interview");

        // Offer
        const offer = await RecruitmentService.createOffer({
            tenantId,
            applicationId: application.id,
            baseSalary: 150000,
            currency: "USD",
            startDate: new Date(),
            status: "DRAFT"
        });
        if (!offer.id) throw new Error("Failed to create Offer");
        console.log("✅ Offer Created:", offer.baseSalary);

        // Verify Application Status Auto-Update
        const updatedApp = await RecruitmentService.getApplicationById(application.id);
        if (updatedApp.status !== "OFFER") throw new Error("Application status did not auto-update to OFFER");
        console.log("✅ Application Status Sync Verified:", updatedApp.status);


        // 2. PERFORMANCE TESTS
        console.log("\n2️⃣  Testing Performance Module...");

        // Create Mock Person
        const [person] = await db.insert(hrPersons).values({
            tenantId,
            personNumber: "P-" + Date.now(),
            firstName: "John",
            lastName: "Doe",
            email: `john.${Date.now()}@example.com`
        }).returning();

        const personId = person.id; // Use real ID
        console.log("✅ Mock Person Created:", person.personNumber);

        // Create Goal
        const goal = await PerformanceService.createGoal({
            tenantId,
            personId,
            title: "Master Level-15 Architecture",
            weight: 30,
            status: "IN_PROGRESS"
        });
        if (!goal.id) throw new Error("Failed to create Goal");
        console.log("✅ Goal Created:", goal.title);

        // Update Goal
        await PerformanceService.updateGoal(goal.id, { progress: 50 });
        const updatedGoal = (await PerformanceService.getGoals(personId)).find(g => g.id === goal.id);
        if (updatedGoal.progress !== 50) throw new Error("Goal progress update failed");
        console.log("✅ Goal Progress Updated:", updatedGoal.progress + "%");


        console.log("\n🎉 ALL LEVEL-15 CHECKS PASSED!");

    } catch (error) {
        console.error("\n❌ VERIFICATION FAILED:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

verifyTalentLevel15();
