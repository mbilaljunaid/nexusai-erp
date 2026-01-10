import 'dotenv/config';
import { financeService } from "../server/services/finance";
import { db } from "../server/db";
import { glLedgers, glJournals, glSegments, glCoaStructures, glCodeCombinations } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const CONCURRENT_REQUESTS = 50; // Simultaneous requests
const TOTAL_JOURNALS = 500;    // Total journals to post
const JOURNAL_BATCH_SIZE = 10; // Post 10 journals per request (if supporting batch) or just iteration count

async function runStressTest() {
    console.log(`Starting POSTING Stress Test: ${TOTAL_JOURNALS} journals, ${CONCURRENT_REQUESTS} concurrency.`);

    // 1. Setup Data: Get a valid ledger and its COA structure
    const [ledger] = await db.select().from(glLedgers).limit(1);
    if (!ledger) {
        console.error("No ledger found. Run seed script first.");
        process.exit(1);
    }
    console.log(`Using Ledger: ${ledger.name} (${ledger.id})`);

    // Fetch COA Structure directly (FinanceService helpers are internal)
    let delimiter = "-";
    if (ledger.coaId) {
        const [structure] = await db.select().from(glCoaStructures).where(eq(glCoaStructures.id, ledger.coaId));
        if (structure) delimiter = structure.delimiter || '-';
    }

    const segments = await db.select().from(glSegments).where(eq(glSegments.coaStructureId, ledger.coaId || "UNKNOWN")).orderBy(glSegments.segmentNumber);

    // Helper to generate a valid account string based on segment count
    const generateAccountString = (val1: string, val2: string) => {
        // Just fill the rest with '000' or similar if needed, or repeat
        // This is a naive generator, assuming simple alphanumeric
        // If segments have value sets, this might still fail if validation is strict.
        // For stress testing, we ideally want to bypass strict value set validation OR ensure we use valid values.
        // Let's assume the seed data has '000' or appropriate defaults, or we just try to fit the shape.

        // BETTER: Fetch valid values from DB for the first few segments?
        // For now, let's just match the segment count.
        return segments.map((s, idx) => {
            if (idx === 0) return val1; // Company
            if (idx === 1) return val2; // Department
            return '000'; // Default others (Account, SubAccount, etc) - risky if '000' not in Value Set
        }).join(delimiter);
    };

    // To be safer, let's blindly try to find a valid code combination to reuse, or use a known pattern.
    // If strict validation is on, random strings will fail.
    // Let's query an existing code combination!
    const [existingCC] = await db.select().from(glCodeCombinations).where(eq(glCodeCombinations.ledgerId, ledger.id)).limit(1);

    let accountId1 = "";
    let accountId2 = "";

    if (existingCC) {
        accountId1 = existingCC.id;
        accountId2 = existingCC.id;
        console.log(`Using existing valid CCID for stress test: ${existingCC.code} (${accountId1})`);
    } else {
        console.warn("No existing CCIDs found. Constructing synthetic '001-002-...' which might verify dynamic creation.");
        // Fallback: We must create them first because createJournal expects IDs
        const validValues = segments.map(() => "000");
        if (validValues.length > 0) validValues[0] = "101";
        const accString = validValues.join(delimiter);

        // Resolve UUID
        try {
            const cc = await financeService.getOrCreateCodeCombination(ledger.id, accString);
            accountId1 = cc.id;
            accountId2 = cc.id;
        } catch (e) {
            console.error("Failed to create prerequisite CCID:", e);
            process.exit(1);
        }
    }

    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;

    // Worker function
    const postWorker = async (id: number) => {
        try {
            const journalHeader = {
                ledgerId: ledger.id,
                source: "Manual",
                category: "Adjustment",
                currencyCode: "USD",
                journalNumber: `STRESS-${id}-${randomUUID().slice(0, 8)}`,
                periodName: "Jan-26",
                effectiveDate: new Date(),
                status: "Posted", // Trigger Auto-Posting
                postedDate: new Date(),
                description: `Stress Test Journal ${id}`,
                balanceType: "A"
            };

            const journalLines = [
                {
                    lineNumber: 1,
                    accountId: accountId1,
                    enteredDebit: "100",
                    enteredCredit: "0",
                    description: "Debit Line"
                },
                {
                    lineNumber: 2,
                    accountId: accountId2, // Same account is fine for stress test balance
                    enteredDebit: "0",
                    enteredCredit: "100",
                    description: "Credit Line"
                }
            ];

            // createJournal(journalData, linesData, userId)
            await financeService.createJournal(journalHeader as any, journalLines as any, "stress-test-user");
            successCount++;
            if (successCount % 50 === 0) process.stdout.write('.');
        } catch (err: any) {
            errorCount++;
            if (errorCount <= 5) { // Log first 5 errors only
                console.error(`[Error on Job ${id}]: ${err.message}`);
            }
        }
    };

    // Execution Loop
    const queue = Array.from({ length: TOTAL_JOURNALS }, (_, i) => i);
    const workers = [];

    // Simple semaphore/worker pool
    async function worker() {
        while (queue.length > 0) {
            const id = queue.pop();
            if (id !== undefined) await postWorker(id);
        }
    }

    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
        workers.push(worker());
    }

    await Promise.all(workers);

    const endTime = Date.now();
    const durationSec = (endTime - startTime) / 1000;
    const throughput = successCount / durationSec;

    console.log("\n\n--- Stress Test Results ---");
    console.log(`Time Taken: ${durationSec.toFixed(2)}s`);
    console.log(`Total Requests: ${TOTAL_JOURNALS}`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Throughput: ${throughput.toFixed(2)} journals/sec`);

    if (errorCount > (TOTAL_JOURNALS * 0.01)) {
        console.error("❌ High Error Rate!");
        process.exit(1);
    } else if (throughput < 10) { // Baseline expectation
        console.warn("⚠️ Low Throughput!");
    } else {
        console.log("✅ Stress Test Passed");
    }
}

runStressTest().catch(console.error);
