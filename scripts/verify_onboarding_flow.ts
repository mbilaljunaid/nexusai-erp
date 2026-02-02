
import { RecruitmentService } from "../server/services/RecruitmentService";
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { hrmRecOnboardingTasks } from "@shared/schema/talent_recruitment";

async function verifyOnboardingFlow() {
    console.log("🚀 Starting Onboarding Flow Verification...");
    const tenantId = "test_tenant_onboard";
    const ts = Date.now();

    // 1. Setup Request (Req + Candidate + App + Offer)
    console.log("1. Setting up Hiring Flow...");

    // Create Person for Internal Candidate Link (needed for Salary assignment, but optional for Onboarding checklist creation logic? 
    // Logic says "If Internal Candidate... Auto-Create Salary Assignment". 
    // Onboarding checklist is Step 5, independent of Salary.
    // Let's create a fresh external candidate to avoid HrPerson complexity for this test.

    const req = await RecruitmentService.createRequisition({
        tenantId,
        title: "Onboarding Test Role",
        requisitionNumber: `REQ-OB-${ts}`
    });

    const candidate = await RecruitmentService.createCandidate({
        tenantId,
        firstName: "New",
        lastName: "Hire",
        email: `hire${ts}@test.com`
    });

    const app = await RecruitmentService.applyForJob({
        tenantId,
        candidateId: candidate.id,
        requisitionId: req.id
    });

    const offer = await RecruitmentService.createOffer({
        tenantId,
        applicationId: app.id,
        baseSalary: 100000,
        startDate: new Date(),
        expirationDate: new Date()
    });

    // 2. Accept Offer -> Trigger Onboarding
    console.log("2. Accepting Offer (Triggers Onboarding)...");
    await RecruitmentService.acceptOffer(offer.id);

    // 3. Verify Tasks Created
    console.log("3. Verifying Onboarding Tasks...");
    const progressList = await RecruitmentService.getOnboardingProgress(tenantId);
    if (progressList.length === 0) throw new Error("No onboarding progress found");

    const hire = progressList.find(h => h.id === app.id);
    if (!hire) throw new Error("Hire not found in progress list");

    if (hire.totalTasks !== 5) throw new Error(`Expected 5 default tasks, got ${hire.totalTasks}`);
    if (hire.progress !== 0) throw new Error("Expected 0% progress");

    console.log("✅ Tasks Created Successfully");

    // 4. Complete a Task
    console.log("4. completing a Task...");
    const taskToComplete = hire.tasks[0];
    await RecruitmentService.updateOnboardingTask(taskToComplete.id, "COMPLETED");

    // 5. Verify Progress Update
    const updatedProgressList = await RecruitmentService.getOnboardingProgress(tenantId);
    const updatedHire = updatedProgressList.find(h => h.id === app.id);

    if (updatedHire.completedTasks !== 1) throw new Error("Task completion not counted");
    if (updatedHire.progress !== 20) throw new Error(`Expected 20% progress, got ${updatedHire.progress}%`);

    console.log("✅ Progress Updated Successfully (20%)");

    console.log("🎉 Onboarding Verification Successful!");
    process.exit(0);
}

verifyOnboardingFlow().catch(console.error);
