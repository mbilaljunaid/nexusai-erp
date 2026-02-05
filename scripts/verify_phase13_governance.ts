
import "dotenv/config";
import { auditService } from "../server/services/AuditService";
import { mdmChangeRequests } from "../shared/schema/governance";

async function verifyPhase13() {
    console.log("Starting MDM Phase 13 (Governance) Verification...");

    try {
        // [1] Test Audit Logging
        console.log("\n[1] Testing Audit Log...");
        const testEntityId = "test-verification-id";
        await auditService.logChange({
            entityType: "TEST",
            entityId: testEntityId,
            action: "CREATE",
            changedBy: "VERIFIER",
            changes: { field: "value" }
        });
        const logs = await auditService.getAuditLogs("TEST", testEntityId);
        if (logs.length === 0) throw new Error("Audit log not written.");
        console.log("   ✅ Audit Log entry created and retrieved.");

        // [2] Test Change Request Workflow
        console.log("\n[2] Testing Change Request Workflow...");

        // A. Propose Change
        const newReq = await auditService.createChangeRequest({
            entityType: "TEST_ENTITY",
            requestType: "UPDATE_RECORD",
            proposedChanges: { name: "New Name Proposed" },
            requesterId: "USER_A"
        });
        console.log(`   ✅ Change Request Created: ${newReq.id} (Status: ${newReq.status})`);

        // B. Query Pending
        const pending = await auditService.getPendingRequests();
        const found = pending.find(p => p.id === newReq.id);
        if (!found) throw new Error("Newly created request not found in pending list.");
        console.log("   ✅ Request found in Pending Queue.");

        // C. Approve
        const approved = await auditService.updateRequestStatus(newReq.id, "APPROVED");
        if (approved.status !== "APPROVED") throw new Error("Status update failed.");
        console.log("   ✅ Request Approved.");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }

    console.log("\n--- Verification SUCCESS ---");
    process.exit(0);
}

verifyPhase13();
