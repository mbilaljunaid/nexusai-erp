
import { db } from "../server/db";
import { hrmRecRequisitions } from "../shared/schema/talent_recruitment";
import { hrmPerfDocuments } from "../shared/schema/talent_performance";
import { RecruitmentService } from "../server/services/RecruitmentService";
import { PerformanceService } from "../server/services/PerformanceService";
import { hrPersons, hrOrganizations } from "../shared/schema/hr_structures";
import { sql } from "drizzle-orm";

async function seedTalent() {
    console.log("🌱 Seeding Talent Management Data...");
    const tenantId = "default_tenant";

    // 1. Create Jobs (Recruitment)
    console.log("   - creating Requisitions...");
    const jobs = [
        { title: "Senior React Engineer", department: "Engineering", stage: "OPEN", description: "Lead our frontend team." },
        { title: "Product Manager", department: "Product", stage: "OPEN", description: "Own the roadmap." },
        { title: "Sales Director", department: "Sales", stage: "INTERVIEW", description: "Close enterprise deals." }
    ];

    for (const job of jobs) {
        // We'll trust our service logic to handle ID generation
        await RecruitmentService.createRequisition({
            tenantId,
            title: job.title,
            stage: job.stage,
            description: job.description
            // departmentId left null as we don't queries orgs here yet
        });
    }

    // 2. Create Performance Reviews
    console.log("   - creating Performance Reviews...");

    // We need a dummy PERSON to modify reviews for.
    // Insert a dummy person directly for Foreign Key validity if needed,
    // OR just rely on the fact that Drizzle might not enforce FKs if tables created without strict mode or we insert raw.
    // Actually, our Schema HAS references(() => hrPersons.id). If tables were created with constraints, this insert will FAIL if personId is invalid.

    // Attempt to insert a dummy person first
    // Note: hrPersons table might not exist if previous core migrations weren't run? 
    // Assuming they exist from "shared/schema/hr.ts" or "hr_worker.ts".

    // Let's create a placeholder person ID using raw sql or just a UUID I generate.

    const personId = "00000000-0000-0000-0000-000000000001"; // Fixed ID

    // Try to insert person if not exists (upsert-ish?)
    // This is tricky without knowing if "hr_persons" table is actually in DB.
    // "npm run db:push" pushed the schema. "hr_persons" is in "hr_worker.ts", derived from "hr.ts"? 
    // No, "hr_worker.ts" defined "hrPersons".
    // So "hr_persons" table SHOULD exist.

    try {
        await db.execute(sql`
            INSERT INTO hr_persons (id, tenant_id, first_name, last_name, person_number)
            VALUES (${personId}, ${tenantId}, 'John', 'Doe', 'EMP001')
            ON CONFLICT (id) DO NOTHING;
        `);
    } catch (e) {
        console.warn("   ⚠️ Could not insert dummy person (maybe table missing or conflict?):", e);
    }

    // Create Reviews
    const reviews = [
        { personId, periodName: "2025 Q1 Review", status: "in_progress", overallRating: 0 },
        { personId, periodName: "2024 Annual Review", status: "completed", overallRating: 4 },
        { personId, periodName: "Probation Review", status: "completed", overallRating: 5 }
    ];

    for (const review of reviews) {
        await PerformanceService.createReview({
            tenantId,
            personId: review.personId,
            periodName: review.periodName,
            status: review.status,
            overallRating: review.overallRating
        });
    }

    console.log("✅ Seeding Complete.");
    process.exit(0);
}

seedTalent();
