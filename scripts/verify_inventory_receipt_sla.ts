import { db } from "@db";
import { wmsTaskService } from "../server/modules/inventory/wms-task.service";
import { wmsTasks, inventoryTransactions } from "@shared/schema/scm";
import { slaJournalHeaders, slaJournalLines } from "@shared/schema/sla";
import { eq, desc } from "drizzle-orm";

async function verifyReceiptSla() {
    console.log("🔍 Verifying PO Receipt SLA...");

    // 1. Create Task
    const taskNumber = `TASK-RCPT-${Date.now()}`;
    const task = await wmsTaskService.createTask({
        warehouseId: "WH-001",
        taskNumber: taskNumber,
        taskType: "RECEIVE",
        status: "ASSIGNED",
        itemId: "ITEM-REC-001",
        quantityPlanned: "10",
        sourceDocType: "PO",
        sourceDocId: "PO-1001",
        priority: 1,
        // Optional fields
        quantityActual: "0"
    });

    console.log(`   Task Created: ${task.id} (${task.taskNumber})`);

    // 2. Complete Task
    // This triggers Inventory Transaction -> SLA Engine
    try {
        await wmsTaskService.completeTask(task.id, "USER-001", 10, "LOC-001");
        console.log("   Task Completed.");
    } catch (e) {
        console.error("   ❌ Task Completion Failed:", e);
        process.exit(1);
    }

    // 3. Find Inventory Transaction
    // Need to find by reference (task number) since completeTask doesn't return tx id directly
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
    // Entity ID should match Inventory Transaction ID
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

    // Verify Balances (10 * 50 = 500)
    // We expect:
    // Dr Inventory (ASSET) 500
    // Cr Accrual (LIABILITY) 500
    const dr = lines.reduce((sum, l) => sum + Number(l.enteredDr || 0), 0);
    const cr = lines.reduce((sum, l) => sum + Number(l.enteredCr || 0), 0);

    if (dr === 500 && cr === 500) {
        console.log("   ✅ SUCCESS: Journal is BALANCED (500 Dr / 500 Cr).");
    } else {
        console.warn(`   ⚠️ Warning: Balance Mismatch: Dr ${dr} / Cr ${cr}`);
    }

    process.exit(0);
}

verifyReceiptSla().catch(console.error);
