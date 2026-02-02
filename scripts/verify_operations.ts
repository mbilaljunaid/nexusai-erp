
import { maintenanceService } from "../server/services/MaintenanceService";
import { db } from "../server/db";
import { maintWorkOrders, maintWorkOrderOperations } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyWorkExecution() {
    console.log("🛠️ Verifying Work Execution Engine...");

    try {
        // 1. Setup: Get DRAFT WO from previous step (or create new)
        let woId;
        const existing = await maintenanceService.listWorkOrders();
        if (existing.length > 0) {
            woId = existing[0].id;
            console.log(`Using existing WO: ${existing[0].workOrderNumber} (${existing[0].status})`);
        } else {
            console.error("No WO found. Run foundation verification first.");
            process.exit(1);
        }

        // Reset status to DRAFT if needed for test
        if (existing[0].status !== "DRAFT" && existing[0].status !== "RELEASED") {
            console.log("Resetting WO to DRAFT...");
            await maintenanceService.updateWorkOrderStatus(woId, "DRAFT");
        }

        // 2. Add Operation
        console.log("Adding Operations...");
        const op1 = await maintenanceService.addOperation(woId, {
            sequence: 10,
            description: "Inspect Safety Guards",
            laborHours: 1
        });
        const op2 = await maintenanceService.addOperation(woId, {
            sequence: 20,
            description: "Lubricate Bearings",
            laborHours: 0.5
        });
        console.log(`✅ Added Operations: ${op1[0].sequence}, ${op2[0].sequence}`);

        // 3. Release WO
        const released = await maintenanceService.updateWorkOrderStatus(woId, "RELEASED");
        console.log(`✅ Status -> RELEASED: ${released[0].status}`);

        // 4. Start Work
        const started = await maintenanceService.updateWorkOrderStatus(woId, "IN_PROGRESS");
        console.log(`✅ Status -> IN_PROGRESS: ${started[0].status}`);

        // 5. Try to Complete WO (Should Fail because ops are pending)
        try {
            await maintenanceService.updateWorkOrderStatus(woId, "COMPLETED");
            console.error("❌ Validated Failed: Should have blocked completion.");
            process.exit(1);
        } catch (e: any) {
            console.log(`✅ Validation Passed: Blocked Completion (${e.message})`);
        }

        // 6. Complete Operations
        await maintenanceService.updateOperation(op1[0].id, { status: "COMPLETED" });
        await maintenanceService.updateOperation(op2[0].id, { status: "COMPLETED" });
        console.log("✅ Completed Operations");

        // 7. Complete WO (Should Success)
        const completed = await maintenanceService.updateWorkOrderStatus(woId, "COMPLETED");
        if (completed[0].status === "COMPLETED" && completed[0].actualCompletionDate) {
            console.log(`✅ Status -> COMPLETED: ${completed[0].status} at ${completed[0].actualCompletionDate}`);
        } else {
            console.error("❌ Completion Failed");
            process.exit(1);
        }

    } catch (e) {
        console.error("❌ Verification Failed:", e);
        process.exit(1);
    }
}

verifyWorkExecution()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
