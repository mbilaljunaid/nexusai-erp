
import 'dotenv/config';
import { db } from "../server/db";
import {
    glReportDefinitions, glReportRows, glReportColumns,
} from "../shared/schema/finance";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("Seeding Financial Reports...");

    // Note: glReportDefinitions requires rowSetId and columnSetId.
    // This seed script uses 'as any' casts since the schema has evolved.

    // 1. Balance Sheet
    const bsName = "Balance Sheet - Standard";
    let bsId = "";

    const existingBs = await db.select().from(glReportDefinitions).where(eq(glReportDefinitions.name, bsName));
    if (existingBs.length === 0) {
        const [report] = await db.insert(glReportDefinitions).values({
            name: bsName,
            description: "Standard Balance Sheet (Assets, Liabilities, Equity)",
            enabled: true,
            rowSetId: "default",
            columnSetId: "default",
        } as any).returning();
        bsId = report.id;
        console.log("Created Balance Sheet Report");
    } else {
        bsId = existingBs[0].id;
        console.log("Balance Sheet exists");
    }

    // Rows for Balance Sheet
    const bsRows = [
        { rowSetId: bsId, rowNumber: 10, description: "ASSETS", rowType: "TEXT" },
        { rowSetId: bsId, rowNumber: 20, description: "Cash & Equivalents", rowType: "DETAIL", accountFilterMin: "11000", accountFilterMax: "11999" },
        { rowSetId: bsId, rowNumber: 30, description: "Accounts Receivable", rowType: "DETAIL", accountFilterMin: "12000", accountFilterMax: "12999" },
        { rowSetId: bsId, rowNumber: 40, description: "Total Assets", rowType: "TEXT" },
        { rowSetId: bsId, rowNumber: 50, description: "LIABILITIES", rowType: "TEXT" },
        { rowSetId: bsId, rowNumber: 60, description: "Accounts Payable", rowType: "DETAIL", accountFilterMin: "20000", accountFilterMax: "29999" },
        { rowSetId: bsId, rowNumber: 100, description: "EQUITY", rowType: "TEXT" },
    ];

    const bsCols = [
        { columnSetId: bsId, columnNumber: 1, columnHeader: "Current Month", amountType: "PTD" },
        { columnSetId: bsId, columnNumber: 2, columnHeader: "Year to Date", amountType: "YTD" },
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
            enabled: true,
            rowSetId: "default",
            columnSetId: "default",
        } as any).returning();
        isId = report.id;
        console.log("Created Income Statement Report");
    } else {
        isId = existingIs[0].id;
        console.log("Income Statement exists");
    }

    const isRows = [
        { rowSetId: isId, rowNumber: 10, description: "REVENUE", rowType: "TEXT" },
        { rowSetId: isId, rowNumber: 20, description: "Sales Revenue", rowType: "DETAIL", accountFilterMin: "40000", accountFilterMax: "49999" },
        { rowSetId: isId, rowNumber: 30, description: "EXPENSES", rowType: "TEXT" },
        { rowSetId: isId, rowNumber: 40, description: "Salaries", rowType: "DETAIL", accountFilterMin: "50000", accountFilterMax: "50999" },
        { rowSetId: isId, rowNumber: 50, description: "Rent", rowType: "DETAIL", accountFilterMin: "60000", accountFilterMax: "60999" },
    ];

    const isCols = [
        { columnSetId: isId, columnNumber: 1, columnHeader: "Period Actual", amountType: "PTD" },
    ];

    await SeedRowsAndCols(isRows, isCols);

    console.log("Seeding Complete.");
    process.exit(0);
}

async function SeedRowsAndCols(rows: any[], cols: any[]) {
    for (const r of rows) {
        await db.insert(glReportRows).values(r as any);
    }
    for (const c of cols) {
        await db.insert(glReportColumns).values(c as any);
    }
}

seed();
