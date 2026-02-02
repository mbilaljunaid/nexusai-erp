
import { db } from "../server/db";
import { allocationsService } from "../server/modules/intercompany/allocations.service";
import { financeService } from "../server/services/finance";
import { icOrgs } from "../shared/schema/intercompany";
import { glCodeCombinations, glLedgers, glPeriods, glJournalLines, glJournals } from "../shared/schema";
import { eq } from "drizzle-orm";

async function getOrCreateCCID(ledgerId: string, code: string) {
    const [existing] = await db.select().from(glCodeCombinations)
        .where(eq(glCodeCombinations.code, code));
    if (existing) return existing.id;

    const segments = code.split("-");
    const [inserted] = await db.insert(glCodeCombinations).values({
        ledgerId,
        code,
        segment1: segments[0],
        segment2: segments[1],
        segment3: segments[2],
        segment4: segments[3],
        segment5: segments[4]
    }).returning();
    return inserted.id;
}

async function verifyAllocationEngine() {
    console.log("Starting Real Allocation Engine Verification (Direct Service)...");

    try {
        const ledgerId = "primary-ledger-001";
        const periodName = "Jan-2026";

        // Find Period ID
        const [period] = await db.select().from(glPeriods).where(eq(glPeriods.periodName, periodName));
        if (!period) throw new Error(`Period ${periodName} not found in DB`);
        console.log(`✅ Using Period: ${period.periodName} (${period.id})`);

        // Ensure ICO-101 Exists for FK
        const [org] = await db.select().from(icOrgs).where(eq(icOrgs.id, "ICO-101"));
        if (!org) {
            console.log("⚠️ ICO-101 missing, creating mock org...");
            await db.insert(icOrgs).values({
                id: "ICO-101",
                orgName: "Mock Global Ops",
                legalEntityId: "LE-101",
                ledgerId: ledgerId,
                companySegment: "101"
            }).onConflictDoNothing();
        }

        // 2. Create Allocation Rule
        const allocationRule = {
            name: "Marketing Rent Allocation " + Date.now(),
            description: "Allocates Rent (6000) based on Headcount (HC) per Dept",
            sourceOrgId: "ICO-101",
            allocationMethod: "PERCENTAGE",
            status: "ACTIVE",
            poolAccountFilter: "Segment3=6000",
            basisAccountFilter: "Segment3=HC",
            targetAccountPattern: "01-{source}-6000-000",
            offsetAccount: "01-000-6000-000",
            lines: []
        };

        const rule = await allocationsService.createRule(allocationRule as any);
        console.log("✅ Created Allocation Rule:", rule.id);

        // 3. Seed Balances (via Journals)
        const ccidPool = await getOrCreateCCID(ledgerId, "01-000-6000-000");
        const ccidCash = await getOrCreateCCID(ledgerId, "01-000-1000-000");
        const ccidHC100 = await getOrCreateCCID(ledgerId, "01-100-HC-000");
        const ccidHC200 = await getOrCreateCCID(ledgerId, "01-200-HC-000");
        const ccidHCOffset = await getOrCreateCCID(ledgerId, "01-000-HC_OFFSET-000");

        // Ensure Target Accounts Exist
        await getOrCreateCCID(ledgerId, "01-100-6000-000");
        await getOrCreateCCID(ledgerId, "01-200-6000-000");

        // Journal 1: Pool (Rent Expense) - $10,000
        const journalPool = await financeService.createJournal({
            journalNumber: "J-POOL-" + Date.now(),
            description: "Seed Rent Pool",
            periodId: period.id,
            ledgerId: ledgerId,
            currencyCode: "USD",
            status: "Posted",
            category: "Manual",
            source: "Manual"
        }, [
            { accountId: ccidPool, enteredDebit: 10000, enteredCredit: 0, description: "Rent Payment" },
            { accountId: ccidCash, enteredDebit: 0, enteredCredit: 10000, description: "Cash Out" }
        ], "system");

        // Journal 2: Basis (Headcount) - 20 vs 80
        const journalBasis = await financeService.createJournal({
            journalNumber: "J-BASIS-" + Date.now(),
            description: "Seed Headcount Basis",
            periodId: period.id,
            ledgerId: ledgerId,
            currencyCode: "USD",
            status: "Posted",
            category: "Statistical",
            source: "Manual"
        }, [
            { accountId: ccidHC100, enteredDebit: 20, enteredCredit: 0, description: "Dept 100 HC" },
            { accountId: ccidHC200, enteredDebit: 80, enteredCredit: 0, description: "Dept 200 HC" },
            { accountId: ccidHCOffset, enteredDebit: 0, enteredCredit: 100, description: "Total HC Offset" }
        ], "system");

        console.log(`✅ Seeded Journals: ${journalPool.id}, ${journalBasis.id}`);

        // WAIT FOR POSTING TO COMPLETE
        console.log("⏳ Waiting for journals to post...");
        const waitForPost = async (id: string) => {
            for (let i = 0; i < 15; i++) { // Increase wait
                const [j] = await db.select().from(glJournals).where(eq(glJournals.id, id));
                if (j.status === 'Posted') return;
                console.log(`Still waiting for ${id}... Status: ${j.status}`);
                await new Promise(r => setTimeout(r, 1000));
            }
            throw new Error(`Journal ${id} failed to post in time.`);
        };
        await waitForPost(journalPool.id);
        await waitForPost(journalBasis.id);
        console.log("✅ All Journals Posted.");

        // 4. Run Allocation (Real)
        console.log("🚀 Running Allocation Calculation (via Service)...");
        // @ts-ignore
        const runResult = await allocationsService.generateAllocationRun(rule.id, periodName);
        console.log("✅ Allocation Result:", runResult);

        if (!runResult.success) {
            throw new Error(`Allocation Failed: ${runResult.message}`);
        }

        // 5. Verify Generated Journal Lines
        const journalId = runResult.journalId;
        const lines = await db.select().from(glJournalLines).where(eq(glJournalLines.journalId, journalId));

        console.log(`✅ Generated Allocation Journal has ${lines.length} lines`);

        const ccids = await db.select().from(glCodeCombinations);
        const ccMap = new Map(ccids.map(c => [c.id, c.code]));

        for (const line of lines) {
            const code = ccMap.get(line.accountId);
            console.log(`   - Line: ${code} | Dr: ${line.enteredDebit} | Cr: ${line.enteredCredit}`);
        }

        const totalPool = Number(runResult.totalAllocated);
        const expected100 = totalPool * 0.2;
        const expected200 = totalPool * 0.8;
        const expectedOffset = totalPool;

        console.log(`   Expected 100: ${expected100}, 200: ${expected200}`);

        const debit100 = lines.find((l: any) => ccMap.get(l.accountId) === "01-100-6000-000" && Math.abs(Number(l.enteredDebit) - expected100) < 1.0);
        const debit200 = lines.find((l: any) => ccMap.get(l.accountId) === "01-200-6000-000" && Math.abs(Number(l.enteredDebit) - expected200) < 1.0);
        const creditOffset = lines.find((l: any) => ccMap.get(l.accountId) === "01-000-6000-000" && Math.abs(Number(l.enteredCredit) - expectedOffset) < 1.0);

        if (debit100) console.log(`   ✅ Dept 100 Allocation correct: ${expected100}`);
        else console.error(`   ❌ Dept 100 Allocation (01-100-6000-000) incorrect. Found: ${lines.find(l => ccMap.get(l.accountId) === "01-100-6000-000")?.enteredDebit}`);

        if (debit200) console.log(`   ✅ Dept 200 Allocation correct: ${expected200}`);
        else console.error(`   ❌ Dept 200 Allocation (01-200-6000-000) incorrect. Found: ${lines.find(l => ccMap.get(l.accountId) === "01-200-6000-000")?.enteredDebit}`);

        if (creditOffset) console.log(`   ✅ Offset credit correct: ${expectedOffset}`);
        else console.error(`   ❌ Offset credit (01-000-6000-000) incorrect.`);

        if (debit100 && debit200 && creditOffset) {
            console.log("🎉 REAL ALLOCATION ENGINE VERIFIED SUCCESSFULLY!");
            process.exit(0);
        } else {
            process.exit(1);
        }

    } catch (error: any) {
        console.error("❌ Allocation Verification Failed:", error.message);
        process.exit(1);
    }
}

verifyAllocationEngine();
