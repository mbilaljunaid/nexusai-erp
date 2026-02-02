
import { db } from "../server/db";
import { cases, caseComments } from "../shared/schema";
import { eq } from "drizzle-orm";
import { CaseService } from "../server/services/CaseService";

async function verifyServiceCloud() {
    console.log("🚀 Starting verification for Service Cloud (Phase 25)...");

    let caseId: string = "";

    try {
        // 1. Create Case
        const newCase = await CaseService.createCase({
            subject: "Verify Ticketing System",
            description: "Test description for verification script.",
            priority: "High",
            origin: "Script",
        }, "verify-user");
        caseId = newCase.id;
        console.log(`✅ Created Case: ${caseId}`);

        // 2. Add Comment
        await CaseService.addComment(caseId, "This is a test comment by agent.", "verify-agent", true);
        console.log("✅ Added Comment");

        // 3. Update Status
        await CaseService.updateCase(caseId, { status: "Open" });
        console.log("✅ Updated Status to Open");

        // 4. Verify Fetch
        const details = await CaseService.getCaseDetails(caseId);

        console.log("Case Details:", {
            id: details.case.id,
            status: details.case.status,
            commentsCount: details.comments.length
        });

        if (details.case.status !== "Open") throw new Error("Status update failed");
        if (details.comments.length !== 1) throw new Error("Comment persistence failed");
        if (details.comments[0].body !== "This is a test comment by agent.") throw new Error("Comment content mismatch");

        console.log("✅ Case & Comment Verified!");

        // Cleanup
        console.log("\n--- Cleanup ---");
        await db.delete(caseComments).where(eq(caseComments.caseId, caseId));
        await db.delete(cases).where(eq(cases.id, caseId));
        console.log("✅ Cleanup complete");

        process.exit(0);

    } catch (error) {
        console.error("\n❌ Verification FAILED:", error);
        try {
            if (caseId) {
                await db.delete(caseComments).where(eq(caseComments.caseId, caseId));
                await db.delete(cases).where(eq(cases.id, caseId));
            }
        } catch (e) { }
        process.exit(1);
    }
}

verifyServiceCloud();
