import * as storage from "../storage";
import { ExpensePolicyService } from "../services/ExpensePolicyService";

/**
 * ExpenseService - Centralized expense workflow management
 * Implements submit → approve → reimburse lifecycle
 */
export class ExpenseService {
    private policyService: ExpensePolicyService;

    constructor() {
        this.policyService = new ExpensePolicyService();
    }

    /**
     * Create a new expense report
     */
    async createReport(data: {
        tenantId: string;
        userId: string;
        title?: string;
        description?: string;
        employeeId: string;
        employeeName?: string;
    }) {
        const report = await storage.createExpenseReport({
            tenantId: data.tenantId,
            title: data.title || "New Expense Report",
            description: data.description,
            employeeId: data.employeeId,
            employeeName: data.employeeName,
            status: "DRAFT" as const,
            totalAmount: 0,
            currency: "USD",
            createdBy: data.userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return report;
    }

    /**
     * Submit expense report for approval with validation
     */
    async submitReport(reportId: string, tenantId: string, userId: string) {
        const reports = await storage.listExpenseReports();
        const report = reports.find((r: any) => r.id === reportId && r.tenantId === tenantId);

        if (!report) {
            throw new Error("Expense report not found");
        }

        if (report.status !== "DRAFT") {
            throw new Error(`Cannot submit report in ${report.status} status`);
        }

        // Validate report has lines
        if (!report.lines || report.lines.length === 0) {
            throw new Error("Cannot submit empty expense report");
        }

        // Validate against policies
        const violations = await this.validateReportAgainstPolicies(report, tenantId);
        if (violations.length > 0) {
            throw new Error(`Policy violations found: ${violations.map(v => v.message).join(", ")}`);
        }

        // Update status to SUBMITTED
        const updatedReport = {
            ...report,
            status: "SUBMITTED" as const,
            submittedAt: new Date().toISOString(),
            submittedBy: userId,
            updatedAt: new Date().toISOString(),
            updatedBy: userId
        };

        // Create approval history entry
        await this.addApprovalHistory({
            reportId,
            tenantId,
            action: "SUBMITTED",
            actorId: userId,
            timestamp: new Date().toISOString(),
            comments: "Report submitted for approval"
        });

        return updatedReport;
    }

    /**
     * Approve expense report with SoD checks
     */
    async approveReport(reportId: string, tenantId: string, userId: string, comments?: string) {
        const reports = await storage.listExpenseReports();
        const report = reports.find((r: any) => r.id === reportId && r.tenantId === tenantId);

        if (!report) {
            throw new Error("Expense report not found");
        }

        if (report.status !== "SUBMITTED") {
            throw new Error(`Cannot approve report in ${report.status} status`);
        }

        // SoD Check: User cannot approve their own expense
        if (report.employeeId === userId || report.createdBy === userId) {
            throw new Error("Segregation of Duties violation: Cannot approve your own expense report");
        }

        // Update status to APPROVED
        const updatedReport = {
            ...report,
            status: "APPROVED" as const,
            approvedAt: new Date().toISOString(),
            approvedBy: userId,
            approverComments: comments,
            updatedAt: new Date().toISOString(),
            updatedBy: userId
        };

        // Create approval history entry
        await this.addApprovalHistory({
            reportId,
            tenantId,
            action: "APPROVED",
            actorId: userId,
            timestamp: new Date().toISOString(),
            comments: comments || "Report approved"
        });

        return updatedReport;
    }

    /**
     * Reject expense report with mandatory comments
     */
    async rejectReport(reportId: string, tenantId: string, userId: string, reason: string) {
        if (!reason || reason.trim().length === 0) {
            throw new Error("Rejection reason is required");
        }

        const reports = await storage.listExpenseReports();
        const report = reports.find((r: any) => r.id === reportId && r.tenantId === tenantId);

        if (!report) {
            throw new Error("Expense report not found");
        }

        if (report.status !== "SUBMITTED") {
            throw new Error(`Cannot reject report in ${report.status} status`);
        }

        // Update status to REJECTED
        const updatedReport = {
            ...report,
            status: "REJECTED" as const,
            rejectedAt: new Date().toISOString(),
            rejectedBy: userId,
            rejectionReason: reason,
            updatedAt: new Date().toISOString(),
            updatedBy: userId
        };

        // Create approval history entry
        await this.addApprovalHistory({
            reportId,
            tenantId,
            action: "REJECTED",
            actorId: userId,
            timestamp: new Date().toISOString(),
            comments: reason
        });

        return updatedReport;
    }

    /**
     * Recall submitted expense report back to draft
     */
    async recallReport(reportId: string, tenantId: string, userId: string) {
        const reports = await storage.listExpenseReports();
        const report = reports.find((r: any) => r.id === reportId && r.tenantId === tenantId);

        if (!report) {
            throw new Error("Expense report not found");
        }

        if (report.status !== "SUBMITTED") {
            throw new Error(`Cannot recall report in ${report.status} status`);
        }

        // Only the submitter can recall
        if (report.employeeId !== userId && report.submittedBy !== userId) {
            throw new Error("Only the submitter can recall the report");
        }

        // Update status back to DRAFT
        const updatedReport = {
            ...report,
            status: "DRAFT" as const,
            submittedAt: undefined,
            submittedBy: undefined,
            updatedAt: new Date().toISOString(),
            updatedBy: userId
        };

        // Create approval history entry
        await this.addApprovalHistory({
            reportId,
            tenantId,
            action: "RECALLED",
            actorId: userId,
            timestamp: new Date().toISOString(),
            comments: "Report recalled to draft"
        });

        return updatedReport;
    }

    /**
     * Trigger AP invoice creation for reimbursement
     */
    async reimburseReport(reportId: string, tenantId: string, userId: string) {
        const reports = await storage.listExpenseReports();
        const report = reports.find((r: any) => r.id === reportId && r.tenantId === tenantId);

        if (!report) {
            throw new Error("Expense report not found");
        }

        if (report.status !== "APPROVED") {
            throw new Error("Only approved reports can be reimbursed");
        }

        if (report.reimbursementStatus === "PAID") {
            throw new Error("Report already reimbursed");
        }

        // Create AP invoice (placeholder - would integrate with AP module)
        const apInvoice = {
            id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            invoiceNumber: `EXP-REIMB-${report.reportNumber || report.id.slice(0, 8)}`,
            supplierId: `SUP-EMP-${report.employeeId}`,
            amount: report.totalAmount,
            status: "PENDING_PAYMENT",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        // Update report with reimbursement info
        const updatedReport = {
            ...report,
            reimbursementStatus: "PENDING" as const,
            apInvoiceId: apInvoice.id,
            reimbursementDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: userId
        };

        // Create approval history entry
        await this.addApprovalHistory({
            reportId,
            tenantId,
            action: "REIMBURSEMENT_INITIATED",
            actorId: userId,
            timestamp: new Date().toISOString(),
            comments: `AP Invoice ${apInvoice.invoiceNumber} created`
        });

        return { report: updatedReport, apInvoice };
    }

    /**
     * Validate expense report against active policies
     */
    private async validateReportAgainstPolicies(report: any, tenantId: string) {
        const violations: Array<{ type: string; message: string; severity: string }> = [];
        const policies = await storage.listExpensePolicies();
        const activePolicies = policies.filter((p: any) =>
            p.tenantId === tenantId &&
            p.status === "ACTIVE"
        );

        // Validate each expense line
        for (const line of report.lines || []) {
            const applicablePolicies = activePolicies.filter((p: any) => p.category === line.category);

            for (const policy of applicablePolicies) {
                // Check max amount
                if (policy.maxAmount && line.amount > policy.maxAmount) {
                    violations.push({
                        type: "AMOUNT_EXCEEDED",
                        message: `${line.category} expense of $${line.amount} exceeds policy limit of $${policy.maxAmount}`,
                        severity: "ERROR"
                    });
                }

                // Check receipt requirement
                if (policy.requiresReceipt) {
                    const threshold = policy.receiptThreshold || 0;
                    if (line.amount > threshold && !line.receiptId) {
                        violations.push({
                            type: "RECEIPT_REQUIRED",
                            message: `Receipt required for ${line.category} expense over $${threshold}`,
                            severity: "ERROR"
                        });
                    }
                }
            }
        }

        return violations;
    }

    /**
     * Add workflow state transition to approval history
     */
    private async addApprovalHistory(entry: {
        reportId: string;
        tenantId: string;
        action: string;
        actorId: string;
        timestamp: string;
        comments?: string;
    }) {
        // In a real implementation, this would persist to a separate history table
        // For now, this is a placeholder that represents the audit trail
        const historyEntry = {
            id: `HIST-${Date.now()}`,
            ...entry
        };

        return historyEntry;
    }

    /**
     * Get workflow state transitions for a report
     */
    async getApprovalHistory(reportId: string, tenantId: string) {
        // Placeholder - would fetch from history table
        return [];
    }
}

export default new ExpenseService();
