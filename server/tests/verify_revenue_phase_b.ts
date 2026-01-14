
import { db } from "../db";
import { revenueService } from "../services/RevenueService";
import {
    revenueIdentificationRules, performanceObligationRules,
    revenueSspBooks, revenueSspLines, revenueContracts, performanceObligations,
    revenueSourceEvents
} from "../../shared/schema"; // Use barrel export
import { eq, and } from "drizzle-orm";

async function verifyPhaseB() {
    console.log("🔍 Verifying Revenue Phase B: Config & Rules...");

    const ledgerId = "L1";
    const itemId = "TEST-ITEM-B1";

    // 0. Seed Configuration
    console.log("Step 0: Seeding Rules & SSP...");

    // Seed POB Rule
    // If ItemType = "Subscription", use "Ratably" over 12 months with custom name
    const [pobRule] = await db.insert(performanceObligationRules).values({
        name: "Subscription Rule",
        attributeName: "sourceSystem", // Using sourceSystem as proxy or itemId
        attributeValue: "CRM_SUB", // Matches event below
        pobName: "Enterprise Subscription (Rule Based)",
        satisfactionMethod: "Ratable",
        defaultDurationMonths: 24 // Override default 12
    }).returning();

    // Seed SSP Book & Line
    const [book] = await db.insert(revenueSspBooks).values({
        name: "FY2026 Test Book",
        effectiveFrom: new Date()
    }).returning();

    await db.insert(revenueSspLines).values({
        bookId: book.id,
        itemId: itemId,
        sspValue: "1200.00" // $100/mo
    });

    console.log("✅ Rules & SSP Seeded.");

    // 1. Process Event
    console.log("Step 1: Processing Source Event...");

    // We expect this event to match the POB Rule (sourceSystem=CRM_SUB)
    // And match the SSP Item ID
    const eventData = {
        sourceSystem: "CRM_SUB",
        sourceId: `ORD-RULE-${Date.now()}`,
        eventType: "Booking",
        customerId: "CUST-RULE-001",
        ledgerId: ledgerId,
        amount: 2400, // Sold for 2400
        currency: "USD",
        eventDate: new Date(),
        itemId: itemId,
        referenceNumber: "REF-B-001"
    };

    const { contractId, pobId } = await revenueService.processSourceEvent(eventData);

    console.log(`✅ Event Processed. Contract: ${contractId}, POB: ${pobId}`);

    // 2. Verify POB Metadata from Rule
    console.log("Step 2: Verifying POB Metadata...");
    const pob = await db.query.performanceObligations.findFirst({
        where: eq(performanceObligations.id, pobId)
    });

    if (!pob) throw new Error("POB not found");

    console.log(`POB Name: ${pob.name} (Expected: Enterprise Subscription (Rule Based))`);
    console.log(`Satisfaciton: ${pob.satisfactionMethod} (Expected: Ratable)`);

    // Duration check: End date should be ~24 months from now
    const expectedEndDate = new Date(eventData.eventDate);
    expectedEndDate.setMonth(expectedEndDate.getMonth() + 24);

    // Allow slight diff
    const timeDiff = Math.abs(new Date(pob.endDate!).getTime() - expectedEndDate.getTime());
    const isDurationCorrect = timeDiff < 86400000; // Within 1 day

    console.log(`Duration verified: ${isDurationCorrect}`);

    if (pob.name !== "Enterprise Subscription (Rule Based)") throw new Error("POB Name Rule Failed");
    if (pob.satisfactionMethod !== "Ratable") throw new Error("Satisfaction Method Rule Failed");


    // 3. Verify SSP Lookup
    console.log("Step 3: Verifying SSP Lookup...");
    console.log(`SSP Price: ${pob.sspPrice} (Expected: 1200.00)`);

    if (parseFloat(pob.sspPrice!) !== 1200) throw new Error("SSP Lookup Failed");

    console.log("🎊 Phase B Verification SUCCESS!");
    process.exit(0);
}

verifyPhaseB().catch(e => {
    console.error("❌ Phase B Failed:", e);
    process.exit(1);
});
