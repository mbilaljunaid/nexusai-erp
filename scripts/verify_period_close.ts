
import "dotenv/config";
import { financeService } from "../server/services/finance";
import { db } from "../server/db";
import { glPeriods, glJournals, glLedgerControls } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

async function verifyPeriodClose() {
    console.log("Starting Period Close Verification...");
    const ledgerId = "primary-ledger-id";
    const periodName = `CLOSE-TEST-${Date.now()}`;
    const periodId = `period-${Date.now()}`;

    try {
        // 1. Setup: Create a Period
        console.log("Creating Test Period...");
        await db.insert(glPeriods).values({
            id: periodId,
            ledgerId,
            periodName,
            startDate: new Date(),
            endDate: new Date(),
            fiscalYear: 2026,
            status: "Open"
        } as any);

        // 2. Create Unposted Journal (Exception)
        console.log("Creating Unposted Journal...");
        await db.insert(glJournals).values({
            ledgerId,
            periodId,
            journalNumber: `JE-${Date.now()}`,
            currencyCode: "USD",
            status: "Unposted",
            description: "Blocking Journal"
        } as any);

        // 3. Check Status (Should have exception)
        console.log("Checking Initial Status...");
        const status1 = await financeService.getPeriodCloseStatus(ledgerId, periodId);
        console.log("Status 1:", status1);

        if (status1.blockingExceptions === 0) {
            console.error("Failed: Should see blocking exceptions.");
            process.exit(1);
        }


        // 4. Verify Checklist Logic (Template Expansion)
        // Insert a template first manually (since we don't have API for it yet)
        console.log("Creating Checklist Template...");
        await db.execute(sql`
            INSERT INTO gl_period_close_checklist_templates (ledger_id, task_name, description)
            VALUES (${ledgerId}, 'Verify Bank Rec', 'Ensure all banks are reconciled')
        `);

        // Get Status again - should trigger template expansion
        console.log("Checking Status (Trigger Template Expansion)...");
        const status2 = await financeService.getPeriodCloseStatus(ledgerId, periodId);
        console.log("Status 2:", status2);

        if (status2.totalTasks !== 1) {
            console.error("Failed: Should see 1 task from template.");
            process.exit(1);
        }

        // List Tasks
        console.log("Listing Tasks...");
        const tasks = await financeService.listCloseTasks(ledgerId, periodId);
        if (tasks.length !== 1) {
            console.error("Failed: Should list 1 task.");
            process.exit(1);
        }

        // Update Task
        console.log("Updating Task...");
        await financeService.updateCloseTask(tasks[0].id, "COMPLETED", "tester");

        // Final Status
        const status3 = await financeService.getPeriodCloseStatus(ledgerId, periodId);
        console.log("Status 3:", status3);

        if (status3.completedTasks !== 1) {
            console.error("Failed: Task completion not reflected.");
            process.exit(1);
        }

        console.log("Verification Complete!");
        process.exit(0);

    } catch (e: any) {
        console.error("Verification Error:", e);
        process.exit(1);
    }
}

verifyPeriodClose();
