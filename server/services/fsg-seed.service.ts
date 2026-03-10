import { db } from "../db";
import {
    glFsgRowSets, glReportRows,
    glFsgColumnSets, glReportColumns,
    glReportDefinitions
} from "../../shared/schema/finance";

export class FsgSeedService {

    /**
     * Seeds Enterprise-grade Financial Statement Generator (FSG) templates
     */
    async seedTemplates(ledgerId: string = "PRIMARY") {
        console.log(`[FSG Seed] Starting template injection for Ledger: ${ledgerId}...`);

        // ---------------------------------------------------------
        // 1. STANDARD P&L ROW SET
        // ---------------------------------------------------------
        const [plRowSet] = await db.insert(glFsgRowSets).values({
            name: "Standard Income Statement",
            description: "Enterprise multi-step income statement with gross margin and operating income subtotals.",
            ledgerId: ledgerId
        }).returning();

        const plRows = [
            { rowSetId: plRowSet.id, rowNumber: 10, description: "REVENUE", rowType: "TITLE", indentLevel: 0 },
            { rowSetId: plRowSet.id, rowNumber: 20, description: "Product Revenue", rowType: "DETAIL", accountFilterMin: "4000", accountFilterMax: "4200", indentLevel: 1 },
            { rowSetId: plRowSet.id, rowNumber: 30, description: "Service Revenue", rowType: "DETAIL", accountFilterMin: "4300", accountFilterMax: "4500", indentLevel: 1 },
            { rowSetId: plRowSet.id, rowNumber: 40, description: "Total Revenue", rowType: "CALCULATION", calculationFormula: "R20+R30", indentLevel: 0 },

            { rowSetId: plRowSet.id, rowNumber: 50, description: "COST OF GOODS SOLD", rowType: "TITLE", indentLevel: 0 },
            { rowSetId: plRowSet.id, rowNumber: 60, description: "Material Costs", rowType: "DETAIL", accountFilterMin: "5000", accountFilterMax: "5100", indentLevel: 1 },
            { rowSetId: plRowSet.id, rowNumber: 70, description: "Labor Costs", rowType: "DETAIL", accountFilterMin: "5200", accountFilterMax: "5300", indentLevel: 1 },
            { rowSetId: plRowSet.id, rowNumber: 80, description: "Total COGS", rowType: "CALCULATION", calculationFormula: "R60+R70", indentLevel: 0 },

            { rowSetId: plRowSet.id, rowNumber: 90, description: "GROSS MARGIN", rowType: "CALCULATION", calculationFormula: "R40-R80", indentLevel: 0 },

            { rowSetId: plRowSet.id, rowNumber: 100, description: "OPERATING EXPENSES", rowType: "TITLE", indentLevel: 0 },
            { rowSetId: plRowSet.id, rowNumber: 110, description: "Sales & Marketing", rowType: "DETAIL", accountFilterMin: "6000", accountFilterMax: "6100", indentLevel: 1 },
            { rowSetId: plRowSet.id, rowNumber: 120, description: "Research & Development", rowType: "DETAIL", accountFilterMin: "6200", accountFilterMax: "6300", indentLevel: 1 },
            { rowSetId: plRowSet.id, rowNumber: 130, description: "General & Administrative", rowType: "DETAIL", accountFilterMin: "6400", accountFilterMax: "6500", indentLevel: 1 },
            { rowSetId: plRowSet.id, rowNumber: 140, description: "Total Operating Expenses", rowType: "CALCULATION", calculationFormula: "R110+R120+R130", indentLevel: 0 },

            { rowSetId: plRowSet.id, rowNumber: 150, description: "OPERATING INCOME", rowType: "CALCULATION", calculationFormula: "R90-R140", indentLevel: 0 },

            { rowSetId: plRowSet.id, rowNumber: 160, description: "Other Income / (Expenses)", rowType: "DETAIL", accountFilterMin: "7000", accountFilterMax: "7999", indentLevel: 1 },

            { rowSetId: plRowSet.id, rowNumber: 170, description: "NET INCOME", rowType: "CALCULATION", calculationFormula: "R150+R160", indentLevel: 0 }
        ];

        await db.insert(glReportRows).values(plRows);

        // ---------------------------------------------------------
        // 2. STANDARD BALANCE SHEET ROW SET
        // ---------------------------------------------------------
        const [bsRowSet] = await db.insert(glFsgRowSets).values({
            name: "Standard Balance Sheet",
            description: "Classified Balance Sheet separating current and non-current assets/liabilities.",
            ledgerId: ledgerId
        }).returning();

        const bsRows = [
            { rowSetId: bsRowSet.id, rowNumber: 10, description: "ASSETS", rowType: "TITLE", indentLevel: 0 },
            { rowSetId: bsRowSet.id, rowNumber: 20, description: "Current Assets", rowType: "TITLE", indentLevel: 1 },
            { rowSetId: bsRowSet.id, rowNumber: 30, description: "Cash & Equivalents", rowType: "DETAIL", accountFilterMin: "1000", accountFilterMax: "1099", indentLevel: 2 },
            { rowSetId: bsRowSet.id, rowNumber: 40, description: "Accounts Receivable", rowType: "DETAIL", accountFilterMin: "1100", accountFilterMax: "1199", indentLevel: 2 },
            { rowSetId: bsRowSet.id, rowNumber: 50, description: "Total Current Assets", rowType: "CALCULATION", calculationFormula: "R30+R40", indentLevel: 1 },
            { rowSetId: bsRowSet.id, rowNumber: 60, description: "Non-Current Assets", rowType: "TITLE", indentLevel: 1 },
            { rowSetId: bsRowSet.id, rowNumber: 70, description: "Property, Plant & Eqp", rowType: "DETAIL", accountFilterMin: "1500", accountFilterMax: "1599", indentLevel: 2 },
            { rowSetId: bsRowSet.id, rowNumber: 80, description: "Total Assets", rowType: "CALCULATION", calculationFormula: "R50+R70", indentLevel: 0 },

            { rowSetId: bsRowSet.id, rowNumber: 90, description: "LIABILITIES & EQUITY", rowType: "TITLE", indentLevel: 0 },
            { rowSetId: bsRowSet.id, rowNumber: 100, description: "Current Liabilities", rowType: "TITLE", indentLevel: 1 },
            { rowSetId: bsRowSet.id, rowNumber: 110, description: "Accounts Payable", rowType: "DETAIL", accountFilterMin: "2000", accountFilterMax: "2099", indentLevel: 2, inverseSign: true },
            { rowSetId: bsRowSet.id, rowNumber: 120, description: "Accrued Expenses", rowType: "DETAIL", accountFilterMin: "2100", accountFilterMax: "2199", indentLevel: 2, inverseSign: true },
            { rowSetId: bsRowSet.id, rowNumber: 130, description: "Total Liabilities", rowType: "CALCULATION", calculationFormula: "R110+R120", indentLevel: 1 },
            { rowSetId: bsRowSet.id, rowNumber: 140, description: "Equity", rowType: "TITLE", indentLevel: 1 },
            { rowSetId: bsRowSet.id, rowNumber: 150, description: "Retained Earnings", rowType: "DETAIL", accountFilterMin: "3000", accountFilterMax: "3999", indentLevel: 2, inverseSign: true },
            { rowSetId: bsRowSet.id, rowNumber: 160, description: "Total Liabilities & Equity", rowType: "CALCULATION", calculationFormula: "R130+R150", indentLevel: 0 },
        ];

        await db.insert(glReportRows).values(bsRows);

        // ---------------------------------------------------------
        // 3. STANDARD COLUMN SET (PTD vs YTD)
        // ---------------------------------------------------------
        const [colSet1] = await db.insert(glFsgColumnSets).values({
            name: "PTD and YTD",
            description: "Standard Period-to-Date and Year-to-Date analysis.",
            ledgerId: ledgerId
        }).returning();

        const colSet1Cols = [
            { columnSetId: colSet1.id, columnNumber: 10, columnHeader: "Current Period", amountType: "PTD", periodOffset: 0 },
            { columnSetId: colSet1.id, columnNumber: 20, columnHeader: "Year to Date", amountType: "YTD", periodOffset: 0 },
        ];
        await db.insert(glReportColumns).values(colSet1Cols);

        // ---------------------------------------------------------
        // 4. TREND COLUMN SET (Trailing 3 Periods)
        // ---------------------------------------------------------
        const [colSet2] = await db.insert(glFsgColumnSets).values({
            name: "Trailing 3 Periods Trend",
            description: "Month-over-month trend analysis for the last 3 periods.",
            ledgerId: ledgerId
        }).returning();

        const colSet2Cols = [
            { columnSetId: colSet2.id, columnNumber: 10, columnHeader: "Current Period", amountType: "PTD", periodOffset: 0 },
            { columnSetId: colSet2.id, columnNumber: 20, columnHeader: "Prior Period", amountType: "PTD", periodOffset: -1 },
            { columnSetId: colSet2.id, columnNumber: 30, columnHeader: "Two Periods Ago", amountType: "PTD", periodOffset: -2 },
        ];
        await db.insert(glReportColumns).values(colSet2Cols);

        // ---------------------------------------------------------
        // 5. REPORT DEFINITIONS
        // ---------------------------------------------------------
        const reports = [
            {
                name: "Monthly Income Statement",
                description: "Standard Profit & Loss comparing Period-to-Date and Year-to-Date revenues and expenses.",
                rowSetId: plRowSet.id,
                columnSetId: colSet1.id,
                ledgerId: ledgerId
            },
            {
                name: "Monthly Balance Sheet",
                description: "Standard Balance Sheet showing Assets, Liabilities, and Equity.",
                rowSetId: bsRowSet.id,
                columnSetId: colSet1.id,
                ledgerId: ledgerId
            },
            {
                name: "P&L Rolling Trend",
                description: "Income Statement showing a 3-month trailing trend analysis.",
                rowSetId: plRowSet.id,
                columnSetId: colSet2.id,
                ledgerId: ledgerId
            }
        ];

        await db.insert(glReportDefinitions).values(reports);

        console.log(`[FSG Seed] Completed. Seeded 2 Row Sets, 2 Column Sets, and 3 Report Definitions.`);
        return { success: true, message: "Advanced FSG Templates seeded successfully." };
    }
}

export const fsgSeedService = new FsgSeedService();
