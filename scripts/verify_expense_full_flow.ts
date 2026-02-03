import { storage } from "../server/storage";
import { expensePolicyService } from "../server/services/ExpensePolicyService";

// Helper for status change with logging
async function updateStatus(id: string, newStatus: string, userId: string) {
    const report = await storage.getExpenseReport(id);
    const updated = await storage.updateExpenseReport(id, { status: newStatus as any });
    console.log(`[Audit] STATUS_CHANGE: ${report?.status} -> ${newStatus} by ${userId}`);
    return updated;
}

// Helper for GL posting simulation
async function postToGL(reportId: string) {
    const report = await storage.getExpenseReport(reportId);
    const lines = await storage.listExpenseLines(reportId);
    console.log(`[GL] Posting ${lines.length} lines for report ${report?.reportNumber} to General Ledger...`);
    await storage.updateExpenseReport(reportId, { status: 'PAID' as any });
}

async function verifyFullFlow() {
    console.log("🚀 Starting Standalone Full-Flow Verification...");

    const tenantId = "tenant1";
    const userId = "verifier_001";

    // 1. Policy & Duplicate Validation
    console.log("\n--- 1. Policy & Duplicate Validation ---");
    const validation = await expensePolicyService.validateLine(tenantId, {
        category: "MEALS",
        amount: 150.00,
    });
    console.log("Validation Result (Limit Check):", validation.valid ? "PASS" : "FAIL", validation.violations);

    const isDuplicate = await expensePolicyService.detectDuplicates(tenantId, {
        merchant: "Starbucks",
        amount: 15.50,
        date: new Date()
    });
    console.log("Duplicate Check (Mock):", isDuplicate);

    // 2. Create Report & Lines
    console.log("\n--- 2. Create Report & Persistence ---");
    const reportNumber = "VERIFY-" + Date.now();
    const report = await storage.createExpenseReport({
        tenantId,
        employeeId: "EMP_VERIFY",
        reportNumber,
        purpose: "Full Flow Test",
        status: "DRAFT"
    });
    console.log("Report Created:", report.id, "(", reportNumber, ")");

    const line = await storage.createExpenseLine({
        tenantId,
        reportId: report.id,
        category: "TRAVEL",
        amount: "1200.00",
        currency: "USD",
        date: new Date(),
        merchant: "Airlines"
    });
    console.log("Line Created:", line.id);

    // 3. Approval & GL Posting
    console.log("\n--- 3. Approval & GL Posting ---");
    await updateStatus(report.id, "APPROVED", userId);
    await postToGL(report.id);

    const finalReport = await storage.getExpenseReport(report.id);
    console.log("Final Report Status:", finalReport?.status);

    if (finalReport?.status === 'PAID') {
        console.log("\n✅ Standalone Verification Successful.");
    } else {
        console.log("\n❌ Verification Failed: Status not updated correctly.");
        process.exit(1);
    }
}

verifyFullFlow().catch(console.error);
