
import { db } from "../server/db";
import {
    ppmProjectTemplates, ppmBillRateSchedules, ppmBillRates
} from "../shared/schema/index";
import { ppmService } from "../server/services/PpmService";
import { eq } from "drizzle-orm";

async function verifyPpmConfiguration() {
    console.log("Starting Verification: PPM Configuration & Master Data (Phase 9)...");

    try {
        // ---------------------------------------------------------
        // Test 1: Project Templates (L8)
        // ---------------------------------------------------------
        console.log("1. Testing Project Templates (L8)...");

        // 1a. Create Template
        const templateName = `Consulting-Template-${Date.now()}`;
        const [template] = await db.insert(ppmProjectTemplates).values({
            name: templateName,
            description: "Standard T&M Consulting Project",
            projectType: "CONTRACT",
            defaultBurdenScheduleId: "default-schedule-id" // Mocking for test
        }).returning();
        console.log(`   Template Created: ${template.name}`);

        // 1b. Create Project from Template
        const newProjNumber = `TMPL-PROJ-${Date.now()}`;
        const project = await ppmService.createProjectFromTemplate(template.id, {
            name: "New Client Implementation",
            projectNumber: newProjNumber,
            startDate: new Date()
        });
        console.log(`   Project Created from Template: ${project.projectNumber}`);
        console.log(`   - Type: ${project.projectType} (Expected: CONTRACT)`);
        console.log(`   - Desc: ${project.description}`);

        if (project.projectType === "CONTRACT" && project.description === template.description) {
            console.log("   ✅ TEMPLATE VERIFICATION: PASSED");
        } else {
            console.error("   ❌ TEMPLATE VERIFICATION: FAILED");
        }

        // ---------------------------------------------------------
        // Test 2: Bill Rate Schedules (L9)
        // ---------------------------------------------------------
        console.log("\n2. Testing Bill Rate Schedules (L9)...");

        // 2a. Create Schedule
        const [schedule] = await db.insert(ppmBillRateSchedules).values({
            name: `Global Rates ${Date.now()}`,
            currencyCode: "USD"
        }).returning();
        console.log(`   Schedule Created: ${schedule.name}`);

        // 2b. Add Rates (Hierarchy: Person > Job)
        // Generic "Consultant" Rate: $100
        await db.insert(ppmBillRates).values({
            scheduleId: schedule.id,
            jobTitle: "Consultant",
            rate: "100.00"
        });
        // Specific "John Doe" Rate: $200
        await db.insert(ppmBillRates).values({
            scheduleId: schedule.id,
            personId: "john-doe-123",
            rate: "200.00"
        });
        console.log("   Rates Added: Consultant=$100, JohnDoe=$200");

        // 2c. Verify Lookups
        const genericRate = await ppmService.getBillRate(schedule.id, undefined, "Consultant");
        console.log(`   Lookup 'Consultant' (Generic): $${genericRate}`);

        const specificRate = await ppmService.getBillRate(schedule.id, "john-doe-123", "Consultant");
        console.log(`   Lookup 'John Doe' (Specific): $${specificRate}`);

        const unknownRate = await ppmService.getBillRate(schedule.id, undefined, "Intern");
        console.log(`   Lookup 'Intern' (Unknown): $${unknownRate}`);

        if (genericRate === "100.00" && specificRate === "200.00" && unknownRate === "0.00") {
            console.log("   ✅ RATE ENGINE VERIFICATION: PASSED");
        } else {
            console.error("   ❌ RATE ENGINE VERIFICATION: FAILED");
        }

    } catch (error) {
        console.error("Verification Execption:", error);
    }
}

verifyPpmConfiguration();
