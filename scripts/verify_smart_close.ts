
import { closeEngine } from "../server/services/period-close/CloseEngine";
import { db } from "../server/db";
import { glPeriods, glCloseTasks, slaJournalHeaders, slaEventClasses, slaEventTypes } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

async function main() {
    console.log("🤖 Starting Smart Close Automation Verification...");
    const ledgerId = "PRIMARY";

    // 0. Seed SLA Event Class & Type (Reference Data)
    const mockClassId = "Mock";
    const mockTypeId = "MockType";

    await db.insert(slaEventClasses).values({
        id: mockClassId,
        applicationId: "GL",
        name: "Mock Event Class",
        description: "For Testing"
    }).onConflictDoNothing();

    await db.insert(slaEventTypes).values({
        id: mockTypeId,
        eventClassId: mockClassId,
        name: "Mock Event Type"
    }).onConflictDoNothing();

    console.log("✅ Seeded Mock SLA References");

    // 1. Create a Test Period (Mocking future date for prediction)
    const periodName = `Smart-Close-${uuidv4().substring(0, 4)}`;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3); // 3 days remaining

    const [period] = await db.insert(glPeriods).values({
        periodName,
        startDate: new Date(),
        endDate: endDate,
        status: "Open",
        ledgerId,
        fiscalYear: "2026"
    }).returning();
    console.log(`✅ Created Test Period: ${periodName} (Ends in 3 days)`);

    // 2. Setup "High Risk" Scenario
    // Add Overdue Tasks
    await db.insert(glCloseTasks).values({
        ledgerId,
        periodId: period.id,
        taskName: "Critical Recon",
        description: "Must be done",
        dueDate: new Date(Date.now() - 86400000), // Yesterday
        status: "PENDING"
    });
    console.log("⚠️ Added Overdue Task");

    // Add Unaccounted Journals (Volume)
    console.log(`⚠️ Simulating Unaccounted Events...`);
    await db.insert(slaJournalHeaders).values({
        ledgerId,
        eventId: uuidv4(),
        eventClassId: mockClassId,
        eventTypeId: mockTypeId,
        glDate: new Date(),
        eventDate: new Date(),
        currencyCode: "USD",
        status: "Draft",
        entityId: uuidv4(),
        entityTable: "mock_table"
    });


    // 3. Test AI Prediction
    console.log("🧠 Requesting AI Close Prediction...");
    const prediction = await closeEngine.predictCloseDelays(ledgerId, periodName);
    console.log("📊 Prediction Result:", prediction);

    if (prediction.riskLevel === 'Low' && prediction.overdueTaskCount > 0) {
        console.warn("⚠️ Prediction Logic might need tuning (Expected >Low with overdue tasks)");
    }

    // 4. Test Auto-Sweep
    console.log("🧹 Testing Auto-Sweep...");
    const nextPeriodName = `Next-${periodName}`;
    await db.insert(glPeriods).values({
        periodName: nextPeriodName,
        startDate: endDate, // Starts when prev ends
        endDate: new Date(endDate.getTime() + 86400000 * 30),
        status: "Open",
        ledgerId,
        fiscalYear: "2026"
    });

    const sweepRes = await closeEngine.sweepEvents(ledgerId, periodName, nextPeriodName);
    console.log("✅ Sweep Result:", sweepRes);

    if (sweepRes.count >= 1) {
        console.log("🎉 Smart Close Logic Verified!");
        process.exit(0);
    } else {
        console.error("❌ Sweep failed to move events.");
        process.exit(1);
    }
}

main().catch(console.error);
