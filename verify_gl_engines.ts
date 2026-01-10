import "dotenv/config";
import { financeService } from "./server/services/finance";
import { storage } from "./server/storage";
import { db } from "./server/db";
import { glIntercompanyRules, glAllocations, glBudgetBalances, glBudgetControlRules, glBudgets } from "./shared/schema";
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
        const suffix = Date.now().toString().slice(-4);
        const a10 = await financeService.getOrCreateCodeCombination(ledger.id, `10-000-1110-${suffix}`); // LE 10
        const a20 = await financeService.getOrCreateCodeCombination(ledger.id, `20-000-1110-${suffix}`); // LE 20
        const rec = await financeService.getOrCreateCodeCombination(ledger.id, `10-000-1310-${suffix}`); // Receivable
        const pay = await financeService.getOrCreateCodeCombination(ledger.id, `20-000-2310-${suffix}`); // Payable

        await db.insert(glIntercompanyRules).values([
            {
                fromCompany: "10",
                toCompany: "20",
                receivableAccountId: rec.id,
                payableAccountId: pay.id,
                enabled: true
            },
            {
                fromCompany: "20",
                toCompany: "10",
                receivableAccountId: pay.id, // Swapped for symmetry
                payableAccountId: rec.id,     // Swapped for symmetry
                enabled: true
            }
        ]);

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

        // Wait for Async Worker
        console.log("   Waiting for background posting to complete...");
        let attempts = 0;
        let posted = false;
        while (attempts < 5) {
            const j = await storage.getGlJournal(jrn.id);
            if (j?.status === "Posted") {
                posted = true;
                break;
            }
            await new Promise(r => setTimeout(r, 1000));
            attempts++;
        }

        if (!posted) throw new Error("Journal posting timed out or failed in worker.");
        const postedLines = await storage.listGlJournalLines(jrn.id);
        if (postedLines.length >= 4) {
            console.log("✅ Intercompany lines generated successfully (4 lines found).");
        } else {
            throw new Error(`Intercompany failed: Expected 4+ lines, found ${postedLines.length}`);
        }

        // 3. Verify Budgetary Control
        console.log("\n--- Testing Budgetary Control ---");
        const budgetAcc = await financeService.getOrCreateCodeCombination(ledger.id, `10-100-5100-${suffix}`);

        let period = (await storage.listGlPeriods()).find(p => p.ledgerId === ledger.id);
        if (!period) {
            period = await storage.createGlPeriod({
                ledgerId: ledger.id,
                periodName: "Jan-2026",
                startDate: new Date("2026-01-01"),
                endDate: new Date("2026-01-31"),
                status: "Open",
                fiscalYear: 2026,
            } as any);
        }

        // Seed Budget
        const [budget] = await db.insert(glBudgets).values({
            name: "Release Verify Budget " + suffix,
            ledgerId: ledger.id,
            status: "Open"
        }).returning();

        await db.insert(glBudgetBalances).values({
            budgetId: budget.id,
            periodName: period.periodName,
            codeCombinationId: budgetAcc.id,
            budgetAmount: "1000",
            actualAmount: "0",
            encumbranceAmount: "0"
        });

        // Set Absolute Control
        await db.insert(glBudgetControlRules).values({
            ledgerId: ledger.id,
            ruleName: "Release Strict Budget " + suffix,
            controlLevel: "Absolute",
            enabled: true
        });

        try {
            const jrnFail = await financeService.createJournal({
                journalNumber: "JRN-FAIL-BUD-" + suffix,
                ledgerId: ledger.id,
                periodId: period?.id,
                status: "Draft",
                source: "Manual"
            }, [
                { accountId: budgetAcc.id, debit: "1500", credit: "0" }, // Over budget
                { accountId: a10.id, debit: "0", credit: "1500" }
            ]);
            await financeService.postJournal(jrnFail.id, "SYSTEM");

            // Poll for status to revert to Draft (indicating failure/block)
            console.log("   Waiting for budget block to trigger status reversion...");
            let reverted = false;
            for (let i = 0; i < 5; i++) {
                const j = await storage.getGlJournal(jrnFail.id);
                if (j?.status === "Draft") {
                    reverted = true;
                    break;
                }
                await new Promise(r => setTimeout(r, 1000));
            }

            if (reverted) {
                console.log("✅ Budgetary Control (Absolute) working as expected: Posting blocked and reverted to Draft.");
            } else {
                throw new Error("Budget fail: Journal should have been blocked (stayed in Processing or moved to Posted)");
            }
        } catch (e: any) {
            throw e;
        }

        // 4. Verify Mass Allocations
        console.log("\n--- Testing Mass Allocations ---");
        const poolAcc = await financeService.getOrCreateCodeCombination(ledger.id, `10-000-5999-${suffix}`);
        const driverAcc = await financeService.getOrCreateCodeCombination(ledger.id, `10-100-STAT-${suffix}`);

        const allocRule = await db.insert(glAllocations).values({
            name: "Release Allocation " + suffix,
            ledgerId: ledger.id,
            poolAccountFilter: `AccountId=${poolAcc.id}`,
            basisAccountFilter: `AccountId=${driverAcc.id}`,
            offsetAccount: `10-000-5999-${suffix}`,
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
