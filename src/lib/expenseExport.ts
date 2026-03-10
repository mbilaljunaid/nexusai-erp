import { formatDate } from "@/lib/dateUtils";
/**
 * Export Utility for Expense Management
 * Provides CSV export functionality for expense reports
 */

export interface ExpenseReport {
    id: string;
    reportNumber?: string;
    title?: string;
    employeeName?: string;
    employeeId: string;
    status: string;
    totalAmount?: number;
    currency?: string;
    submittedAt?: string;
    approvedAt?: string;
    createdAt?: string;
}

export function exportExpensesToCSV(
    expenses: ExpenseReport[],
    filename: string = "expenses_export"
): void {
    if (expenses.length === 0) {
        throw new Error("No expenses to export");
    }

    // Create CSV header
    const headers = [
        "Report Number",
        "Title",
        "Employee",
        "Status",
        "Total Amount",
        "Currency",
        "Submitted Date",
        "Approved Date",
        "Created Date"
    ];

    // Create CSV rows
    const rows = expenses.map(report => [
        report.reportNumber || report.id.slice(0, 8),
        `"${report.title || 'Untitled'}"`,  // Quote to handle commas
        `"${report.employeeName || report.employeeId}"`,
        report.status,
        report.totalAmount || 0,
        report.currency || "USD",
        report.submittedAt ? formatDate(report.submittedAt) : "",
        report.approvedAt ? formatDate(report.approvedAt) : "",
        report.createdAt ? formatDate(report.createdAt) : ""
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export expense lines to CSV
 */
export interface ExpenseLine {
    id: string;
    reportId: string;
    category: string;
    amount: number;
    expenseDate?: string;
    merchant?: string;
    description?: string;
}

export function exportExpenseLinesToCSV(
    lines: ExpenseLine[],
    filename: string = "expense_lines_export"
): void {
    if (lines.length === 0) {
        throw new Error("No expense lines to export");
    }

    const headers = ["Report ID", "Category", "Merchant", "Amount", "Date", "Description"];

    const rows = lines.map(line => [
        line.reportId,
        line.category,
        `"${line.merchant || 'N/A'}"`,
        line.amount,
        line.expenseDate ? formatDate(line.expenseDate) : "",
        `"${line.description || ''}"`
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
