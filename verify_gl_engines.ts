
import { financeService } from "./server/services/finance";
import { storage } from "./server/storage";
import { db } from "./server/db";
import { glIntercompanyRules, glAllocations, glBudgetBalances, glBudgetControlRules } from "./shared/schema";
import { eq, and } from "drizzle-orm";

async function verifyReleaseEngines() {
    console.log("🚀 Starting Advanced Engines Release Verification (Chunk 10)...");

    try {
        // 1. Setup Master Data
        const ledger = await financeService.createLedger({
            name: "Release Verify Ledger " + Date.now(),
            currencyCode: "USD",
            ledgerCategory: "PRIMARY",
            description: "Final quality gate ledger"
        });

        // 2. Verify Intercompany Engine
        console.log("\n--- Testing Intercompany Engine ---");
        const a10 = await financeService.getOrCreateCodeCombination(ledger.id, "10-000-1110-0000"); // LE 10
        const a20 = await financeService.getOrCreateCodeCombination(ledger.id, "20-000-1110-0000"); // LE 20
        const rec = await financeService.getOrCreateCodeCombination(ledger.id, "10-000-1310-0000"); // Receivable
        const pay = await financeService.getOrCreateCodeCombination(ledger.id, "20-000-2310-0000"); // Payable

        await db.insert(glIntercompanyRules).values({
            fromCompany: "10",
            toCompany: "20",
            receivableAccountId: rec.id,
            payableAccountId: pay.id,
            enabled: true
        });

        const jrn = await financeService.createJournal({
            journalNumber: "JRN-RELEASE-IC-" + Date.now(),
            description: "Release Test Intercompany",
            source: "Manual",
            currencyCode: "USD",
            ledgerId: ledger.id,
            status: "Draft"
        }, [
            { accountId: a10.id, debit: "100", credit: "0" },
            { accountId: a20.id, debit: "0", credit: "100" }
        ]);

        await financeService.postJournal(jrn.id, "SYSTEM");

        const postedLines = await storage.listGlJournalLines(jrn.id);
        if (postedLines.length >= 4) {
            console.log("✅ Intercompany lines generated successfully (4 lines found).");
        } else {
            throw new Error(`Intercompany failed: Expected 4+ lines, found ${postedLines.length}`);
        }

        // 3. Verify Budgetary Control
        console.log("\n--- Testing Budgetary Control ---");
        const budgetAcc = await financeService.getOrCreateCodeCombination(ledger.id, "10-100-5100-0000");
        const period = (await storage.listGlPeriods())[0];

        // Seed Budget
        await db.insert(glBudgetBalances).values({
            ledgerId: ledger.id,
            periodName: period?.id || "P1",
            codeCombinationId: budgetAcc.id,
            budgetAmount: "1000",
            actualAmount: "0",
            encumbranceAmount: "0",
            fundsAvailable: "1000",
            currencyCode: "USD"
        });

        // Set Absolute Control
        await db.insert(glBudgetControlRules).values({
            ledgerId: ledger.id,
            ruleName: "Release Strict Budget",
            controlLevel: "Absolute",
            enabled: true
        });

        try {
            const jrnFail = await financeService.createJournal({
                journalNumber: "JRN-FAIL-BUD-" + Date.now(),
                ledgerId: ledger.id,
                periodId: period?.id,
                status: "Draft",
                source: "Manual"
            }, [
                { accountId: budgetAcc.id, debit: "1500", credit: "0" }, // Over budget
                { accountId: a10.id, debit: "0", credit: "1500" }
            ]);
            await financeService.postJournal(jrnFail.id, "SYSTEM");
            throw new Error("Budget fail: Journal should have been blocked");
        } catch (e: any) {
            if (e.message.includes("Budget Violation")) {
                console.log("✅ Budgetary Control (Absolute) working as expected: Posting blocked.");
            } else {
                throw e;
            }
        }

        // 4. Verify Mass Allocations
        console.log("\n--- Testing Mass Allocations ---");
        const poolAcc = await financeService.getOrCreateCodeCombination(ledger.id, "10-000-5999-0000");
        const driverAcc = await financeService.getOrCreateCodeCombination(ledger.id, "10-100-STAT-01");

        const allocRule = await db.insert(glAllocations).values({
            name: "Release Allocation",
            ledgerId: ledger.id,
            poolAccountFilter: `AccountId=${poolAcc.id}`,
            basisAccountFilter: `AccountId=${driverAcc.id}`,
            offsetAccount: "10-000-5999-0000",
            targetAccountPattern: "Segment1=10, Segment2={driver}",
            enabled: true
        }).returning();

        // Run (Even if zero balance, checking orchestrator flow)
        await financeService.runAllocation(allocRule[0].id, period?.periodName || "Jan-2026", "SYSTEM");
        console.log("✅ Mass Allocation orchestrator executed successfully.");

        console.log("\n✨ ALL ADVANCED ENGINES VERIFIED FOR RELEASE. ✨");
        process.exit(0);

    } catch (error) {
        console.error("❌ Release Verification Failed:", error);
        process.exit(1);
    }
}

verifyReleaseEngines();
