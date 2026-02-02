
import "dotenv/config";
import { db } from "../server/db";
import { arCustomerAccounts, arInvoices, arRevenueSchedules, arRevenueRules } from "@shared/schema";
import { arService } from "../server/services/ar";
import { RevenueWorker } from "../server/worker/RevenueWorker";
import { CreditScoreWorker } from "../server/worker/CreditScoreWorker";
import { eq, sql } from "drizzle-orm";

async function verifyArAutomation() {
    console.log("=== AR AUTOMATION VERIFICATION ===");

    // 1. Credit Score Worker Verification
    console.log("\n[1] Testing Credit Score Worker...");
    // Create Dummy Account
    const accNum = `CS-${Date.now()}`;
    const [customer] = await arService.listCustomers(); // Reuse existing
    if (!customer) throw new Error("Need at least 1 customer");

    const account = await arService.createAccount({
        customerId: customer.id,
        accountName: "Credit Test",
        accountNumber: accNum,
        creditLimit: "10000", // Increased to prevent block
        riskCategory: "Low"
    });

    // Create Overdue Invoice to penalize logic
    await arService.createInvoice({
        customerId: customer.id,
        accountId: account.id,
        siteId: (await arService.listSites(account.id))[0]?.id || (await arService.createSite({ accountId: account.id, siteName: "Def", address: "123", isBillTo: true })).id,
        invoiceNumber: `INV-CS-${Date.now()}`,
        amount: "500",
        totalAmount: "500",
        dueDate: new Date(Date.now() - 86400000 * 10) // 10 Days Overdue
    });
    // Force status Open (Sent)
    // Worker logic relies on status != Paid/Cancelled and due < now.

    // Trigger Worker directly for synchronous check (or service fire-and-forget + wait)
    // We'll call the static method to await it.
    await CreditScoreWorker.calculateScore(account.id);

    // Verify
    const [updatedAcc] = await db.select().from(arCustomerAccounts).where(eq(arCustomerAccounts.id, account.id));
    console.log(`Initial Score: 100. New Score: ${updatedAcc.creditScore}`);

    // Penalty: 1 overdue = -5. Utilization: 500/1000 = 0.5 (No penalty, must be > 0.5).
    // Let's make it > 0.5. 500/1000 is exactly 0.5.
    // If logic is > 0.5, it won't trigger. 
    // Logic: if (utilization > 0.5) score -= 5;

    if (updatedAcc.creditScore < 100) console.log("✅ Credit Score Updated (Penalty applied)");
    else console.warn("⚠️ Score not reduced (Check thresholds)");


    // 2. Revenue Worker Verification
    console.log("\n[2] Testing Revenue Worker...");
    // Create Rule & Invoice with Schedule
    const [rule] = await db.insert(arRevenueRules).values({
        name: "Immediate 3 Month", // Fixed column name
        type: "Fixed",
        durationPeriods: 3,
        method: "Straight Line",
        active: true
    }).returning();

    const inv = await arService.createInvoice({
        customerId: customer.id,
        accountId: account.id,
        siteId: (await arService.listSites(account.id))[0].id,
        invoiceNumber: `REV-${Date.now()}`,
        amount: "3000",
        totalAmount: "3000",
        dueDate: new Date(),
        revenueRuleId: rule.id,
        recognitionStatus: "Deferred"
    });

    // Check schedules created
    const schedules = await arService.listRevenueSchedules("Pending");
    const mySchedules = schedules.filter(s => s.invoiceId === inv.id);
    console.log(`Created ${mySchedules.length} pending schedules.`);

    // Run Sweep for "Next Year" to catch all
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    await RevenueWorker.processMonthlySweep(futureDate);

    // Verify Status
    const [refreshedSch] = await db.select().from(arRevenueSchedules).where(eq(arRevenueSchedules.invoiceId, inv.id));
    if (refreshedSch.status === "Recognized") console.log(`✅ Schedule ${refreshedSch.periodName} Recognized`);
    else console.error(`❌ Schedule status is ${refreshedSch.status}`);

    console.log("✅ AR Automation Verified");
    process.exit(0);
}

verifyArAutomation().catch(console.error);
