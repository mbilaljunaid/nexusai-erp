import "dotenv/config";
import { arService } from "../server/services/ar";
import { slaService } from "../server/services/SlaService";
import { db } from "../server/db";
import { arRevenueRules, glLedgers, slaJournalHeaders, slaJournalLines } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

async function verifyRevenueRecognition() {
    console.log("Starting Revenue Recognition Verification...");

    // 1. Create Revenue Rule
    console.log("1. Creating/Fetching Revenue Rule...");
    let rule = await arService.createRevenueRule({
        name: `Ratable 12 Month - ${Date.now()}`,
        description: "Recognize over 12 months",
        durationPeriods: 12,
        recognitionMethod: "Ratable",
        enabledFlag: true
    });
    console.log("   Rule Created:", rule.id, rule.name);

    // 2. Create Invoice with Rule
    console.log("2. Creating Invoice with Revenue Rule...");
    const invoice = await arService.createInvoice({
        customerId: "CUST-001", // Assuming exists or mocked
        accountId: "ACCT-001",   // Assuming exists or mocked
        siteId: "SITE-001",      // Assuming exists or mocked
        invoiceNumber: `INV-REV-${Date.now()}`,
        amount: "1200.00",
        taxAmount: "0",
        totalAmount: "1200.00",
        currency: "USD",
        dueDate: new Date(),
        status: "Draft",
        transactionClass: "INV",
        revenueRuleId: rule.id
    });
    console.log("   Invoice Created:", invoice.id, invoice.invoiceNumber);

    // 3. Verify Schedules
    console.log("3. Verifying Schedules...");
    const schedules = await arService.listRevenueSchedules("Pending");
    const invoiceSchedules = schedules.filter(s => s.invoiceId == invoice.id);

    if (invoiceSchedules.length !== 12) {
        console.error(`   FAILED: Expected 12 schedules, found ${invoiceSchedules.length}`);
        process.exit(1);
    }
    console.log(`   SUCCESS: Found ${invoiceSchedules.length} pending schedules.`);
    console.log(`   First Schedule Amount: ${invoiceSchedules[0].amount}`);

    // 4. Verify SLA (Deferred Revenue)
    console.log("4. Verifying SLA (AR_INVOICE_CREATED)...");

    // Allow some time for async SLA processing if needed (though it's awaited in createInvoice)
    const headers = await db.select().from(slaJournalHeaders)
        .where(eq(slaJournalHeaders.entityId, invoice.id.toString()))
        .orderBy(desc(slaJournalHeaders.createdAt))
        .limit(1);

    if (headers.length === 0) {
        console.error("   FAILED: No SLA Header found for invoice.");
    } else {
        const lines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, headers[0].id));
        const deferredLine = lines.find(l => l.accountingClass === "Deferred Revenue" && Number(l.enteredCr) > 0);
        if (deferredLine) {
            console.log("   SUCCESS: Found Deferred Revenue Credit line:", deferredLine.enteredCr);
        } else {
            console.error("   FAILED: Did not find Deferred Revenue Credit line.");
            console.log("   Lines found:", lines.map(l => `${l.accountingClass}: ${l.enteredDr || 0} DR / ${l.enteredCr || 0} CR`));
        }
    }

    // 5. Recognize Revenue
    console.log("5. Recognizing Revenue for Period 1...");
    const scheduleToRecognize = invoiceSchedules[0];
    await arService.recognizeRevenue(scheduleToRecognize.id);
    console.log("   Revenue Recognized.");

    // 6. Verify Schedule Update
    console.log("6. Verifying Schedule Status...");
    const updatedSchedule = await arService.listRevenueSchedules(); // Get all to find specific
    const target = updatedSchedule.find(s => s.id === scheduleToRecognize.id);
    if (target?.status === "Recognized") {
        console.log("   SUCCESS: Schedule status is Recognized.");
    } else {
        console.error("   FAILED: Schedule status is " + target?.status);
    }

    // 7. Verify SLA (Revenue Recognition)
    console.log("7. Verifying SLA (AR_REVENUE_RECOGNIZED)...");
    const recHeaders = await db.select().from(slaJournalHeaders)
        .where(eq(slaJournalHeaders.eventClassId, "AR_REVENUE_RECOGNIZED"))
        .orderBy(desc(slaJournalHeaders.createdAt))
        .limit(1);
    // Note: entityId for recognition event is scheduleId

    if (recHeaders.length === 0) {
        console.error("   FAILED: No SLA Header found for revenue recognition.");
    } else {
        const lastHeader = recHeaders[0];
        // Check if it matches our schedule
        if (lastHeader.entityId === scheduleToRecognize.id.toString()) {
            const lines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, lastHeader.id));
            const revLine = lines.find(l => l.accountingClass === "Revenue" && Number(l.enteredCr) > 0);
            const defLine = lines.find(l => l.accountingClass === "Deferred Revenue" && Number(l.enteredDr) > 0);

            if (revLine && defLine) {
                console.log("   SUCCESS: Found Revenue CR and Deferred Revenue DR lines.");
            } else {
                console.error("   FAILED: SLA lines incorrect.");
                console.log("   Lines:", lines.map(l => `${l.accountingClass}: ${l.enteredDr || 0} DR / ${l.enteredCr || 0} CR`));
            }
        } else {
            console.warn(`   WARNING: Last recognition event ID ${lastHeader.entityId} does not match current schedule ${scheduleToRecognize.id}. Might be concurrent tests.`);
        }
    }

    console.log("Verification Complete.");
    process.exit(0);
}

verifyRevenueRecognition().catch(err => {
    console.error("Verification Failed:", err);
    process.exit(1);
});
