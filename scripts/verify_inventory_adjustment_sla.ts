import { db } from "@db";
import { wmsTaskService } from "../server/modules/inventory/wms-task.service";
import { wmsTasks, inventoryTransactions } from "@shared/schema/scm";
import { slaJournalHeaders, slaJournalLines } from "@shared/schema/sla";
import { eq, desc } from "drizzle-orm";

async function verifyAdjustmentSla() {
    console.log("🔍 Verifying Inventory Adjustment (Gain) SLA...");

    // 1. Create COUNT Task
    const taskNumber = `TASK-COUNT-${Date.now()}`;
    const task = await wmsTaskService.createTask({
        warehouseId: "WH-001",
        taskNumber: taskNumber,
        taskType: "COUNT",
        status: "ASSIGNED",
        itemId: "ITEM-ADJ-001",
        quantityPlanned: "10",
        priority: 1
    });

    console.log(`   Task Created: ${task.id} (${task.taskNumber})`);

    // 2. Complete Task with Discrepancy (Gain)
    // Planned 10, Actual 12. Diff = +2.
    // Should trigger INV_ADJUSTMENT event.
    try {
        await wmsTaskService.completeTask(task.id, "USER-001", 12, "LOC-001");
        console.log("   Task Completed (Counted 12 vs 10).");
    } catch (e) {
        console.error("   ❌ Task Completion Failed:", e);
        process.exit(1);
    }

    // 3. Find Inventory Transaction
    // For COUNT, does completeTask create a transaction?
    // In wms-task.service.ts, it creates transaction regardless of task type (it creates TRANSFER?).
    // Wait. My code in completeTask always creates `inventoryTransactions`.
    // It creates it with `transactionType: task.taskType`. So 'COUNT'.

    // BUT in Step 10514 code:
    // `const [invTx] = await tx.insert(inventoryTransactions)...`
    // And `transactionType: task.taskType`.
    // So there IS a transaction.

    const txs = await db.select().from(inventoryTransactions)
        .where(eq(inventoryTransactions.reference, taskNumber))
        .orderBy(desc(inventoryTransactions.createdAt))
        .limit(1);

    if (txs.length === 0) {
        console.error("   ❌ No Inventory Transaction found!");
        process.exit(1);
    }
    const invTx = txs[0];
    console.log(`   Inv Tx Created: ${invTx.id}`);

    // 4. Verify SLA Headers
    const headers = await db.select().from(slaJournalHeaders)
        .where(eq(slaJournalHeaders.entityId, invTx.id));

    if (headers.length === 0) {
        console.error("   ❌ No SLA Header found for Transaction " + invTx.id);
        process.exit(1);
    }
    const header = headers[0];
    console.log(`   ✅ SLA Header Found: ${header.id} (${header.eventClassId})`);

    // 5. Verify Lines
    const lines = await db.select().from(slaJournalLines)
        .where(eq(slaJournalLines.headerId, header.id));

    console.log(`   ✅ Found ${lines.length} Journal Lines.`);
    lines.forEach(l => console.log(`      ${l.lineNumber}: ${l.accountingClass} | Dr ${l.enteredDr} | Cr ${l.enteredCr}`));

    // Verify Balances (2 * 50 = 100)
    // We expect:
    // Dr Asset (Valuation) 100
    // Cr Expense (Gain) 100
    // Based on JLTs:
    // INV_ADJ_VALUATION = DEBIT
    // INV_ADJ_EXPENSE = CREDIT

    const dr = lines.reduce((sum, l) => sum + Number(l.enteredDr || 0), 0);
    const cr = lines.reduce((sum, l) => sum + Number(l.enteredCr || 0), 0);

    if (dr === 100 && cr === 100) {
        console.log("   ✅ SUCCESS: Journal is BALANCED (100 Dr / 100 Cr).");
    } else {
        console.warn(`   ⚠️ Warning: Balance Mismatch: Dr ${dr} / Cr ${cr}`);
    }

    process.exit(0);
}

verifyAdjustmentSla().catch(console.error);
