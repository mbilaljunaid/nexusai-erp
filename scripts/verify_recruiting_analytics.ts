
import { RecruitmentService } from "../server/services/RecruitmentService";
import { db } from "../server/db";
import { sql, eq } from "drizzle-orm";
import { hrmRecRequisitions, hrmRecOffers, hrmRecApplications } from "@shared/schema/talent_recruitment";

async function verifyRecruitingAnalytics() {
    console.log("🚀 Starting Recruiting Analytics Verification...");
    const tenantId = "test_tenant_analytics";
    const ts = Date.now();

    // 1. Create a Hire with Specific Timings
    console.log("1. Simulating a Hire (10 Day Time-to-Fill)...");

    const req = await RecruitmentService.createRequisition({
        tenantId,
        title: "Analytics Role",
        requisitionNumber: `REQ-AN-${ts}`
    });

    // Manually backdate Rec creation 10 days
    const openDate = new Date();
    openDate.setDate(openDate.getDate() - 10);
    await db.update(hrmRecRequisitions)
        .set({ createdAt: openDate })
        .where(eq(hrmRecRequisitions.id, req.id));

    const candidate = await RecruitmentService.createCandidate({
        tenantId,
        firstName: "Data",
        lastName: "Analyst",
        email: `data${ts}@test.com`,
        source: "LinkedIn"
    });

    const app = await RecruitmentService.applyForJob({
        tenantId,
        candidateId: candidate.id,
        requisitionId: req.id
    });

    const offer = await RecruitmentService.createOffer({
        tenantId,
        applicationId: app.id,
        baseSalary: 120000,
        startDate: new Date(),
        expirationDate: new Date()
    });

    // Accept Offer (Today)
    await RecruitmentService.acceptOffer(offer.id);

    // 2. Fetch Analytics
    console.log("2. Fetching Analytics...");
    const data = await RecruitmentService.getAnalytics(tenantId);

    // 3. Verify Metrics
    console.log("3. Verifying Metrics...", data);

    if (data.totalHires !== 1) throw new Error(`Expected 1 hire, got ${data.totalHires}`);

    // Time to fill: Created -10 days ago, Accepted Today. Diff = 10.
    // Allow small margin of error for execution time (9.99 - 10.01)
    if (data.timeToFill < 9 || data.timeToFill > 11) {
        throw new Error(`Expected Time to Fill ~10 days, got ${data.timeToFill}`);
    }

    if (data.acceptanceRate !== 100) throw new Error(`Expected 100% acceptance rate, got ${data.acceptanceRate}`);

    if (data.sourceBreakdown["LinkedIn"] !== 1) throw new Error("Source breakdown incorrect");

    console.log("✅ Analytics Verified Successfully!");
    process.exit(0);
}

verifyRecruitingAnalytics().catch(console.error);
