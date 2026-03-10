import { Router } from "express";
import { storage } from "../storage";
import { OCRService } from "../services/OCRService";

const router = Router();
const ocrService = new OCRService();

/**
 * POST /api/expenses/:id/receipts
 * Upload receipt file for expense report
 */
router.post("/:id/receipts", async (req: any, res) => {
    try {
        const { tenantId, userId } = req.auth!;
        const { id } = req.params;
        const { fileName, fileUrl, fileSize, mimeType, lineId } = req.body;

        const report = await storage.getExpenseReport(tenantId, id);
        if (!report) {
            return res.status(404).json({ error: "Expense report not found" });
        }

        // Only allow upload for draft or submitted reports
        if (report.status !== "DRAFT" && report.status !== "SUBMITTED") {
            return res.status(403).json({ error: "Cannot upload receipts to approved/rejected reports" });
        }

        // Create receipt record
        const receipt = {
            id: `receipt-${Date.now()}`,
            tenantId,
            expenseReportId: id,
            expenseLineId: lineId || null,
            fileName: fileName || "receipt.jpg",
            fileUrl: fileUrl || `/uploads/receipts/${Date.now()}.jpg`,
            fileSize: fileSize || 0,
            mimeType: mimeType || "image/jpeg",
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
            ocrExtractedData: null,
            ocrConfidence: null,
        };

        // TODO: Actual file upload to cloud storage
        // For now, just return receipt metadata

        res.json(receipt);
    } catch (error: any) {
        console.error("Error uploading receipt:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/expenses/:id/receipts
 * List all receipts for an expense report
 */
router.get("/:id/receipts", async (req: any, res) => {
    try {
        const { tenantId } = req.auth!;
        const { id } = req.params;

        const report = await storage.getExpenseReport(tenantId, id);
        if (!report) {
            return res.status(404).json({ error: "Expense report not found" });
        }

        // TODO: Fetch receipts from database
        // For now, return empty array
        const receipts: any[] = [];

        res.json(receipts);
    } catch (error: any) {
        console.error("Error listing receipts:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/expenses/:id/receipts/:receiptId
 * Delete a receipt
 */
router.delete("/:id/receipts/:receiptId", async (req: any, res) => {
    try {
        const { tenantId } = req.auth!;
        const { id, receiptId } = req.params;

        const report = await storage.getExpenseReport(tenantId, id);
        if (!report) {
            return res.status(404).json({ error: "Expense report not found" });
        }

        if (report.status !== "DRAFT") {
            return res.status(403).json({ error: "Cannot delete receipts from non-draft reports" });
        }

        // TODO: Delete receipt from database and cloud storage

        res.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting receipt:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/expenses/:id/receipts/:receiptId/ocr
 * Run OCR on receipt to extract data
 */
router.post("/:id/receipts/:receiptId/ocr", async (req: any, res) => {
    try {
        const { tenantId } = req.auth!;
        const { id, receiptId } = req.params;

        const report = await storage.getExpenseReport(tenantId, id);
        if (!report) {
            return res.status(404).json({ error: "Expense report not found" });
        }

        // TODO: Fetch receipt from database
        // For now, simulate OCR extraction
        const ocrResult = {
            merchant: "Sample Restaurant",
            date: new Date().toISOString().split("T")[0],
            amount: "45.50",
            category: "MEALS",
            confidence: 0.85,
            rawText: "Sample receipt text...",
        };

        res.json({
            receiptId,
            extractedData: ocrResult,
            confidence: ocrResult.confidence,
        });
    } catch (error: any) {
        console.error("Error running OCR:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/expenses/analytics/summary
 * Get expense summary analytics
 */
router.get("/analytics/summary", async (req: any, res) => {
    try {
        const { tenantId, userId } = req.auth!;
        const { startDate, endDate, employeeId } = req.query;

        // Fetch all expense reports for the tenant
        let reports = await storage.listExpenseReports(tenantId);

        // Filter by employee (default to current user)
        const targetEmployeeId = employeeId || userId;
        reports = reports.filter((r) => r.employeeId === targetEmployeeId);

        // Filter by date range
        if (startDate) {
            reports = reports.filter(
                (r) => new Date(r.createdAt) >= new Date(startDate as string)
            );
        }
        if (endDate) {
            reports = reports.filter(
                (r) => new Date(r.createdAt) <= new Date(endDate as string)
            );
        }

        // Calculate summary metrics
        const totalExpenses = reports.reduce(
            (sum, r) => sum + Number(r.totalAmount || 0),
            0
        );
        const draftCount = reports.filter((r) => r.status === "DRAFT").length;
        const submittedCount = reports.filter((r) => r.status === "SUBMITTED").length;
        const approvedCount = reports.filter((r) => r.status === "APPROVED").length;
        const rejectedCount = reports.filter((r) => r.status === "REJECTED").length;

        const pendingReimbursement = reports
            .filter((r) => r.status === "APPROVED" && !r.reimbursedAmount)
            .reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);

        res.json({
            totalReports: reports.length,
            totalAmount: totalExpenses.toFixed(2),
            byStatus: {
                draft: draftCount,
                submitted: submittedCount,
                approved: approvedCount,
                rejected: rejectedCount,
            },
            pendingReimbursement: pendingReimbursement.toFixed(2),
            avgExpenseAmount: reports.length > 0
                ? (totalExpenses / reports.length).toFixed(2)
                : "0.00",
        });
    } catch (error: any) {
        console.error("Error getting expense summary:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/expenses/analytics/by-category
 * Get expense breakdown by category
 */
router.get("/analytics/by-category", async (req: any, res) => {
    try {
        const { tenantId, userId } = req.auth!;
        const { startDate, endDate, employeeId } = req.query;

        // Fetch all expense reports
        let reports = await storage.listExpenseReports(tenantId);
        const targetEmployeeId = employeeId || userId;
        reports = reports.filter((r) => r.employeeId === targetEmployeeId);

        // Get all expense lines for these reports
        const allLines: any[] = [];
        for (const report of reports) {
            const lines = await storage.listExpenseLines(tenantId, report.id);
            allLines.push(...lines);
        }

        // Group by category
        const categoryTotals: Record<string, number> = {};
        const categoryCounts: Record<string, number> = {};

        for (const line of allLines) {
            const category = line.category || "OTHER";
            categoryTotals[category] = (categoryTotals[category] || 0) + Number(line.amount || 0);
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }

        const breakdown = Object.keys(categoryTotals).map((category) => ({
            category,
            totalAmount: categoryTotals[category].toFixed(2),
            count: categoryCounts[category],
            avgAmount: (categoryTotals[category] / categoryCounts[category]).toFixed(2),
        }));

        res.json(breakdown);
    } catch (error: any) {
        console.error("Error getting category breakdown:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/expenses/analytics/by-employee
 * Get expense stats per employee (manager view)
 */
router.get("/analytics/by-employee", async (req: any, res) => {
    try {
        const { tenantId } = req.auth!;
        const { startDate, endDate } = req.query;

        // TODO: Check if user is manager

        let reports = await storage.listExpenseReports(tenantId);

        // Filter by date range
        if (startDate) {
            reports = reports.filter(
                (r) => new Date(r.createdAt) >= new Date(startDate as string)
            );
        }
        if (endDate) {
            reports = reports.filter(
                (r) => new Date(r.createdAt) <= new Date(endDate as string)
            );
        }

        // Group by employee
        const employeeStats: Record<string, any> = {};

        for (const report of reports) {
            const empId = report.employeeId;
            if (!employeeStats[empId]) {
                employeeStats[empId] = {
                    employeeId: empId,
                    totalReports: 0,
                    totalAmount: 0,
                    approvedAmount: 0,
                    rejectedCount: 0,
                };
            }

            employeeStats[empId].totalReports++;
            employeeStats[empId].totalAmount += Number(report.totalAmount || 0);

            if (report.status === "APPROVED") {
                employeeStats[empId].approvedAmount += Number(report.totalAmount || 0);
            } else if (report.status === "REJECTED") {
                employeeStats[empId].rejectedCount++;
            }
        }

        const employeeList = Object.values(employeeStats).map((emp: any) => ({
            ...emp,
            totalAmount: emp.totalAmount.toFixed(2),
            approvedAmount: emp.approvedAmount.toFixed(2),
            avgReportAmount: (emp.totalAmount / emp.totalReports).toFixed(2),
        }));

        res.json(employeeList);
    } catch (error: any) {
        console.error("Error getting employee stats:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/expenses/analytics/violations
 * Get policy violations report
 */
router.get("/analytics/violations", async (req: any, res) => {
    try {
        const { tenantId } = req.auth!;
        const { startDate, endDate } = req.query;

        let reports = await storage.listExpenseReports(tenantId);

        // Filter by date range
        if (startDate) {
            reports = reports.filter(
                (r) => new Date(r.createdAt) >= new Date(startDate as string)
            );
        }
        if (endDate) {
            reports = reports.filter(
                (r) => new Date(r.createdAt) <= new Date(endDate as string)
            );
        }

        // Get all expense lines
        const violations: any[] = [];

        for (const report of reports) {
            const lines = await storage.listExpenseLines(tenantId, report.id);

            for (const line of lines) {
                // Check for violations (simplified - actual validation in ExpensePolicyService)
                if (Number(line.amount) > 500 && !line.receiptUrl) {
                    violations.push({
                        reportId: report.id,
                        reportNumber: report.reportNumber,
                        lineId: line.id,
                        employeeId: report.employeeId,
                        violation: "Missing receipt for amount > $500",
                        amount: line.amount,
                        category: line.category,
                        date: line.date,
                    });
                }
            }
        }

        res.json({
            totalViolations: violations.length,
            violations: violations.slice(0, 50), // Limit to 50
        });
    } catch (error: any) {
        console.error("Error getting violations:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/expenses/:id/history
 * Get approval history for expense report
 */
router.get("/:id/history", async (req: any, res) => {
    try {
        const { tenantId } = req.auth!;
        const { id } = req.params;

        const report = await storage.getExpenseReport(tenantId, id);
        if (!report) {
            return res.status(404).json({ error: "Expense report not found" });
        }

        // Build history from report fields
        const history: any[] = [
            {
                action: "CREATED",
                timestamp: report.createdAt,
                actor: report.employeeId,
                status: "DRAFT",
            },
        ];

        if (report.submitDate) {
            history.push({
                action: "SUBMITTED",
                timestamp: report.submitDate,
                actor: report.employeeId,
                status: "SUBMITTED",
            });
        }

        if (report.approvalDate) {
            history.push({
                action: "APPROVED",
                timestamp: report.approvalDate,
                actor: report.approvedBy,
                status: "APPROVED",
                comments: report.approvalComments,
            });
        }

        if (report.rejectionDate) {
            history.push({
                action: "REJECTED",
                timestamp: report.rejectionDate,
                actor: report.rejectedBy,
                status: "REJECTED",
                reason: report.rejectionReason,
            });
        }

        res.json(history);
    } catch (error: any) {
        console.error("Error getting expense history:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/expenses/:id/reimburse
 * Trigger reimbursement (creates AP invoice)
 */
router.post("/:id/reimburse", async (req: any, res) => {
    try {
        const { tenantId, userId } = req.auth!;
        const { id } = req.params;

        const report = await storage.getExpenseReport(tenantId, id);
        if (!report) {
            return res.status(404).json({ error: "Expense report not found" });
        }

        if (report.status !== "APPROVED") {
            return res.status(400).json({ error: "Can only reimburse approved reports" });
        }

        if (report.reimbursedAmount) {
            return res.status(400).json({ error: "Report already reimbursed" });
        }

        // TODO: Create AP invoice for reimbursement
        // For now, just update report status

        const updated = await storage.updateExpenseReport(tenantId, id, {
            reimbursedAmount: report.totalAmount,
            reimbursementDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        res.json(updated);
    } catch (error: any) {
        console.error("Error triggering reimbursement:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
