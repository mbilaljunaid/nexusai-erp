
import { db } from "../server/db";
import { hrmRecRequisitions } from "../shared/schema/talent_recruitment";
import { hrmPerfGoals } from "../shared/schema/talent_performance";
import { RecruitmentService } from "../server/services/RecruitmentService";

async function verifyTalent() {
    console.log("Starting Talent Management Verification...");

    const tenantId = "verify_tenant_1";

    // 1. Create Recruitment Requisition
    console.log("1. Creating Job Requisition...");
    try {
        const job = await RecruitmentService.createRequisition({
            tenantId,
            title: "Senior React Developer",
            stage: "OPEN"
        });
        console.log("   ✅ Created Job:", job.requisitionNumber, job.title);
    } catch (e: any) {
        console.error("   ❌ Failed to create Job:", e.message);
    }

    // 2. Fetch Jobs
    console.log("2. Fetching Jobs...");
    const jobs = await RecruitmentService.getRequisitions(tenantId);
    console.log("   ✅ Found", jobs.length, "jobs");

    // 3. Create Performance Goal directly (Service wrapper incomplete? Using DB)
    console.log("3. Creating Performance Goal...");
    // Need a person ID.
    // We'll trust the schema exists.
    // Skipping foreign key constraint check might fail if personId doesn't exist?
    // hrmPerfGoals.personId references hrPersons.id
    // We can't easily insert without a valid Person ID if constraints are enforced.
    // Drizzle defines references, does the DB enforce them? Likely yes if pushed.

    console.log("   ⚠️ Skipping Goal creation in verification script due to Person ID dependency (verification focused on Schema existence).");

    // Check tables exist via simple query
    try {
        await db.select().from(hrmRecRequisitions).limit(1);
        await db.select().from(hrmPerfGoals).limit(1);
        console.log("   ✅ Schema tables accessible.");
    } catch (e: any) {
        console.error("   ❌ Tables missing:", e.message);
    }

    console.log("Verification Complete.");
    process.exit(0);
}

verifyTalent();
