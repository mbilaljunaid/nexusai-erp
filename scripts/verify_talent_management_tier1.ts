
import { db } from "../server/db";
import {
    hrmRecRequisitions, hrmRecCandidates, hrmRecApplications, hrmRecOffers
} from "../shared/schema/talent_recruitment";
import { hrmPerfGoals, hrmPerfDocuments } from "../shared/schema/talent_performance";
import { hrPersons } from "../shared/schema/hr_worker";
import { hrOrganizations } from "../shared/schema/hr_structures";
import { eq, and } from "drizzle-orm";
import { addDays, format } from "date-fns";

async function verifyTalentManagementTier1() {
    console.log("🌟 Verifying Talent Management Tier-1 Parity...");
    const tenantId = "test_talent_" + Date.now();

    // 1. Setup Master Data
    const [hiringManager] = await db.insert(hrPersons).values({
        tenantId,
        personNumber: "MGR-" + Date.now(),
        firstName: "Alice",
        lastName: "Manager",
        email: `alice${Date.now()}@test.com`,
    }).returning();

    const [dept] = await db.insert(hrOrganizations).values({
        tenantId,
        name: "Engineering",
        classificationCode: "DEPT",
        activeStatus: "ACTIVE"
    }).returning();

    // === RECRUITING VERIFICATION ===
    console.log("\n🧪 Testing Recruitment Pipeline...");

    // 1. Create Job Requisition
    const [job] = await db.insert(hrmRecRequisitions).values({
        tenantId,
        requisitionNumber: "REQ-" + Date.now(),
        title: "Senior AI Engineer",
        departmentId: dept.id,
        hiringManagerId: hiringManager.id,
        status: "OPEN"
    }).returning();

    // 2. Create Candidate
    const [candidate] = await db.insert(hrmRecCandidates).values({
        tenantId,
        firstName: "Bob",
        lastName: "Builder",
        email: `bob${Date.now()}@test.com`,
    }).returning();

    // 3. Apply
    const [application] = await db.insert(hrmRecApplications).values({
        tenantId,
        requisitionId: job.id,
        candidateId: candidate.id,
        status: "NEW", // Pipeline stage
        stage: "SCREENING"
    }).returning();

    // 4. Create Offer
    const [offer] = await db.insert(hrmRecOffers).values({
        tenantId,
        applicationId: application.id,
        baseSalary: 150000, // Integrity: Integer in schema
        currency: "USD",
        status: "DRAFT"
    }).returning();

    if (offer && offer.baseSalary === 150000) {
        console.log(`✅ Recruiting Flow Verified: Job ${job.title} -> Candidate ${candidate.firstName} -> Offer ${offer.status}`);
    } else {
        console.error("❌ Recruiting Flow Failed");
    }

    // === PERFORMANCE VERIFICATION ===
    console.log("\n🧪 Testing Performance Management...");

    // 1. Create Goal
    const [goal] = await db.insert(hrmPerfGoals).values({
        tenantId,
        personId: hiringManager.id,
        title: "Deliver Tier-1 Audit",
        status: "IN_PROGRESS",
    }).returning();

    // 2. Create Review (Document)
    const [review] = await db.insert(hrmPerfDocuments).values({
        tenantId,
        personId: hiringManager.id,
        managerId: hiringManager.id,
        periodName: "2026 Q1",
        status: "DRAFT"
    }).returning();

    if (review && goal) {
        console.log(`✅ Performance Flow Verified: Goal '${goal.title}' created. Review '${review.periodName}' created.`);
    } else {
        console.error("❌ Performance Flow Failed");
    }

    console.log("🎉 Talent Management Verification Complete");
    process.exit(0);
}

verifyTalentManagementTier1().catch(console.error);
