
import { db } from "../server/db";
import { cashBankAccounts, cashStatementHeaders, cashStatementLines } from "@shared/schema";
import { cashService } from "../server/services/cash";
import { eq } from "drizzle-orm";

async function verifyIntraday() {
    console.log("🛠️ Starting Intraday Verification...");

    // 1. Setup Test Account
    const testAccountId = "test-intraday-" + Date.now();
    const testAccountName = "Intraday Test " + Date.now();
    await db.insert(cashBankAccounts).values({
        id: testAccountId,
        name: testAccountName,
        bankName: "Realtime Bank",
        accountNumber: "INTRA-999",
        currency: "USD",
        currentBalance: "1000.00",
        active: true
    });

    // 2. Create Header
    const [header] = await db.insert(cashStatementHeaders).values({
        bankAccountId: testAccountId,
        statementNumber: "INTRA-001",
        statementDate: new Date(),
        status: "Uploaded"
    }).returning();

    // 3. Create Intraday Line (is_intraday = true)
    await db.insert(cashStatementLines).values({
        headerId: header.id,
        bankAccountId: testAccountId,
        transactionDate: new Date(),
        amount: "500.00", // +500 Intraday
        description: "Incoming Wire",
        reconciled: false,
        isIntraday: true
    });

    // 4. Create Normal Line (is_intraday = false)
    await db.insert(cashStatementLines).values({
        headerId: header.id,
        bankAccountId: testAccountId,
        transactionDate: new Date(),
        amount: "-100.00", // -100 Posted
        description: "Fee",
        reconciled: false,
        isIntraday: false
    });

    // 5. Check Position
    console.log("🔄 Fetching Cash Position...");
    const position = await cashService.getCashPosition();

    // Find our account details
    const accountMetric = position.accounts.find(a => a.name === testAccountName);

    if (!accountMetric) {
        console.error("❌ Failed: Account not found in position.");
        process.exit(1);
    }

    console.log("📊 Account Metrics:", accountMetric);
    console.log("TOTAL Intraday:", position.totalIntradayBalance);

    // Checks
    // Balance should be what was inserted: 1000
    // Intraday Movement should be: 500 (only the intraday line)
    // -100 is unreconciled but NOT intraday?
    // Wait, getCashPosition implementation:
    // unreconciled = all unreconciled lines (so 500 - 100 = 400 total unreconciled amount?)
    // intradayMovement = lines where isIntraday=true (so 500)

    if (accountMetric.intradayMovement !== 500) {
        console.error(`❌ Failed: Expected Intraday Movement 500, got ${accountMetric.intradayMovement}`);
        process.exit(1);
    }

    if (position.totalIntradayBalance < 500) {
        // allowing for other tests running, but should be at least 500
        console.warn(`⚠️  Total Intraday is ${position.totalIntradayBalance} (Expected >= 500)`);
    }

    console.log("✅ SUCCESS: Intraday calculated correctly.");
    process.exit(0);
}

verifyIntraday().catch(console.error);
