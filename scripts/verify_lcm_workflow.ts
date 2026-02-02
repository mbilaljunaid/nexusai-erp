
import { db } from "../server/db";
import { lcmTradeOperations } from "@shared/schema/lcm";
import { eq } from "drizzle-orm";
import { lcmService } from "../server/modules/lcm/lcm.service";

async function verify() {
    console.log("🚀 Starting LCM Phase 7 Verification: Enterprise Controls...");
    try {
        // 1. Create Trade Op (Should be DRAFT)
        console.log("1. Creating Trade Operation...");
        const opData = {
            header: {
                operationNumber: `TO-WORKFLOW-${Date.now()}`,
                name: "Workflow Test Op",
                status: "OPEN"
            },
            shipmentLines: []
        };
        const op = await lcmService.createTradeOperationWithLines(opData);
        console.log(`- Created Op: ${op.operationNumber}, Status: ${op.status}, Approval: ${op.approvalStatus}`);

        // 2. Try to Close (Should Fail)
        console.log("2. Attempting Premature Close (Expect Failure)...");
        try {
            await lcmService.closeTradeOperation(op.id);
            console.error("❌ Failed: Should have rejected close on DRAFT/OPEN status.");
            process.exit(1);
        } catch (e: any) {
            console.log(`- Caught Expected Error: ${e.message}`);
        }

        // 3. Submit
        console.log("3. Submitting for Approval...");
        await lcmService.submitForApproval(op.id);
        let updatedOp = await lcmService.getTradeOperationDetails(op.id);
        console.log(`- Status: ${updatedOp?.approvalStatus}`);
        if (updatedOp?.approvalStatus !== 'PENDING_APPROVAL') throw new Error("Status mismatch");

        // 4. Approve
        console.log("4. Approving...");
        await lcmService.approveTradeOperation(op.id, 'TEST_ADMIN');
        updatedOp = await lcmService.getTradeOperationDetails(op.id);
        console.log(`- Status: ${updatedOp?.approvalStatus}, Approved By: ${updatedOp?.approvedBy}`);
        if (updatedOp?.approvalStatus !== 'APPROVED') throw new Error("Status mismatch");

        // 5. Close (Should Succeed)
        console.log("5. Closing Operation...");
        await lcmService.closeTradeOperation(op.id);
        updatedOp = await lcmService.getTradeOperationDetails(op.id);
        console.log(`- Final Status: ${updatedOp?.status}`);

        if (updatedOp?.status === 'CLOSED') {
            console.log("✅ Workflow Verification PASSED.");
        } else {
            console.error("❌ Close failed state check.");
            process.exit(1);
        }

    } catch (e) {
        console.error("❌ Verification Failed:", e);
        process.exit(1);
    }
    process.exit(0);
}

verify();
