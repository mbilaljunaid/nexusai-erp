import { approvalEngine } from "../server/workflow/approvalEngine";
import { db } from "../server/db";
import { hrAuditApprovals } from "../shared/schema/hr_audit";
import { eq } from "drizzle-orm";

async function verify() {
    console.log("--- VERIFYING PERSISTENT APPROVAL ENGINE ---");

    const formId = "TEST_FORM";
    const recordId = "REC_001";
    const requestedBy = "USER_ESS";
    const approvers = ["MGR_001", "MGR_002"];

    console.log("1. Creating Approval Request...");
    const request = await approvalEngine.createApprovalRequest(formId, recordId, requestedBy, approvers, 2);
    console.log("   Created:", request.id);

    console.log("2. Checking DB Persistence...");
    const [dbRequest] = await db.select().from(hrAuditApprovals).where(eq(hrAuditApprovals.id, request.id));
    if (!dbRequest) throw new Error("Request not found in DB!");
    console.log("   Found in DB with status:", dbRequest.status);

    console.log("3. Testing Approval 1/2...");
    const step1 = await approvalEngine.approveRequest(request.id, "MGR_001", "Looks good");
    console.log("   Approve 1 result:", step1);

    console.log("4. Testing Approval 2/2...");
    const step2 = await approvalEngine.approveRequest(request.id, "MGR_002", "Confirmed");
    console.log("   Approve 2 result:", step2);

    const finalRequest = await approvalEngine.getApprovalRequest(request.id);
    console.log("5. Final Status:", finalRequest?.status);

    if (finalRequest?.status !== "approved") {
        throw new Error("Expected status 'approved', got " + finalRequest?.status);
    }

    console.log("6. Testing Pending for User...");
    // Create another pending one
    await approvalEngine.createApprovalRequest(formId, "REC_002", requestedBy, ["MGR_001"]);
    const pending = await approvalEngine.getPendingApprovalsForUser("MGR_001");
    console.log("   Pending for MGR_001 count:", pending.length);
    if (pending.length < 1) throw new Error("Should have at least 1 pending request");

    console.log("--- VERIFICATION SUCCESSFUL ---");
}

verify().catch(err => {
    console.error("VERIFICATION FAILED:", err);
    process.exit(1);
});
