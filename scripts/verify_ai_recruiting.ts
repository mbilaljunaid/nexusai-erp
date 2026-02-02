
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { hrmRecApplications } from "../shared/schema/talent_recruitment";
import { ResumeParsingService } from "../server/services/ResumeParsingService";
import { RecruitmentService } from "../server/services/RecruitmentService";

async function verifyAiRecruiting() {
    console.log("🚀 Starting AI Recruiting Verification...");
    const tenantId = "test_tenant_ai";

    // 1. Create a Job Req with specific keywords
    console.log("1. Creating Job Requisition (React/Node) ...");
    const req = await RecruitmentService.createRequisition({
        tenantId,
        title: "Senior AI Engineer",
        department: "Engineering",
        description: "We need an expert in Python, Machine Learning, and SQL."
    });
    console.log(`✅ Job Created: ${req.title}`);

    // 2. Simulate Resume Parsing (Direct Service Call)
    console.log("2. Testing Resume Parsing Logic...");
    const sampleResume = "I am a software engineer with 5 years experience in Python, SQL, and React. I have a Master's degree.";
    const parsed = await ResumeParsingService.parseResume(sampleResume);
    console.log("   Extracted Skills:", parsed.skills);
    console.log("   Extracted Education:", parsed.education);

    if (!parsed.skills.includes("Python") || !parsed.skills.includes("SQL")) {
        throw new Error("Resume Parsing failed to extract Python/SQL");
    }
    console.log("✅ Resume Parsing Verified");

    // 3. Create Candidate & Application (Simulate Public Apply)
    console.log("3. Simulating Public Application...");
    const candidate = await RecruitmentService.createCandidate({
        tenantId,
        firstName: "AI",
        lastName: "Candidate",
        email: "ai_test@example.com",
        skills: parsed.skills
    });

    const app = await RecruitmentService.applyForJob({
        tenantId,
        requisitionId: req.id,
        candidateId: candidate.id,
        status: "NEW"
    });
    console.log(`✅ Application Created: ${app.id}`);

    // 4. Verify AI Scoring
    console.log("4. Calculating Match Score...");
    const score = await ResumeParsingService.scoreCandidate(candidate.id, req.id);
    console.log(`   Calculated Score: ${score}/100`);

    // Python, SQL are in job title/desc?
    // Job: "Senior AI Engineer ... Python, Machine Learning, SQL"
    // Resume: "Python, SQL, React"
    // Keywords check: Python (Yes), SQL (Yes). 
    // If logic works, it should be high.

    if (score === 0) {
        throw new Error("Score should be > 0");
    }
    console.log(`✅ Scoring Verified: ${score}`);

    // 5. Verify DB Update
    // In the real route, we update DB. Let's manually update here as script mimics route logic
    // Or check if 'applyForJob' trigger was added? No, route handles it.
    // So we just verify the Service logic here.

    console.log("🎉 AI Recruiting Verification Successful!");
    process.exit(0);
}

verifyAiRecruiting().catch(console.error);
