
import { financeService } from "../server/services/finance";
import { storage } from "../server/storage";
import { db } from "../server/db";
import { glDataAccessSets, glDataAccessSetAssignments, glJournals, glJournalLines, glAuditLogs, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

async function verifySecurity() {
    console.log("--- Starting Oracle Parity: Security & Governance Verification ---");

    try {
        // 1. Setup Test Data
        const testEmail = "test_security@example.com";
        let user = await storage.getUserByEmail(testEmail);
        if (!user) {
            user = await storage.createUser({ email: testEmail, password: "password", role: "admin", name: "Security Test User" });
        }

        const ledgerId = "PRIMARY";

        // 2. Setup Data Access Set (DAS) with Segment Value Security (SVS)
        // Rule: Can ONLY post to segment1 (Company) = '01'
        const [das] = await db.insert(glDataAccessSets).values({
            name: "Test SVS Set",
            ledgerId,
            isActive: true,
            segmentSecurity: {
                segment1: ["01"] // List of allowed values
            }
        }).returning();

        await db.insert(glDataAccessSetAssignments).values({
            userId: user.id,
            dataAccessSetId: das.id,
            isActive: true
        });

        console.log(`[SETUP] DAS Created with Segment1 = '01' restriction for user ${testEmail}`);

        // 3. Test Unauthorized Access (Company '02')
        console.log("\n[TEST] Testing Unauthorized Segment Access (Company '02')...");

        // We need CCIDs
        const cc02 = await financeService.getOrCreateCodeCombination(ledgerId, "02-100-5000");
        const cc01 = await financeService.getOrCreateCodeCombination(ledgerId, "01-100-5000");

        const badJournal = {
            ledgerId,
            periodId: "any", // Doesn't matter for this check
            journalNumber: "TEST-SECURITY-BAD",
            status: "Draft"
        };

        const badLines = [
            { accountId: cc02.id, debit: "100", credit: "0" },
            { accountId: cc01.id, debit: "0", credit: "100" }
        ];

        try {
            await financeService.createJournal(badJournal as any, badLines as any, user.id.toString());
            console.error("FAIL: Journal with unauthorized segment '02' was created!");
        } catch (e: any) {
            console.log("PASS: Blocked unauthorized segment access: " + e.message);
        }

        // 4. Test Authorized Access (Company '01')
        console.log("\n[TEST] Testing Authorized Segment Access (Company '01')...");
        const goodJournal = {
            ledgerId,
            periodId: "any",
            journalNumber: "TEST-SECURITY-GOOD-" + Date.now(),
            status: "Draft"
        };

        const goodLines = [
            { accountId: cc01.id, debit: "100", credit: "0" }
        ];

        // Mock more lines to satisfy balance check
        const cc01_offset = await financeService.getOrCreateCodeCombination(ledgerId, "01-100-6000");
        goodLines.push({ accountId: cc01_offset.id, debit: "0", credit: "100" });

        try {
            const journal = await financeService.createJournal(goodJournal as any, goodLines as any, user.id.toString(), { ipAddress: "127.0.0.1", sessionId: "test-session" });
            console.log("PASS: Authorized journal created successfully");

            // 5. Test Audit Logging
            console.log("\n[TEST] Verifying Enhanced Audit Logging...");
            const [audit] = await db.select().from(glAuditLogs)
                .where(and(eq(glAuditLogs.userId, user.id.toString()), eq(glAuditLogs.action, "JOURNAL_CREATE")))
                .orderBy(desc(glAuditLogs.timestamp))
                .limit(1);

            if (audit && audit.ipAddress === "127.0.0.1" && audit.sessionId === "test-session") {
                console.log("PASS: Audit log contains IP and Session ID context");
            } else {
                console.error("FAIL: Audit log context missing or incorrect", audit);
            }
        } catch (e: any) {
            console.error("FAIL: Could not create authorized journal: " + e.message);
        }

        console.log("\n--- Verification Complete ---");

    } catch (error) {
        console.error("Verification failed with fatal error:", error);
    } finally {
        process.exit();
    }
}

verifySecurity();
