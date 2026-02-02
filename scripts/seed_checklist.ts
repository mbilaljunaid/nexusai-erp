

import { db } from "../server/db";
import { hrChecklists, hrChecklistItems } from "../shared/schema/index";

async function seed() {
    console.log("Seeding Checklist Templates...");

    // 1. Create Onboarding Template
    const [checklist] = await db.insert(hrChecklists).values({
        tenantId: "t1",
        name: "Standard US Onboarding",
        category: "ONBOARDING",
        status: "ACTIVE"
    }).returning(); // No conflict handling in simple insert, assumes fresh or allow duplicate for now

    console.log("Created Checklist:", checklist.id);

    // 2. Create Items
    await db.insert(hrChecklistItems).values([
        { tenantId: "t1", checklistId: checklist.id, taskName: "Upload Passport", sequence: 1 },
        { tenantId: "t1", checklistId: checklist.id, taskName: "Sign Contract", sequence: 2 },
        { tenantId: "t1", checklistId: checklist.id, taskName: "Complete Tax Forms", sequence: 3 },
        { tenantId: "t1", checklistId: checklist.id, taskName: "Review Employee Handbook", sequence: 4 },
    ]);

    console.log("Seeding Complete.");
    process.exit(0);
}

seed().catch(e => {
    console.error(e);
    process.exit(1);
});
