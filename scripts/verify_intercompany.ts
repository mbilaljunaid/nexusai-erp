
import 'dotenv/config';
import { FinanceService } from "../server/services/finance";
import { storage } from "../server/storage";
import { db } from "../server/db";
import { glLedgers, glPeriods, glCodeCombinations, glIntercompanyRules, glJournals, glJournalLines } from "../shared/schema/finance";
import { eq, and } from "drizzle-orm";

const finance = new FinanceService();

async function verifyIntercompany() {
    console.log("🚀 Starting Intercompany Balancing Verification...");

    try {
        const periodName = "Jan-2026-IC";
        const ledgerId = "IC-TEST-LEDGER";

        // 1. Setup Ledger
        console.log("1. Setting up Ledger...");
        const [existingLedger] = await db.select().from(glLedgers).where(eq(glLedgers.id, ledgerId));
        if (!existingLedger) {
            await storage.createGlLedger({
                id: ledgerId,
                name: "Intercompany Test Ledger",
                currencyCode: "USD",
                ledgerCategory: "PRIMARY",
                isActive: true
            });
        }

        // 2. Setup Period
        console.log("2. Setting up Period...");
        const [existingPeriod] = await db.select().from(glPeriods).where(eq(glPeriods.periodName, periodName));
        let periodId = existingPeriod?.id;
        if (!existingPeriod) {
            const period = await storage.createGlPeriod({
                periodName,
                fiscalYear: 2026,
                periodNum: 1,
                startDate: new Date("2026-01-01"),
                endDate: new Date("2026-01-31"),
                status: "Open"
            });
            periodId = period.id;
        }

        // 3. Setup Code Combinations
        console.log("3. Setting up Code Combinations for Co 101 and 102...");
        const getOrCreateCC = async (code: string, segments: string[]) => {
            const [existing] = await db.select().from(glCodeCombinations).where(eq(glCodeCombinations.code, code));
            if (existing) return existing;
            return await storage.createGlCodeCombination({
                code,
                segment1: segments[0], segment2: segments[1], segment3: segments[2], segment4: segments[3], segment5: segments[4],
                ledgerId: ledgerId,
                enabled: true
            });
        };

        const cc101 = await getOrCreateCC("101-000-1110-000", ["101", "000", "1110", "000", "000"]);
        const cc102 = await getOrCreateCC("102-000-1110-000", ["102", "000", "1110", "000", "000"]);

        // Intercompany Accounts
        const ccDueFrom102 = await getOrCreateCC("101-000-1200-102", ["101", "000", "1200", "102", "000"]);
        const ccDueTo101 = await getOrCreateCC("102-000-2200-101", ["102", "000", "2200", "101", "000"]);

        // 4. Setup Intercompany Rule
        console.log("4. Setting up Intercompany Rule (101 <-> 102)...");
        await db.delete(glIntercompanyRules).where(and(eq(glIntercompanyRules.fromCompany, "101"), eq(glIntercompanyRules.toCompany, "102")));
        await storage.createIntercompanyRule({
            fromCompany: "101",
            toCompany: "102",
            receivableAccountId: ccDueFrom102.id, // Due from 101 (Asset for 102) - Wait, logic in resolveImbalances is:
            // Debtor (Co101 needs Credit) -> rule.payableAccountId (Liability for Co101)
            // Creditor (Co102 needs Debit) -> rule.receivableAccountId (Asset for Co102)
            payableAccountId: ccDueTo101.id,
            receivableAccountId: ccDueFrom102.id,
            enabled: true
        });

        // 5. Create Unbalanced Journal (By Company)
        // Debit Co 101, Credit Co 102
        console.log("5. Creating Unbalanced Journal (101 Dr, 102 Cr)...");
        const journal = await finance.createJournal(
            {
                name: "Intercompany Sale",
                ledgerId: ledgerId,
                periodId: periodId!,
                source: "Manual",
                category: "Sales",
                currencyCode: "USD",
                accountingDate: new Date("2026-01-15"),
                status: "Draft"
            },
            [
                {
                    lineNumber: 1,
                    accountId: cc101.id,
                    enteredDebit: "1000",
                    accountedDebit: "1000",
                    description: "Co 101 Receivable"
                },
                {
                    lineNumber: 2,
                    accountId: cc102.id,
                    enteredCredit: "1000",
                    accountedCredit: "1000",
                    description: "Co 102 Revenue"
                }
            ],
            "test-user"
        );

        // 6. Post Journal
        console.log("6. Posting Journal (triggers auto-balancing)...");
        await finance.postJournal(journal.id);

        console.log("Waiting for background posting engine...");
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 7. Verify Lines
        console.log("7. Verifying generated lines...");
        const lines = await storage.listGlJournalLines(journal.id);
        console.log(`Total Lines after posting: ${lines.length}`);

        lines.forEach(l => {
            console.log(` - Account: ${l.accountId}, Dr: ${l.enteredDebit}, Cr: ${l.enteredCredit}, Desc: ${l.description}`);
        });

        if (lines.length !== 4) {
            throw new Error(`Expected 4 lines, but found ${lines.length}`);
        }

        console.log("✅ Intercompany Balancing Engine Verified!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyIntercompany();
