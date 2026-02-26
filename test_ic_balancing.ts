import { db } from './server/db.ts';
import { glIntercompanyRules, glJournals, glJournalLines, glCodeCombinations, glLedgers, glPeriods } from './shared/schema.ts';
import { financeService } from './server/services/finance.ts';
import { eq, and } from 'drizzle-orm';

async function runICBalancingTest() {
    console.log("Starting Automated Intercompany Balancing Test (SLA/BSV level)...");

    // 1. Setup Data: Get Ledgers and Periods
    const ledgers = await db.select().from(glLedgers).limit(1);
    const primaryLedgerId = ledgers.length > 0 ? ledgers[0].id : 1;

    let periods = await db.select().from(glPeriods).where(eq(glPeriods.status, 'Open')).limit(1);
    let periodId = 1;
    let periodName = 'TEST-PERIOD';
    if (!periods.length) {
        console.warn("No OPEN GL period. Creating a mock OPEN period for the ledger.");
        const [newPeriod] = await db.insert(glPeriods).values({
            ledgerId: String(primaryLedgerId),
            periodName: `TEST-${Date.now()}`,
            periodNum: 1,
            fiscalYear: 2026,
            startDate: new Date(),
            endDate: new Date(),
            status: 'Open'
        }).returning();
        periodId = newPeriod.id;
        periodName = newPeriod.periodName;
    } else {
        periodId = periods[0].id;
        periodName = periods[0].periodName;
    }

    // 2. Setup Code Combinations: Base accounts + IC accounts
    const createCC = async (seg1: string, seg2: string, seg3: string) => {
        const code = `${seg1}-${seg2}-${seg3}`;
        const search = await db.select().from(glCodeCombinations).where(eq(glCodeCombinations.code, code));
        if (search.length > 0) return search[0].id;

        const res = await db.insert(glCodeCombinations).values({
            code,
            ledgerId: primaryLedgerId, // Added missing required FK
            segment1: seg1, // LE
            segment2: seg2, // Cost Center
            segment3: seg3, // Account
            accountType: 'EXPENSE',
            enabled: true
        }).returning({ id: glCodeCombinations.id });
        return res[0].id;
    };

    const ccid_100_expense = await createCC('100', '000', '60000');
    // For LE 100: Receivable (Due From 200) and Payable (Due To 200)
    const ccid_100_ic_rec = await createCC('100', '000', '18000');
    const ccid_100_ic_pay = await createCC('100', '000', '28000');

    const ccid_200_liability = await createCC('200', '000', '20000');
    // For LE 200: Receivable (Due From 100) and Payable (Due To 100)
    const ccid_200_ic_rec = await createCC('200', '000', '18000');
    const ccid_200_ic_pay = await createCC('200', '000', '28000');

    // 3. Setup Intercompany Rule (LE 100 <-> LE 200) Bidirectional
    console.log("Configuring Intercompany Rules for Cross-BSV Matching...");
    await db.delete(glIntercompanyRules).where(and(eq(glIntercompanyRules.fromCompany, '100'), eq(glIntercompanyRules.toCompany, '200')));
    await db.delete(glIntercompanyRules).where(and(eq(glIntercompanyRules.fromCompany, '200'), eq(glIntercompanyRules.toCompany, '100')));

    await db.insert(glIntercompanyRules).values([
        {
            fromCompany: '100',
            toCompany: '200',
            receivableAccountId: ccid_100_ic_rec,
            payableAccountId: ccid_100_ic_pay,
            enabled: true
        },
        {
            fromCompany: '200',
            toCompany: '100',
            receivableAccountId: ccid_200_ic_rec,
            payableAccountId: ccid_200_ic_pay,
            enabled: true
        }
    ]);

    // 4. Create Unbalanced BSV Journal
    // Debit 100-000-60000 for 500
    // Credit 200-000-20000 for 500
    const batchName = `IC-BATCH-${Date.now()}`;
    const [journal] = await db.insert(glJournals).values({
        ledgerId: primaryLedgerId,
        journalNumber: batchName,
        source: 'Manual',
        category: 'Intercompany',
        periodId: periodId,
        name: batchName,
        description: 'Testing Automated Auto-Balancing',
        currencyCode: 'USD',
        status: 'Draft',
        enteredDebit: '500.00',
        enteredCredit: '500.00'
    }).returning();

    await db.insert(glJournalLines).values([
        {
            journalId: journal.id,
            lineNumber: 1,
            accountId: ccid_100_expense,
            debit: '500.00',
            accountedDebit: '500.00',
            description: 'Charge to entity 100'
        },
        {
            journalId: journal.id,
            lineNumber: 2,
            accountId: ccid_200_liability,
            credit: '500.00',
            accountedCredit: '500.00',
            description: 'Liability to entity 200'
        }
    ]);

    console.log(`Draft Journal created: ID ${journal.id}`);

    // 5. Invoke Finance Service to Post Journal
    console.log("Invoking financeService.postJournal(id, 'SYSTEM') to evaluate IC BSV balancing algorithms...");
    try {
        await financeService.postJournal(journal.id, 'SYSTEM-TEST');

        // Let BullMQ worker finish processing...
        await new Promise(r => setTimeout(r, 4000));
    } catch (err) {
        console.warn("Post journal sync-call failed:", err.message);
    }

    // 6. Assert Result
    const resultingLines = await db.select().from(glJournalLines).where(eq(glJournalLines.journalId, journal.id));
    console.log(`Journal now has ${resultingLines.length} total distributions.`);

    // We expect:
    // LE 100 needs a Payable (CREDIT) because it has +500 Net (DEBIT) -> target = ccid_100_ic_pay
    // LE 200 needs a Receivable (DEBIT) because it has -500 Net (CREDIT) -> target = ccid_200_ic_rec
    const icRecLine = resultingLines.find(l => l.accountId === ccid_200_ic_rec);
    const icPayLine = resultingLines.find(l => l.accountId === ccid_100_ic_pay);

    if (resultingLines.length === 4 && icRecLine && icPayLine) {
        console.log(`✅ Success: Intercompany Balancing verified.`);
        console.log(`Generated Due From for LE 200 [Receivable Account]: Debit ${icRecLine.accountedDebit}, Credit ${icRecLine.accountedCredit}`);
        console.log(`Generated Due To for LE 100 [Payable Account]: Debit ${icPayLine.accountedDebit}, Credit ${icPayLine.accountedCredit}`);

        // Hard assertions
        if (Number(icRecLine.accountedDebit) !== 500) throw new Error("Due From amount mismatch!");
        if (Number(icPayLine.accountedCredit) !== 500) throw new Error("Due To amount mismatch!");

        console.log("All intercompany segment assertions passed natively 🎉");
    } else {
        console.error("❌ Failed: Journal was not balanced with appropriate IC rules.");
        console.log("Found Lines:");
        console.log(resultingLines.map(l => ({ id: l.accountId, dr: l.accountedDebit, cr: l.accountedCredit })));
        throw new Error("Missing Intercompany distribution lines.");
    }
}

runICBalancingTest().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
