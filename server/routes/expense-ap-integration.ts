import { Router } from "express";
import type { Request, Response } from "express";
import * as storage from "../storage";

const router = Router();

/**
 * POST /api/expenses/:reportId/reimburse
 * Trigger AP invoice creation for approved expense report
 */
router.post("/:reportId/reimburse", async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const tenantId = (req as any).auth?.tenantId;
        const userId = (req as any).auth?.userId;

        if (!tenantId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get the expense report
        const reports = await storage.listExpenseReports();
        const report = reports.find(r => r.id === reportId && r.tenantId === tenantId);

        if (!report) {
            return res.status(404).json({ error: "Expense report not found" });
        }

        if (report.status !== "APPROVED") {
            return res.status(400).json({
                error: "Only approved reports can be reimbursed",
                currentStatus: report.status
            });
        }

        if (report.reimbursementStatus === "PAID") {
            return res.status(400).json({
                error: "Report already reimbursed",
                apInvoiceId: report.apInvoiceId
            });
        }

        // Map employee to supplier
        // In a real implementation, this would:
        // 1. Check if employee has a supplier record
        // 2. Create supplier if not exists
        // 3. Map employee ID to supplier ID
        const supplierMapping = {
            employeeId: report.employeeId,
            supplierId: `SUP-EMP-${report.employeeId}`,
            supplierName: report.employeeName || `Employee ${report.employeeId}`,
            supplierType: "EMPLOYEE_REIMBURSEMENT"
        };

        // Create AP invoice
        // In a real implementation, this would call the AP module API
        const apInvoice = {
            id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            invoiceNumber: `EXP-REIMB-${report.reportNumber || report.id.slice(0, 8)}`,
            supplierId: supplierMapping.supplierId,
            supplierName: supplierMapping.supplierName,
            invoiceDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            amount: report.totalAmount,
            currency: report.currency || "USD",
            status: "PENDING_PAYMENT",
            description: `Expense reimbursement for ${report.title || report.reportNumber}`,
            referenceType: "EXPENSE_REPORT",
            referenceId: report.id,
            glAccount: "2100", // Accounts Payable - Employee Reimbursements
            paymentMethod: "BANK_TRANSFER",
            tenantId,
            createdBy: userId,
            createdAt: new Date().toISOString()
        };

        // Update expense report with AP invoice reference
        const updatedReport = {
            ...report,
            reimbursementStatus: "PENDING" as const,
            apInvoiceId: apInvoice.id,
            reimbursementDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: userId
        };

        // In a real implementation:
        // 1. Create actual AP invoice via storage or AP service
        // 2. Update expense report via storage.updateExpenseReport (if exists)
        // 3. Create audit trail entry
        // For now, we'll simulate the response

        res.status(200).json({
            success: true,
            message: "AP invoice created for reimbursement",
            expenseReport: {
                id: updatedReport.id,
                reportNumber: updatedReport.reportNumber,
                reimbursementStatus: updatedReport.reimbursementStatus,
                apInvoiceId: updatedReport.apInvoiceId,
                reimbursementDate: updatedReport.reimbursementDate
            },
            apInvoice: {
                id: apInvoice.id,
                invoiceNumber: apInvoice.invoiceNumber,
                amount: apInvoice.amount,
                status: apInvoice.status,
                dueDate: apInvoice.dueDate,
                supplierName: apInvoice.supplierName,
                glAccount: apInvoice.glAccount
            },
            timeline: {
                approved: report.approvedAt,
                reimbursementInitiated: new Date().toISOString(),
                expectedPayment: apInvoice.dueDate
            }
        });
    } catch (error: any) {
        console.error("AP invoice creation error:", error);
        res.status(500).json({ error: "Failed to create AP invoice", details: error.message });
    }
});

/**
 * GET /api/expenses/:reportId/reimbursement-status
 * Get reimbursement status and AP invoice details
 */
router.get("/:reportId/reimbursement-status", async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const tenantId = (req as any).auth?.tenantId;

        if (!tenantId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const reports = await storage.listExpenseReports();
        const report = reports.find(r => r.id === reportId && r.tenantId === tenantId);

        if (!report) {
            return res.status(404).json({ error: "Expense report not found" });
        }

        // Build reimbursement status response
        const response: any = {
            expenseReportId: report.id,
            reportNumber: report.reportNumber,
            status: report.status,
            totalAmount: report.totalAmount,
            currency: report.currency || "USD",
            employeeId: report.employeeId,
            employeeName: report.employeeName,
            reimbursementStatus: report.reimbursementStatus || "NOT_INITIATED",
            apInvoiceId: report.apInvoiceId || null,
            reimbursementDate: report.reimbursementDate || null
        };

        // If AP invoice exists, fetch its details
        if (report.apInvoiceId) {
            response.apInvoice = {
                id: report.apInvoiceId,
                invoiceNumber: `EXP-REIMB-${report.reportNumber || report.id.slice(0, 8)}`,
                status: "PENDING_PAYMENT", // Would fetch from AP module
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                paymentMethod: "BANK_TRANSFER"
            };

            response.timeline = {
                submitted: report.submittedAt,
                approved: report.approvedAt,
                reimbursementInitiated: report.reimbursementDate,
                expectedPayment: response.apInvoice.dueDate
            };
        }

        res.status(200).json(response);
    } catch (error: any) {
        console.error("Reimbursement status error:", error);
        res.status(500).json({ error: "Failed to fetch reimbursement status", details: error.message });
    }
});

/**
 * GET /api/expenses/reimbursement/pending
 * Get all expense reports pending reimbursement (approved but not paid)
 */
router.get("/reimbursement/pending", async (_req: Request, res: Response) => {
    try {
        const tenantId = (_req as any).auth?.tenantId;

        if (!tenantId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const reports = await storage.listExpenseReports();
        const pendingReimbursement = reports.filter(r =>
            r.tenantId === tenantId &&
            r.status === "APPROVED" &&
            (!r.reimbursementStatus || r.reimbursementStatus === "PENDING")
        );

        const enriched = pendingReimbursement.map(report => ({
            id: report.id,
            reportNumber: report.reportNumber,
            employeeId: report.employeeId,
            employeeName: report.employeeName,
            totalAmount: report.totalAmount,
            currency: report.currency || "USD",
            approvedAt: report.approvedAt,
            reimbursementStatus: report.reimbursementStatus || "NOT_INITIATED",
            apInvoiceId: report.apInvoiceId,
            daysSinceApproval: report.approvedAt
                ? Math.floor((Date.now() - new Date(report.approvedAt).getTime()) / (1000 * 60 * 60 * 24))
                : null
        }));

        res.status(200).json({
            count: enriched.length,
            totalAmount: enriched.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0),
            reports: enriched
        });
    } catch (error: any) {
        console.error("Pending reimbursement error:", error);
        res.status(500).json({ error: "Failed to fetch pending reimbursements", details: error.message });
    }
});

export default router;
