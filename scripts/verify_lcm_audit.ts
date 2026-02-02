
import { db } from "../server/db";
import { lcmTradeOperations, lcmAuditLogs } from "@shared/schema/lcm";
import { eq, desc } from "drizzle-orm";
import { lcmService } from "../server/modules/lcm/lcm.service";

async function verify() {
    console.log("🚀 Starting LCM Phase 6 Verification: Audit & Compliance...");
    try {
        // 1. Create Trade Op (Should trigger CREATE log)
        console.log("1. Creating Trade Operation...");
        const opData = {
            header: {
                operationNumber: `TO-AUDIT-${Date.now()}`,
                name: "Audit Test Op",
                status: "OPEN"
            },
            shipmentLines: []
        };
        const op = await lcmService.createTradeOperationWithLines(opData);
        console.log(`- Created Op: ${op.operationNumber}`);

        // 2. Add Charge (Should trigger ADD_CHARGE log on Op and CREATE log on Charge)
        console.log("2. Adding Charge...");
        const comps = await lcmService.listCostComponents();
        const compId = comps[0]?.id; // Assuming at least one exists from previous phases

        if (compId) {
            await lcmService.addCharge({
                tradeOperationId: op.id,
                costComponentId: compId,
                amount: "500",
                currency: "USD",
                isActual: false
            });
        } else {
            console.warn("No Cost Components found, skipping Charge test.");
        }

        // 3. Close Op (Should trigger CLOSE log)
        console.log("3. Closing Operation...");
        // Need allocations to close without error?
        // Close logic requires allocations to exist? 
        // Our Close logic in Service: 
        // 2. Fetch allocations... 
        // If no allocations, map is empty. 
        // 3. Compute variance... 
        // 4. Update Status.
        // It doesn't strictly throw if no allocations, just does nothing for variance.
        // But `closeTradeOperation` throws "Trade Operation not found" if op missing.
        // It throws if already closed.
        // It does not seem to block if empty.

        await lcmService.closeTradeOperation(op.id);
        console.log("- Closed.");

        // 4. Verify Logs
        console.log("4. Verifying Audit Logs...");
        const logs = await db.select().from(lcmAuditLogs)
            .where(eq(lcmAuditLogs.entityId, op.id))
            .orderBy(desc(lcmAuditLogs.createdAt));

        console.log(`- Found ${logs.length} logs for Op ${op.id}`);
        logs.forEach(l => console.log(`  > [${l.action}] ${l.createdAt}`));

        const hasCreate = logs.some(l => l.action === 'CREATE');
        const hasAddCharge = logs.some(l => l.action === 'ADD_CHARGE');
        const hasClose = logs.some(l => l.action === 'CLOSE');

        if (hasCreate && hasAddCharge && hasClose) {
            console.log("✅ Audit Verification PASSED: All actions logged.");
        } else {
            console.error("❌ Verification Failed: Missing expected logs.");
            console.log("Expected: CREATE, ADD_CHARGE, CLOSE");
            process.exit(1);
        }

    } catch (e) {
        console.error("❌ Verification Failed:", e);
        process.exit(1);
    }
    process.exit(0);
}

verify();
