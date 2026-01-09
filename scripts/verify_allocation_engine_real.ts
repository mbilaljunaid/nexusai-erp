
import { db } from "../server/db";
import { glCodeCombinations, glLedgers, glPeriods } from "../shared/schema";
import { eq } from "drizzle-orm";

const BASE_URL = "http://localhost:5001";

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
    console.log("Starting Real Allocation Engine Verification...");

    try {
        // 1. Login
        const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "admin@nexusaifirst.cloud", password: "Admin@2025!" })
        });
        if (!loginRes.ok) throw new Error("Login Failed");
        const cookieStream = loginRes.headers.get("set-cookie") || "";
        console.log("✅ Logged in successfully");

        const headers = { "Content-Type": "application/json", "Cookie": cookieStream };

        const ledgerId = "primary-ledger-001";
        const periodName = "Jan-2026";

        // Find Period ID
        const [period] = await db.select().from(glPeriods).where(eq(glPeriods.periodName, periodName));
        if (!period) throw new Error(`Period ${periodName} not found in DB`);
        console.log(`✅ Using Period: ${period.periodName} (${period.id})`);

        // 2. Create Allocation Rule
        const allocationRule = {
            name: "Marketing Rent Allocation " + Date.now(),
            description: "Allocates Rent (6000) based on Headcount (HC) per Dept",
            ledgerId: ledgerId,
            poolAccountFilter: "Segment3=6000",
            basisAccountFilter: "Segment3=HC",
            targetAccountPattern: "01-{source}-6000-000",
            offsetAccount: "01-000-6000-000",
            enabled: true
        };

        const createRuleRes = await fetch(`${BASE_URL}/api/finance/gl/allocations`, {
            method: "POST",
            headers,
            body: JSON.stringify(allocationRule)
        });
        if (!createRuleRes.ok) {
            const errText = await createRuleRes.text();
            throw new Error(`Failed to create allocation rule: ${errText}`);
        }
        const rule = await createRuleRes.json();
        console.log("✅ Created Allocation Rule:", rule.id);

        // 3. Seed Balances (via Journals)
        const ccidPool = await getOrCreateCCID(ledgerId, "01-000-6000-000");
        const ccidCash = await getOrCreateCCID(ledgerId, "01-000-1000-000");
        const ccidHC100 = await getOrCreateCCID(ledgerId, "01-100-HC-000");
        const ccidHC200 = await getOrCreateCCID(ledgerId, "01-200-HC-000");
        const ccidHCOffset = await getOrCreateCCID(ledgerId, "01-000-HC_OFFSET-000");

        // Journal 1: Pool (Rent Expense) - $10,000
        const journalPool = {
            journal: {
                journalNumber: "J-POOL-" + Date.now(),
                description: "Seed Rent Pool",
                periodId: period.id,
                ledgerId: ledgerId,
                currencyCode: "USD",
                status: "Draft"
            },
            lines: [
                { accountId: ccidPool, debit: "10000", credit: "0", description: "Rent Payment" },
                { accountId: ccidCash, debit: "0", credit: "10000", description: "Cash Out" }
            ]
        };

        // Journal 2: Basis (Headcount) - 20 vs 80
        const journalBasis = {
            journal: {
                journalNumber: "J-BASIS-" + Date.now(),
                description: "Seed Headcount Basis",
                periodId: period.id,
                ledgerId: ledgerId,
                currencyCode: "USD",
                status: "Draft"
            },
            lines: [
                { accountId: ccidHC100, debit: "20", credit: "0", description: "Dept 100 HC" },
                { accountId: ccidHC200, debit: "80", credit: "0", description: "Dept 200 HC" },
                { accountId: ccidHCOffset, debit: "0", credit: "100", description: "Total HC Offset" }
            ]
        };

        for (const jData of [journalPool, journalBasis]) {
            const res = await fetch(`${BASE_URL}/api/finance/gl/journals`, {
                method: "POST",
                headers,
                body: JSON.stringify(jData)
            });
            if (!res.ok) throw new Error(`Failed to create seeding journal: ${await res.text()}`);
            const journal = await res.json();

            // Post Journal
            const postRes = await fetch(`${BASE_URL}/api/finance/gl/journals/${journal.id}/post`, { method: "POST", headers });
            if (!postRes.ok) throw new Error("Failed to trigger posting");
            console.log(`✅ Seeded and triggered posting for journal: ${journal.journalNumber}`);
        }

        // Wait for posting background job (it has a 3s delay simulated)
        console.log("⏳ Waiting for balance cube to update (6s)...");
        await new Promise(r => setTimeout(r, 7000));

        // 4. Run Allocation
        console.log("🚀 Running Allocation Calculation...");
        const runRes = await fetch(`${BASE_URL}/api/finance/gl/allocations/${rule.id}/run`, {
            method: "POST",
            headers,
            body: JSON.stringify({ periodName })
        });
        const runResult = await runRes.json();
        if (!runRes.ok) throw new Error(`Allocation Run Failed: ${JSON.stringify(runResult)}`);

        console.log("✅ Allocation Result Success:", runResult.success, "Journal ID:", runResult.journalId);

        // 5. Verify Generated Journal Lines
        const linesRes = await fetch(`${BASE_URL}/api/finance/gl/journals/${runResult.journalId}/lines`, { headers });
        const lines = await linesRes.json();

        console.log(`✅ Generated Allocation Journal has ${lines.length} lines`);

        // Expected lines:
        // Debit Dept 100: 20% of 10000 = 2000
        // Debit Dept 200: 80% of 10000 = 8000
        // Credit Offset: 10000

        // We'll join with CCIDs to check the segments in the generated lines
        const ccids = await db.select().from(glCodeCombinations);
        const ccMap = new Map(ccids.map(c => [c.id, c.code]));

        for (const line of lines) {
            const code = ccMap.get(line.accountId);
            console.log(`   - Line: ${code} | Dr: ${line.debit} | Cr: ${line.credit}`);
        }

        const debit100 = lines.find((l: any) => ccMap.get(l.accountId) === "01-100-6000-000" && Number(l.debit) === 2000);
        const debit200 = lines.find((l: any) => ccMap.get(l.accountId) === "01-200-6000-000" && Number(l.debit) === 8000);
        const creditOffset = lines.find((l: any) => ccMap.get(l.accountId) === "01-000-6000-000" && Number(l.credit) === 10000);

        if (debit100) console.log("   ✅ Dept 100 Allocation correct: 2000");
        else throw new Error("Dept 100 Allocation (01-100-6000-000) incorrect or missing");

        if (debit200) console.log("   ✅ Dept 200 Allocation correct: 8000");
        else throw new Error("Dept 200 Allocation (01-200-6000-000) incorrect or missing");

        if (creditOffset) console.log("   ✅ Offset credit correct: 10000");
        else throw new Error("Offset credit (01-000-6000-000) incorrect or missing");

        console.log("🎉 REAL ALLOCATION ENGINE VERIFIED SUCCESSFULLY!");
        process.exit(0);

    } catch (error: any) {
        console.error("❌ Allocation Verification Failed:", error.message);
        process.exit(1);
    }
}

verifyAllocationEngine();
