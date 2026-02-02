
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { hrmRecRequisitions, hrmRecCandidates, hrmRecApplications, hrmRecInterviews } from "../shared/schema/talent_recruitment";
import { RecruitmentService } from "../server/services/RecruitmentService";

async function verifyRecruitingPipeline() {
    console.log("🚀 Starting Recruiting Pipeline Verification...");

    const tenantId = "test_tenant_pipeline";

    // 1. Create a Job Req
    console.log("1. Creating Job Requisition...");
    const req = await RecruitmentService.createRequisition({
        tenantId,
        title: "Senior Full Stack Eng (Pipeline Test)",
        department: "Engineering",
        description: "Test Req"
    });
    console.log(`✅ Job Created: ${req.requisitionNumber} (${req.id})`);

    // 2. Create Candidate
    console.log("2. Creating Candidate...");
    const candidate = await RecruitmentService.createCandidate({
        tenantId,
        firstName: "Pipeline",
        lastName: "Tester",
        email: "pipeline@test.com"
    });
    console.log(`✅ Candidate Created: ${candidate.id}`);

    // 3. Apply
    console.log("3. Applying for Job...");
    const app = await RecruitmentService.applyForJob({
        tenantId,
        requisitionId: req.id,
        candidateId: candidate.id,
        status: "NEW"
    });
    console.log(`✅ Application Created: ${app.id} (Status: ${app.status})`);

    // 4. Verify Pipeline (NEW Stage)
    console.log("4. Fetching Pipeline (Expect NEW)...");
    let pipeline = await RecruitmentService.getPipeline(req.id);
    if (!pipeline["NEW"] || pipeline["NEW"].length === 0) {
        throw new Error("Candidate not found in NEW stage");
    }
    console.log(`✅ Pipeline Verified: Candidate in NEW`);

    // 4b. Find a Valid Interviewer (or Person)
    console.log("4b. Finding valid interviewer...");
    const res = await db.execute(sql`SELECT id FROM hr_persons LIMIT 1`);
    const person = res.rows[0] as any;
    const interviewerId = person?.id;

    if (!interviewerId) {
        console.warn("⚠️ No HR Persons found. Cannot schedule interview. Stopping.");
        process.exit(0);
    }

    // 5. Schedule Interview (Should move to INTERVIEW stage)
    console.log(`5. Scheduling Interview with Person ${interviewerId}...`);
    const interview = await RecruitmentService.scheduleInterview({
        tenantId,
        applicationId: app.id,
        interviewerId: interviewerId,
        scheduledTime: new Date(),
        location: "Zoom"
    });
    console.log(`✅ Interview Scheduled: ${interview.id}`);

    // 6. Verify Status Change
    console.log("6. Verifying Status Change to INTERVIEW...");
    const updatedApp = await RecruitmentService.getApplicationById(app.id);
    if (updatedApp.status !== "INTERVIEW") {
        throw new Error(`Expected status INTERVIEW, got ${updatedApp.status}`);
    }
    console.log(`✅ Application Status Updated: ${updatedApp.status}`);

    // 7. Submit Feedback
    console.log("7. Submitting Feedback...");
    const completedInterview = await RecruitmentService.submitInterviewFeedback(interview.id, "Great candidate", 5);
    if (completedInterview.status !== "COMPLETED" || completedInterview.rating !== 5) {
        throw new Error("Feedback submission failed");
    }
    console.log(`✅ Feedback Submitted: Rating ${completedInterview.rating}`);

    console.log("🎉 Recruitment Pipeline Verification Successful!");
    process.exit(0);
}

verifyRecruitingPipeline().catch(console.error);
