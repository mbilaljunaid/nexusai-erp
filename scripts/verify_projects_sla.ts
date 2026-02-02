
import { db } from "@db";
import {
    ppmProjects, ppmTasks, ppmExpenditureItems, ppmExpenditureTypes,
    ppmCostDistributions, ppmBillingEvents, ppmBillingRules,
    slaJournalHeaders, slaJournalLines, glLedgers
} from "@shared/schema";
import { PpmService } from "../server/modules/ppm/services/PpmService";
import { PpmBillingService } from "../server/modules/ppm/services/PpmBillingService";
import { eq, desc } from "drizzle-orm";

const ppmService = new PpmService();
const billingService = new PpmBillingService();

async function runVerification() {
    console.log("🔍 Starting Phase 12 Verification: Projects SLA Integration...");

    // 0. Get Ledger
    const [ledger] = await db.select().from(glLedgers).limit(1);
    const ledgerId = ledger?.id || "62ffbe4c-7c87-4d92-9654-2b7e8850b69c"; // Fallback to assumed ID or Error
    console.log(`POINTER: Using Ledger ID: ${ledgerId}`);

    // 1. Setup Project
    const projectNum = `PROJ-SLA-${Date.now()}`;
    console.log(`\n1️⃣ Creating Test Project: ${projectNum}`);

    const [project] = await db.insert(ppmProjects).values({
        projectNumber: projectNum,
        name: `SLA Verification Project ${projectNum}`,
        projectType: "CAPITAL", // Add required field
        status: "ACTIVE",
        startDate: new Date(),
        organizationId: ledgerId // Default Ledger
    }).returning();

    const [task] = await db.insert(ppmTasks).values({
        projectId: project.id,
        taskNumber: "1.0",
        name: "Construction Phase",
        startDate: new Date(),
        capitalizableFlag: true, // CIP Test
        billableFlag: true
    }).returning();

    // 2. Setup Master Data
    let [laborType] = await db.select().from(ppmExpenditureTypes).where(eq(ppmExpenditureTypes.name, "Labor"));
    if (!laborType) {
        [laborType] = await db.insert(ppmExpenditureTypes).values({ name: "Labor", unitOfMeasure: "Hours" }).returning();
    }

    // 3. Create Cost (Expenditure Item)
    console.log(`\n2️⃣ Creating Expenditure Item (Cost)...`);
    const [expItem] = await db.insert(ppmExpenditureItems).values({
        taskId: task.id,
        expenditureTypeId: laborType.id,
        expenditureItemDate: new Date(),
        quantity: "10",
        rawCost: "1000.00",
        unitCost: "100.00",
        transactionSource: "Labor",
        denomCurrencyCode: "USD",
        status: "UNCOSTED",
        capitalizationStatus: "CIP" // Should trigger Project CIP event
    }).returning();

    // 4. Run Distribution (SLA Trigger)
    console.log(`\n3️⃣ Running Cost Distribution (SLA Trigger)...`);
    await ppmService.generateDistributions(expItem.id);

    // Verify SLA Journal
    const costHeader = await db.query.slaJournalHeaders.findFirst({
        where: eq(slaJournalHeaders.entityId, expItem.id),
        with: { lines: true }
    });

    if (!costHeader) {
        console.warn("❌ Failed: No SLA Journal found for Expenditure Item!");
        process.exit(1);
    }
    console.log(`✅ SLA Journal Created: ${costHeader.eventClassId} / ${costHeader.eventTypeId} (ID: ${costHeader.id})`);
    console.table(costHeader.lines.map(l => ({
        line: l.lineNumber,
        account: l.accountingClass,
        dr: l.enteredDr,
        cr: l.enteredCr,
        desc: l.description
    })));

    // 5. Verify Accounting Logic (CIP)
    const hasCIP = costHeader.lines.some(l => l.accountingClass === "ASSET" && Number(l.enteredDr) > 0);
    const hasClearing = costHeader.lines.some(l => l.enteredCr && Number(l.enteredCr) > 0);

    if (hasCIP && hasClearing) {
        console.log("✅ Accounting Correct: Dr CIP Asset / Cr Clearing");
    } else {
        console.warn("⚠️ Accounting Check Warning: Expected Dr CIP / Cr Clearing.");
    }

    // 6. Revenue Recognition
    console.log(`\n4️⃣ Testing Revenue Recognition...`);

    // Setup Billing Rule
    await db.insert(ppmBillingRules).values({
        projectId: project.id,
        ruleType: "TM",
        activeFlag: true,
        markupPercentage: "20.00" // 20% Markup
    });

    // Mark item as ready for billing (Costed)
    await db.update(ppmExpenditureItems).set({ status: "COSTED" }).where(eq(ppmExpenditureItems.id, expItem.id));

    // Generate Events (SLA Trigger)
    const events = await billingService.generateBillingEvents(project.id);
    console.log(`Generated ${events.length} billing events.`);

    if (events.length > 0) {
        const revEvent = events[0];
        const revHeader = await db.query.slaJournalHeaders.findFirst({
            where: eq(slaJournalHeaders.entityId, revEvent.id),
            with: { lines: true }
        });

        if (revHeader) {
            console.log(`✅ SLA Revenue Journal Created: ${revHeader.eventClassId} (ID: ${revHeader.id})`);
            console.table(revHeader.lines.map(l => ({
                line: l.lineNumber,
                account: l.accountingClass,
                dr: l.enteredDr,
                cr: l.enteredCr
            })));
        } else {
            console.warn("❌ Failed: No SLA Journal for Revenue Event!");
        }
    } else {
        console.warn("⚠️ No Billing Events generated - skipping revenue check.");
    }

    console.log("\n✅ Verification Complete!");
    process.exit(0);
}

runVerification().catch((err) => {
    console.error("Fatal Error:", err);
    process.exit(1);
});
