
import { RecruitmentService } from "../server/services/RecruitmentService";
import { CalendarService } from "../server/services/CalendarService";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function verifyInterviewerExperience() {
    console.log("🚀 Starting Interviewer Experience Verification...");
    const tenantId = "test_tenant_interview";
    const interviewerId = "user_interviewer_001";

    // 1. Setup Data
    console.log("1. Setting up Requisition, Candidate & Interviewer...");

    // 1. Setup Data
    console.log("1. Setting up Requisition, Candidate & Interviewer...");

    // Ensure Interviewer Exists in hr_persons
    await db.execute(sql`INSERT INTO hr_persons (id, tenant_id, first_name, last_name, email, person_number) VALUES (${interviewerId}, ${tenantId}, 'John', 'Interviewer', 'john@test.com', 'EMP-INT-01') ON CONFLICT (id) DO NOTHING`);

    const req = await RecruitmentService.createRequisition({
        tenantId,
        title: "Senior Engineer",
        description: "Test Job",
        requisitionNumber: `REQ-VERIFY-INT-${Date.now()}`
    });

    const candidate = await RecruitmentService.createCandidate({
        tenantId,
        firstName: "Alice",
        lastName: "Candidate",
        email: "alice@test.com"
    });

    const app = await RecruitmentService.applyForJob({
        tenantId,
        candidateId: candidate.id,
        requisitionId: req.id
    });

    // 2. Schedule Interview
    console.log("2. Scheduling Interview...");
    const interviewTime = new Date();
    await RecruitmentService.scheduleInterview({
        tenantId,
        applicationId: app.id,
        interviewerId,
        scheduledTime: interviewTime,
        durationMinutes: 60,
        location: "Zoom"
    });

    // 3. Fetch Schedule
    console.log("3. Fetching Schedule for Interviewer...");
    const schedule = await RecruitmentService.getInterviewerSchedule(interviewerId);

    if (schedule.length === 0) throw new Error("Schedule is empty");
    if (schedule[0].candidateName !== "Alice Candidate") throw new Error("Candidate Name Mismatch");
    if (schedule[0].jobTitle !== "Senior Engineer") throw new Error("Job Title Mismatch");
    console.log(`✅ Schedule Verified: 1 Interview found for ${schedule[0].candidateName}`);

    // 4. Verify ICS Generation
    console.log("4. Verifying ICS Generation...");
    const icsInfo = {
        summary: `Interview with ${schedule[0].candidateName}`,
        startTime: new Date(schedule[0].scheduledTime),
        endTime: new Date(new Date(schedule[0].scheduledTime).getTime() + 60 * 60000),
        location: schedule[0].location || "Remote"
    };

    const icsContent = CalendarService.generateICS(icsInfo);
    if (!icsContent.includes("BEGIN:VCALENDAR")) throw new Error("Invalid ICS: Missing Header");
    if (!icsContent.includes("SUMMARY:Interview with Alice Candidate")) throw new Error("Invalid ICS: summary missing");

    console.log("✅ ICS Content Verified");

    console.log("🎉 Interviewer Experience Verification Successful!");
    process.exit(0);
}

verifyInterviewerExperience().catch(console.error);
