import 'dotenv/config';
import { db } from "../server/db";
import { storage } from "../server/storage";
import { reportingService } from "../server/services/reporting";
import { glReportDefinitions, glReportRows, glReportColumns } from "@shared/schema";
import { sql } from "drizzle-orm";

async function verify() {
    console.log("Starting FSG Verification...");

    // 1. Setup Data
    const ledgerId = "primary-ledger-001"; // Assume exists or arbitrary

    // Create Row Set
    const rowSet = await storage.createFsgRowSet({
        name: `Test Row Set ${Date.now()}`,
        description: "Verification Row Set",
        ledgerId: ledgerId
    });
    console.log(`Created Row Set: ${rowSet.id}`);

    // Create Column Set
    const colSet = await storage.createFsgColumnSet({
        name: `Test Col Set ${Date.now()}`,
        description: "Verification Col Set",
        ledgerId: ledgerId
    });
    console.log(`Created Col Set: ${colSet.id}`);

    // Add Rows
    await storage.createFsgRow({
        rowSetId: rowSet.id,
        rowNumber: 10,
        description: "Revenue",
        rowType: "DETAIL",
        accountFilterMin: "40000",
        accountFilterMax: "49999",
        inverseSign: true
    });

    await storage.createFsgRow({
        rowSetId: rowSet.id,
        rowNumber: 20,
        description: "Expense",
        rowType: "DETAIL",
        accountFilterMin: "50000",
        accountFilterMax: "59999",
        inverseSign: false
    });

    // Add Columns
    await storage.createFsgColumn({
        columnSetId: colSet.id,
        columnNumber: 10,
        columnHeader: "Current Month",
        type: "AMOUNT",
        amountType: "PTD",
        offset: 0
    });

    await storage.createFsgColumn({
        columnSetId: colSet.id,
        columnNumber: 20,
        columnHeader: "YTD",
        type: "AMOUNT",
        amountType: "YTD",
        offset: 0
    });

    // Create Definition
    const [def] = await db.insert(glReportDefinitions).values({
        name: `Verification Report ${Date.now()}`,
        ledgerId: ledgerId,
        rowSetId: rowSet.id,
        columnSetId: colSet.id,
        description: "Automated Test Report"
    }).returning();
    console.log(`Created Report Definition: ${def.id}`);

    // 2. Generate Report
    console.log("Generating Report...");
    const report = await reportingService.generateFsgReport(def.id, ledgerId, "Jan-26");

    // 3. Verify Output
    console.log("Report Generated:", JSON.stringify(report, null, 2));

    if (report.rows.length !== 2) throw new Error("Expected 2 rows");
    if (report.headers.length !== 2) throw new Error("Expected 2 columns");
    if (!report.instanceId) throw new Error("Instance ID not returned");

    console.log("✅ FSG Verification Successful");
}

verify().catch(console.error);
