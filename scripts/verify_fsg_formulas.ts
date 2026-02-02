
import 'dotenv/config';
import { db } from "../server/db";
import { financeService } from "../server/services/finance";
import { storage } from "../server/storage";
import { glBalances, glCodeCombinations } from "../shared/schema/finance";
import { eq } from "drizzle-orm";

async function verifyFsgFormulas() {
    console.log("🚀 Starting FSG Formula Verification...");

    const TEST_LEDGER = "PRIMARY";
    const TEST_PERIOD = "Formula-Test-2026";

    try {
        // 1. Setup Test Data (Balances)
        console.log("1. Seeding Mock Balances...");

        // Cleanup
        await db.delete(glBalances).where(eq(glBalances.periodName, TEST_PERIOD));

        const getCCId = async (code: string, acct: string) => {
            const [cc] = await db.select().from(glCodeCombinations).where(eq(glCodeCombinations.code, code));
            if (cc) return cc.id;
            const newCc = await storage.createGlCodeCombination({
                code,
                segment1: "101", segment2: "000", segment3: acct, segment4: "000",
                ledgerId: TEST_LEDGER
            });
            return newCc.id;
        };

        const cc1000 = await getCCId("101-000-1000-000", "1000");
        const cc2000 = await getCCId("101-000-2000-000", "2000");

        // Row 10: 1000
        await db.insert(glBalances).values({
            ledgerId: TEST_LEDGER,
            periodName: TEST_PERIOD,
            codeCombinationId: cc1000,
            currencyCode: "USD",
            periodNetDr: "1000",
            periodNetCr: "0",
            endBalance: "1000"
        });

        // Row 20: 500
        await db.insert(glBalances).values({
            ledgerId: TEST_LEDGER,
            periodName: TEST_PERIOD,
            codeCombinationId: cc2000,
            currencyCode: "USD",
            periodNetDr: "500",
            periodNetCr: "0",
            endBalance: "500"
        });

        // 2. Define Report
        console.log("2. Defining Test Report with Formulas...");
        const reportDef = await storage.createReportDefinition({
            name: "Formula Test Report",
            description: "Verification of CALCULATION rows",
            ledgerId: TEST_LEDGER
        });

        // Row 10: Detail
        await storage.createReportRow({
            reportId: reportDef.id,
            rowNumber: 10,
            description: "Detail Row 10",
            rowType: "DETAIL",
            accountFilterMin: "1000",
            accountFilterMax: "1000"
        });

        // Row 20: Detail
        await storage.createReportRow({
            reportId: reportDef.id,
            rowNumber: 20,
            description: "Detail Row 20",
            rowType: "DETAIL",
            accountFilterMin: "2000",
            accountFilterMax: "2000"
        });

        // Row 30: Calculation (10 + 20)
        await storage.createReportRow({
            reportId: reportDef.id,
            rowNumber: 30,
            description: "Total (10 + 20)",
            rowType: "CALCULATION",
            calculationFormula: "10 + 20"
        });

        // Columns
        await storage.createReportColumn({
            reportId: reportDef.id,
            columnNumber: 1,
            columnHeader: "Current PTD",
            amountType: "PTD"
        });

        // 3. Run Engine
        console.log("3. Running FSG Engine...");
        const grid = await financeService.generateFinancialReport(reportDef.id, TEST_PERIOD, TEST_LEDGER);

        console.log(JSON.stringify(grid, null, 2));

        // 4. Assertions
        const row30 = grid.rows.find((r: any) => r.rowNumber === 30);
        const resultVal = row30.cells[0];

        console.log(`Row 30 Value: ${resultVal} (Expected 1500)`);

        if (resultVal !== 1500) {
            throw new Error(`Formula evaluation failed. Expected 1500, got ${resultVal}`);
        }

        console.log("✅ FSG Formula Verification Passed!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyFsgFormulas();
