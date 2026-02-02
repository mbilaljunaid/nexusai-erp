
import { RecruitmentService } from "../server/services/RecruitmentService";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function verifyRecruitingRbac() {
    console.log("🚀 Starting Recruiting RBAC & Pagination Verification...");
    const tenantId = "test_tenant_rbac";

    // 1. Setup Data (Seed multiple candidates)
    console.log("1. Seeding Candidates...");
    for (let i = 0; i < 15; i++) {
        await RecruitmentService.createCandidate({
            tenantId,
            firstName: `Candidate ${i}`,
            lastName: "Test",
            email: `candidate${i}@example.com`,
            phone: `555-00${i}`
        });
    }
    console.log("✅ Seeded 15 Candidates");

    // 2. Verify Pagination
    console.log("2. Verifying Pagination (Limit 5)...");
    const page1 = await RecruitmentService.getCandidates(tenantId, { limit: 5, offset: 0, maskPII: false });
    const page2 = await RecruitmentService.getCandidates(tenantId, { limit: 5, offset: 5, maskPII: false });

    if (page1.length !== 5 || page2.length !== 5) throw new Error("Pagination Limit Failed");
    if (page1[0].id === page2[0].id) throw new Error("Pagination Offset Failed (Rows identical)");
    console.log(`✅ Pagination Verified: Page 1 (${page1.length}) != Page 2 (${page2.length})`);

    // 3. Verify PII Masking (Service Layer)
    console.log("3. Verifying PII Masking...");

    // Case A: Recruiter (Full Access) -> maskPII = false
    const fullData = await RecruitmentService.getCandidates(tenantId, { limit: 1, offset: 0, maskPII: false });
    if (fullData[0].email.includes("***")) throw new Error("Unmasked view SHOULD SHOW real email");
    console.log("✅ Unmasked View: Visible Email");

    // Case B: Manager (Masked Access) -> maskPII = true
    const maskedData = await RecruitmentService.getCandidates(tenantId, { limit: 1, offset: 0, maskPII: true });
    if (!maskedData[0].email.includes("***")) throw new Error("Masked view SHOULD SHOW stars");
    if (maskedData[0].phone !== "******") throw new Error("Phone masking failed");
    console.log("✅ Masked View: Hidden Email & Phone");

    // 4. Verify Pipeline Masking
    console.log("4. Verifying Pipeline Masking...");
    // Create Req & Application
    const req = await RecruitmentService.createRequisition({ tenantId, title: "RBAC Test Job" });
    await RecruitmentService.applyForJob({ tenantId, requisitionId: req.id, candidateId: fullData[0].id, status: "NEW" });

    // Fetch Pipeline (Masked)
    const pipelineMasked = await RecruitmentService.getPipeline(req.id, true);
    const candidateInPipeline = pipelineMasked["NEW"][0].candidate;

    if (!candidateInPipeline.email.includes("***")) throw new Error("Pipeline PII not masked!");
    console.log("✅ Pipeline PII Masking Verified");

    console.log("🎉 RBAC & Hardening Verification Successful!");
    process.exit(0);
}

verifyRecruitingRbac().catch(console.error);
