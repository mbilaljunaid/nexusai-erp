
import { db } from "../server/db";
import { financeService } from "../server/services/finance";
import { storage } from "../server/storage";
import { glBalances, glCodeCombinations, glReportDefinitions, glReportRows, glReportColumns } from "../shared/schema";
import { eq, sql } from "drizzle-orm";

async function verifyFsgEngine() {
    console.log("🚀 Starting FSG Engine Verification...");

    const TEST_LEDGER = "PRIMARY"; // Using existing
    const TEST_PERIOD = "Verify-Report-2026";
    // Using a fake account range for testing
    const ACC_ASSET_MIN = "1000";
    const ACC_ASSET_MAX = "1999";
    const ACC_LIAB_MIN = "2000";
    const ACC_LIAB_MAX = "2999";

    try {
        // 0. Ensure Tables Exist (Manual Migration workaround)
        console.log("0. Ensuring DB Tables Exist...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS gl_fsg_defs (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR NOT NULL,
                description TEXT,
                ledger_id VARCHAR,
                chart_of_accounts_id VARCHAR,
                enabled BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT now()
            );
            CREATE TABLE IF NOT EXISTS gl_fsg_rows (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                report_id VARCHAR NOT NULL,
                row_number INTEGER NOT NULL,
                description VARCHAR NOT NULL,
                row_type VARCHAR NOT NULL DEFAULT 'DETAIL',
                account_filter_min VARCHAR,
                account_filter_max VARCHAR,
                segment_filter VARCHAR,
                calculation_formula VARCHAR,
                indent_level INTEGER DEFAULT 0,
                inverse_sign BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT now()
            );
            CREATE TABLE IF NOT EXISTS gl_fsg_cols (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                report_id VARCHAR NOT NULL,
                column_number INTEGER NOT NULL,
                column_header VARCHAR NOT NULL,
                amount_type VARCHAR DEFAULT 'PTD',
                currency_type VARCHAR DEFAULT 'Functional',
                period_offset INTEGER DEFAULT 0,
                ledger_id VARCHAR,
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 1. Setup Test Data (Balances)
        console.log("1. Seeding Mock Balances...");

        // Cleanup Test Data
        await db.delete(glBalances).where(eq(glBalances.periodName, TEST_PERIOD));
        // Also cleanup reports if needed, but unique IDs handle that usually. 
        // Actually, report definitions accumulate. 
        // Ideally we delete old report definitions too, but balances are the critical summation issue.

        // Helper to get CCID by code
        const getCCId = async (code: string) => {
            const [cc] = await db.select().from(glCodeCombinations).where(eq(glCodeCombinations.code, code));
            return cc?.id;
        };

        // Ensure CCID exists for Asset
        const assetCode = "101-000-" + ACC_ASSET_MIN + "-000";
        let assetCCId = await getCCId(assetCode);
        if (!assetCCId) {
            const cc = await storage.createGlCodeCombination({
                code: assetCode,
                segment1: "101", segment2: "000", segment3: ACC_ASSET_MIN, segment4: "000",
                ledgerId: TEST_LEDGER
            });
            assetCCId = cc.id;
        }

        // Ensure CCID exists for Liability
        const liabCode = "101-000-" + ACC_LIAB_MIN + "-000";
        let liabCCId = await getCCId(liabCode);
        if (!liabCCId) {

            const cc = await storage.createGlCodeCombination({
                code: liabCode,
                segment1: "101", segment2: "000", segment3: ACC_LIAB_MIN, segment4: "000",
                ledgerId: TEST_LEDGER
            });
            liabCCId = cc.id;
        }

        // Insert Balances
        // Asset: Dr 1000, Cr 0 => Net Dr 1000 (Positive for Asset)
        await db.insert(glBalances).values({
            ledgerId: TEST_LEDGER,
            periodName: TEST_PERIOD,
            codeCombinationId: assetCCId!,
            currencyCode: "USD",
            periodNetDr: "1000",
            periodNetCr: "0",
            endBalance: "1000"
        });

        // Liability: Dr 0, Cr 500 => Net Cr 500 (Positive for Liab if inverseSign=true)
        await db.insert(glBalances).values({
            ledgerId: TEST_LEDGER,
            periodName: TEST_PERIOD,
            codeCombinationId: liabCCId!,
            currencyCode: "USD",
            periodNetDr: "0",
            periodNetCr: "500",
            endBalance: "-500"
        });

        // 2. Define Report
        console.log("2. Defining Test Report...");
        const reportDef = await storage.createReportDefinition({
            name: "Test Balance Sheet",
            description: "Verification Report",
            ledgerId: TEST_LEDGER
        });

        // Rows
        // Row 10: Assets (1000-1999)
        await storage.createReportRow({
            reportId: reportDef.id,
            rowNumber: 10,
            description: "Total Assets",
            rowType: "Detail",
            accountFilterMin: ACC_ASSET_MIN,
            accountFilterMax: ACC_ASSET_MAX,
            inverseSign: false // Expect +1000
        });

        // Row 20: Liabilities (2000-2999)
        await storage.createReportRow({
            reportId: reportDef.id,
            rowNumber: 20,
            description: "Total Liabilities",
            rowType: "Detail",
            accountFilterMin: ACC_LIAB_MIN,
            accountFilterMax: ACC_LIAB_MAX,
            inverseSign: true // Expect +500 (Flip -500 to +500)
        });

        // Columns
        // Col 1: Current Month PTD
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
        const assetRow = grid.rows.find((r: any) => r.rowNumber === 10);
        const liabRow = grid.rows.find((r: any) => r.rowNumber === 20);

        const assetVal = assetRow.cells[0];
        const liabVal = liabRow.cells[0];

        console.log(`Assets: ${assetVal} (Expected 1000)`);
        console.log(`Liabilities: ${liabVal} (Expected 500)`);

        if (assetVal !== 1000) throw new Error(`Asset mismatch. Got ${assetVal}, expected 1000`);
        if (liabVal !== 500) throw new Error(`Liability mismatch. Got ${liabVal}, expected 500`);

        console.log("✅ FSG Verification Passed!");

        // Cleanup (Optional)
        // Leaving data for manual inspection if needed
    } catch (error) {
        console.error("❌ verification Failed:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

verifyFsgEngine();
