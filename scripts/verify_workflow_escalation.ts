import { approvalEngine } from "../server/workflow/approvalEngine";
import { db } from "../server/db";
import { hrAuditApprovals } from "../shared/schema/hr_audit";
import { hrAssignments, hrPersons } from "../shared/schema/hr_worker";
import { eq, sql } from "drizzle-orm";

async function verifyEscalation() {
    console.log("🚀 Starting Workflow Escalation Verification...");

    const tenantId = "test_tenant_" + Date.now();

    try {
        // 1. Setup Test Data (Person -> Assignment -> Manager Assignment)
        const [emp] = await db.insert(hrPersons).values({
            firstName: "Junior",
            lastName: "Employee",
            email: `j.emp@example.com`,
            tenantId
        }).returning();

        const [mgr] = await db.insert(hrPersons).values({
            firstName: "Senior",
            lastName: "Manager",
            email: `s.mgr@example.com`,
            tenantId
        }).returning();

        const [dir] = await db.insert(hrPersons).values({
            firstName: "Executive",
            lastName: "Director",
            email: `e.dir@example.com`,
            tenantId
        }).returning();

        await db.insert(hrAssignments).values({
            personId: emp.id,
            managerId: mgr.id,
            tenantId,
            jobId: "Developer"
        });

        await db.insert(hrAssignments).values({
            personId: mgr.id,
            managerId: dir.id,
            tenantId,
            jobId: "VP Engineering"
        });

        console.log("✅ Test hierarchy created.");

        // 2. Create a "Stalled" Approval Request
        // We simulate this by inserting directly with an old requestedAt
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 4);

        const requestId = "APR-TEST-" + Date.now();
        await db.insert(hrAuditApprovals).values({
            id: requestId,
            tenantId,
            formId: "TEST_FORM",
            recordId: emp.id,
            requestedBy: emp.id,
            requestedAt: threeDaysAgo,
            approvers: [{ userId: mgr.id, approved: false }]
        });

        console.log("✅ Stalled request created (4 days old).");

        // 3. Trigger Escalation
        const escalated = await approvalEngine.checkAndEscalateApprovals(tenantId, 1); // 1 day threshold
        console.log(`✅ Escalation triggered. Count: ${escalated}`);

        // 4. Verify Results
        const [updatedRequest] = await db.select().from(hrAuditApprovals).where(eq(hrAuditApprovals.id, requestId));
        const approvers = updatedRequest.approvers as any[];

        const hasManager = approvers.some(a => a.userId === dir.id && a.isEscalation);

        if (hasManager) {
            console.log("🎉 SUCCESS: Request escalated to Director correctly!");
        } else {
            console.log("❌ FAILURE: Escalation did not add Director to chain.");
            console.log("Approvers found:", JSON.stringify(approvers));
        }

    } catch (error) {
        console.error("❌ Verification failed:", error);
    } finally {
        process.exit(0);
    }
}

verifyEscalation();
