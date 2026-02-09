/**
 * Centralized mock data layer for pages that previously used hardcoded inline arrays.
 * This provides a single source of truth for demo/placeholder data until
 * real API endpoints or Lovable Cloud database is connected.
 */

export const mockBOMs = [
  { id: "bom-1", name: "Widget A BOM", version: "1.0", items: 12, status: "active", createdAt: "2024-01-15" },
  { id: "bom-2", name: "Widget B BOM", version: "2.1", items: 8, status: "draft", createdAt: "2024-02-20" },
  { id: "bom-3", name: "Assembly C BOM", version: "1.3", items: 15, status: "active", createdAt: "2024-03-10" },
  { id: "bom-4", name: "Component D BOM", version: "3.0", items: 6, status: "review", createdAt: "2024-04-05" },
];

export const mockCustomers = [
  { id: "cust-1", name: "TechCorp Inc", industry: "Technology", revenue: "100M", email: "contact@techcorp.com", status: "active" },
  { id: "cust-2", name: "RetailCo", industry: "Retail", revenue: "50M", email: "info@retailco.com", status: "active" },
  { id: "cust-3", name: "Global Logistics Ltd", industry: "Logistics", revenue: "75M", email: "ops@globallog.com", status: "active" },
  { id: "cust-4", name: "MediHealth Corp", industry: "Healthcare", revenue: "200M", email: "admin@medihealth.com", status: "inactive" },
];

export const mockEmployees = [
  { id: "emp-1", name: "Sarah Johnson", dept: "Engineering", email: "sarah@company.com", title: "Senior Engineer", status: "active" },
  { id: "emp-2", name: "John Smith", dept: "Sales", email: "john@company.com", title: "Account Executive", status: "active" },
  { id: "emp-3", name: "Emily Chen", dept: "Marketing", email: "emily@company.com", title: "Marketing Manager", status: "active" },
  { id: "emp-4", name: "Michael Brown", dept: "Finance", email: "michael@company.com", title: "Financial Analyst", status: "on_leave" },
];

export const mockTasks = [
  { id: "task-1", title: "Complete quarterly report", assignee: "Sarah Johnson", priority: "high", status: "in_progress", dueDate: "2024-12-20" },
  { id: "task-2", title: "Review vendor contracts", assignee: "John Smith", priority: "medium", status: "todo", dueDate: "2024-12-25" },
  { id: "task-3", title: "Update employee handbook", assignee: "Emily Chen", priority: "low", status: "done", dueDate: "2024-12-15" },
  { id: "task-4", title: "Budget planning for Q1", assignee: "Michael Brown", priority: "high", status: "todo", dueDate: "2024-12-30" },
];

export const mockPayrollRecords = [
  { id: "pay-1", employeeName: "Sarah Johnson", period: "Dec 2024", grossPay: 8500, deductions: 2125, netPay: 6375, status: "processed" },
  { id: "pay-2", employeeName: "John Smith", period: "Dec 2024", grossPay: 7200, deductions: 1800, netPay: 5400, status: "processed" },
  { id: "pay-3", employeeName: "Emily Chen", period: "Dec 2024", grossPay: 9000, deductions: 2250, netPay: 6750, status: "pending" },
  { id: "pay-4", employeeName: "Michael Brown", period: "Dec 2024", grossPay: 7800, deductions: 1950, netPay: 5850, status: "pending" },
];
