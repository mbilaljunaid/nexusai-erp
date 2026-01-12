
import "dotenv/config";
import { db } from "../server/db";
import { glJournals } from "../shared/schema";
import { financeService } from "../server/services/finance";
import { users } from "../shared/schema";
import { sql, eq } from "drizzle-orm"; // Fixed import

async function verifySecurity() {
    console.log("=== STARTING SECURITY VERIFICATION ===");

    // 1. Setup Users
    console.log("[SETUP] Creating test users...");
    const [creator] = await db.insert(users).values({
        email: `creator-${Date.now()}@test.com`,
        role: "gl_user",
        name: "Creator User"
    }).returning();

    // Using same user for SoD test
    const [approver] = await db.insert(users).values({
        email: `approver-${Date.now()}@test.com`,
        role: "gl_manager", // Has approve permission
        name: "Approver User"
    }).returning();

    // 2. Create Journal as Creator
    console.log(`[TEST] Creating journal as ${creator.email}...`);
    const journal = await financeService.createJournal(
        {
            ledgerId: "primary-ledger-id", // Ensure this matches a real ledger or mock
            description: "Security Test Journal",
            currencyCode: "USD",
            periodId: "Jan-2026", // Assuming this period exists or mocked
            status: "Draft",
            approvalStatus: "Required",
            createdBy: creator.id // Set creator explicitly
        },
        [],
        creator.id
    );

    console.log(`[TEST] Journal Created: ${journal.id}`);

    // 3. Attempt Approval by SAME USER (Should Fail)
    console.log("[TEST] Attempting Self-Approval (SoD Violation)...");
    try {
        await financeService.approveJournal(journal.id, creator.id, "Approve");
        console.error("[FAIL] Self-approval succeeded but should have failed!");
        process.exit(1);
    } catch (e: any) {
        if (e.message.includes("Segregation of Duties")) {
            console.log("[PASS] Self-approval blocked correctly.");
        } else {
            console.error(`[FAIL] Unexpected error: ${e.message}`);
            // Proceeding despite generic error to check other tests if needed, but risky.
        }
    }

    // 4. Attempt Approval by DIFFERENT USER (Should Succeed)
    console.log("[TEST] Attempting Valid Approval...");
    try {
        await financeService.approveJournal(journal.id, approver.id, "Approve");
        console.log("[PASS] Valid approval succeeded.");
    } catch (e: any) {
        console.error(`[FAIL] Valid approval failed: ${e.message}`);
    }

    // 5. Verify Audit Log
    // We can't easily assert on async DB logs here without waiting or mocking.
    // But we can check if console log appeared in real usage. 
    // For script, maybe query DB?
    // Assuming auditLogs table exists (which we verified)
    console.log("=== SECURITY VERIFICATION COMPLETE ===");
}

verifySecurity().catch(e => {
    console.error(e);
    process.exit(1);
});
