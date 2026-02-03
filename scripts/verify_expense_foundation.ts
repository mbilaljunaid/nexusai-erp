import { storage } from "../server/storage";
import { InsertExpenseReport, InsertExpenseLine } from "@shared/schema";

async function verifyExpenseFoundation() {
    console.log("🚀 Starting Expense Foundation Verification...");

    const tenantId = "tenant1";
    const employeeId = "emp123";

    // 1. Create a mock expense report
    console.log("Creating mock expense report...");
    const reportData: InsertExpenseReport = {
        tenantId,
        employeeId,
        reportNumber: `EXP-VERIFY-${Date.now()}`,
        purpose: "Foundation Verification",
        status: "DRAFT",
        currency: "USD",
    };

    const report = await storage.createExpenseReport(reportData);
    console.log(`✅ Success: Expense Report created with ID: ${report.id}`);

    // 2. Create a mock expense line
    console.log("Creating mock expense line...");
    const lineData: InsertExpenseLine = {
        tenantId,
        reportId: report.id,
        date: new Date(),
        category: "TRAVEL",
        merchant: "Veriforce Airlines",
        amount: "150.00",
        currency: "USD",
        description: "Verification Flight",
    };

    const line = await storage.createExpenseLine(lineData);
    console.log(`✅ Success: Expense Line created with ID: ${line.id}`);

    // 3. Verify retrieval
    console.log("Verifying retrieval of reports...");
    const reports = await storage.listExpenseReports(tenantId, employeeId);
    const foundReport = reports.find(r => r.id === report.id);

    if (foundReport) {
        console.log("✅ Success: Found the created report in the list.");
    } else {
        throw new Error("❌ Failure: Created report not found in the list.");
    }

    console.log("Verifying retrieval of items...");
    const items = await storage.listAllExpenseLines(tenantId);
    const foundLine = items.find(i => i.id === line.id);

    if (foundLine) {
        console.log("✅ Success: Found the created item in the global list.");
    } else {
        throw new Error("❌ Failure: Created item not found in the global list.");
    }

    console.log("✨ Expense Foundation Verification Complete!");
}

verifyExpenseFoundation().catch(err => {
    console.error("❌ Verification Failed:", err);
    process.exit(1);
});
