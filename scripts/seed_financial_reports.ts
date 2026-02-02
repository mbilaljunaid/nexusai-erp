
import 'dotenv/config';
import { db } from "../server/db";
import {
    glReportDefinitions, glReportRows, glReportColumns,
    InsertGlReportDefinition, InsertGlReportRow, InsertGlReportColumn
} from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("Seeding Financial Reports...");

    // 1. Balance Sheet
    const bsName = "Balance Sheet - Standard";
    let bsId = "";

    // Check definition
    const existingBs = await db.select().from(glReportDefinitions).where(eq(glReportDefinitions.name, bsName));
    if (existingBs.length === 0) {
        const [report] = await db.insert(glReportDefinitions).values({
            name: bsName,
            description: "Standard Balance Sheet (Assets, Liabilities, Equity)",
            enabled: true
        }).returning();
        bsId = report.id;
        console.log("Created Balance Sheet Report");
    } else {
        bsId = existingBs[0].id;
        console.log("Balance Sheet exists");
    }

    // Rows for Balance Sheet
    const bsRows: InsertGlReportRow[] = [
        { reportId: bsId, rowNumber: 10, description: "ASSETS", rowType: "TEXT", indentLevel: 0 },
        { reportId: bsId, rowNumber: 20, description: "Cash & Equivalents", rowType: "DETAIL", accountFilterMin: "11000", accountFilterMax: "11999", indentLevel: 1 },
        { reportId: bsId, rowNumber: 30, description: "Accounts Receivable", rowType: "DETAIL", accountFilterMin: "12000", accountFilterMax: "12999", indentLevel: 1 },
        { reportId: bsId, rowNumber: 40, description: "Total Assets", rowType: "TEXT", indentLevel: 0 },

        { reportId: bsId, rowNumber: 50, description: "LIABILITIES", rowType: "TEXT", indentLevel: 0 },
        { reportId: bsId, rowNumber: 60, description: "Accounts Payable", rowType: "DETAIL", accountFilterMin: "20000", accountFilterMax: "29999", indentLevel: 1, inverseSign: true }, // Credit is positive for Liability section usually? Or keeping implementation simple

        { reportId: bsId, rowNumber: 100, description: "EQUITY", rowType: "TEXT", indentLevel: 0 },
    ];

    // Columns
    const bsCols: InsertGlReportColumn[] = [
        { reportId: bsId, columnNumber: 1, columnHeader: "Current Month", amountType: "PTD" },
        { reportId: bsId, columnNumber: 2, columnHeader: "Year to Date", amountType: "YTD" },
    ];

    await SeedRowsAndCols(bsRows, bsCols);


    // 2. Income Statement
    const isName = "Income Statement - Standard";
    let isId = "";

    const existingIs = await db.select().from(glReportDefinitions).where(eq(glReportDefinitions.name, isName));
    if (existingIs.length === 0) {
        const [report] = await db.insert(glReportDefinitions).values({
            name: isName,
            description: "Profit and Loss Statement",
            enabled: true
        }).returning();
        isId = report.id;
        console.log("Created Income Statement Report");
    } else {
        isId = existingIs[0].id;
        console.log("Income Statement exists");
    }

    const isRows: InsertGlReportRow[] = [
        { reportId: isId, rowNumber: 10, description: "REVENUE", rowType: "TEXT" },
        { reportId: isId, rowNumber: 20, description: "Sales Revenue", rowType: "DETAIL", accountFilterMin: "40000", accountFilterMax: "49999", inverseSign: true }, // Revenue is Credit, show as positive

        { reportId: isId, rowNumber: 30, description: "EXPENSES", rowType: "TEXT" },
        { reportId: isId, rowNumber: 40, description: "Salaries", rowType: "DETAIL", accountFilterMin: "50000", accountFilterMax: "50999" },
        { reportId: isId, rowNumber: 50, description: "Rent", rowType: "DETAIL", accountFilterMin: "60000", accountFilterMax: "60999" },
    ];

    const isCols: InsertGlReportColumn[] = [
        { reportId: isId, columnNumber: 1, columnHeader: "Period Actual", amountType: "PTD" },
    ];

    await SeedRowsAndCols(isRows, isCols);

    console.log("Seeding Complete.");
    process.exit(0);
}

async function SeedRowsAndCols(rows: InsertGlReportRow[], cols: InsertGlReportColumn[]) {
    for (const r of rows) {
        // Simple duplicate check invalid for rows (can have dup descriptions), skipping for speed
        await db.insert(glReportRows).values(r);
    }
    for (const c of cols) {
        await db.insert(glReportColumns).values(c);
    }
}

seed();
