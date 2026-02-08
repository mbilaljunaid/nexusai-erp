
import { db } from "../server/db";
import { hrmSkills, hrmJobProfiles, hrmPersonSkills } from "@shared/schema/talent_core";
import { hrAssignments } from "@shared/schema/hr_worker";
import { hrJobs } from "@shared/schema/hr_structures";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Seeding Manager Insights...");

    const tenantId = "default";

    // 1. Create Skills Library
    const skills = [
        { name: "Digital Leadership", category: "Leadership" },
        { name: "Financial Acumen", category: "Technical" },
        { name: "Strategic Planning", category: "Leadership" },
        { name: "Python Programming", category: "Technical" },
        { name: "React Development", category: "Technical" },
        { name: "Agile Management", category: "Process" }
    ];

    console.log("Seeding Skills...");
    for (const s of skills) {
        try {
            await db.insert(hrmSkills).values({
                tenantId,
                name: s.name,
                category: s.category
            }).onConflictDoNothing();
        } catch (e) { console.log(`Skipping duplicate skill: ${s.name}`); }
    }

    // 2. Assign Requirements to Jobs
    console.log("Updating Job Profiles...");
    const allJobs = await db.select().from(hrJobs).where(eq(hrJobs.tenantId, tenantId)).limit(5);

    for (const job of allJobs) {
        // Mock requirements
        const reqs = [
            { skillName: "Digital Leadership", level: "Intermediate" },
            { skillName: "Strategic Planning", level: "Advanced" }
        ];

        if (job.name.includes("Developer") || job.name.includes("Engineer")) {
            reqs.push({ skillName: "Python Programming", level: "Advanced" });
            reqs.push({ skillName: "React Development", level: "Intermediate" });
        }

        await db.insert(hrmJobProfiles).values({
            tenantId,
            jobId: job.id,
            requiredSkills: reqs,
            profileSummary: `Standard profile for ${job.name}`
        }); // Note: In real life we'd upsert based on jobId
    }

    // 3. Assign Skills to Employees (Create Gaps)
    // We will find employees and give them *some* skills but leave gaps
    console.log("Assigning Skills to Employees...");
    const assignments = await db.select().from(hrAssignments).where(eq(hrAssignments.tenantId, tenantId)).limit(20);

    for (const assignment of assignments) {
        // Give everyone "Agile Management" but miss critical ones to create gaps
        await db.insert(hrmPersonSkills).values({
            tenantId,
            personId: assignment.personId,
            skillName: "Agile Management",
            proficiency: "INTERMEDIATE"
        }).onConflictDoNothing();

        // 30% chance they have Python
        if (Math.random() > 0.7) {
            await db.insert(hrmPersonSkills).values({
                tenantId,
                personId: assignment.personId,
                skillName: "Python Programming",
                proficiency: "BEGINNER"
            }).onConflictDoNothing();
        }
    }

    console.log("Seed complete. Capability Gaps should now appear in Manager Dashboard.");
}

main().catch(console.error);
