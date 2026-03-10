import { SearchField } from "@/components/ContextualSearch";
import { BreadcrumbItem } from "@/components/Breadcrumbs";

// Module mapping: determines breadcrumb structure
export const moduleMap: Record<string, { modulePath: string; moduleName: string }> = {
  Admin: { modulePath: "/admin", moduleName: "Admin" },
  CRM: { modulePath: "/crm", moduleName: "CRM" },
  HR: { modulePath: "/hr", moduleName: "HR" },
  Finance: { modulePath: "/finance", moduleName: "Finance" },
  ERP: { modulePath: "/erp", moduleName: "ERP" },
  Service: { modulePath: "/service", moduleName: "Service" },
  Marketing: { modulePath: "/marketing", moduleName: "Marketing" },
  Projects: { modulePath: "/projects", moduleName: "Projects" },
  Manufacturing: { modulePath: "/manufacturing", moduleName: "Manufacturing" },
  Analytics: { modulePath: "/analytics", moduleName: "Analytics" },
  Compliance: { modulePath: "/compliance", moduleName: "Compliance" },
  AI: { modulePath: "/ai", moduleName: "AI Assistant" },
};

// Search fields configuration by module
export const searchFieldsMap: Record<string, SearchField[]> = {
  Admin: [
    { key: "name", label: "Name", type: "text", placeholder: "Search by name" },
    { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] },
    { key: "role", label: "Role", type: "text", placeholder: "Search by role" },
  ],
  CRM: [
    { key: "name", label: "Name", type: "text", placeholder: "Search by name" },
    { key: "status", label: "Status", type: "select", options: [{ value: "open", label: "Open" }, { value: "closed", label: "Closed" }, { value: "won", label: "Won" }, { value: "lost", label: "Lost" }] },
    { key: "amount", label: "Amount Range", type: "text", placeholder: "Min-Max" },
  ],
  HR: [
    { key: "name", label: "Name", type: "text", placeholder: "Search by name" },
    { key: "department", label: "Department", type: "text", placeholder: "Search by department" },
    { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "on_leave", label: "On Leave" }] },
  ],
  Finance: [
    { key: "id", label: "ID", type: "text", placeholder: "Invoice/Expense ID" },
    { key: "type", label: "Type", type: "select", options: [{ value: "invoice", label: "Invoice" }, { value: "expense", label: "Expense" }, { value: "payment", label: "Payment" }] },
    { key: "status", label: "Status", type: "select", options: [{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "paid", label: "Paid" }] },
  ],
  ERP: [
    { key: "id", label: "ID", type: "text", placeholder: "Search by ID" },
    { key: "type", label: "Type", type: "text", placeholder: "Item type" },
    { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] },
  ],
  Service: [
    { key: "ticketId", label: "Ticket ID", type: "text", placeholder: "Search by ticket ID" },
    { key: "status", label: "Status", type: "select", options: [{ value: "open", label: "Open" }, { value: "in_progress", label: "In Progress" }, { value: "resolved", label: "Resolved" }, { value: "closed", label: "Closed" }] },
    { key: "priority", label: "Priority", type: "select", options: [{ value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }] },
  ],
  Marketing: [
    { key: "name", label: "Campaign Name", type: "text", placeholder: "Search by name" },
    { key: "status", label: "Status", type: "select", options: [{ value: "draft", label: "Draft" }, { value: "active", label: "Active" }, { value: "paused", label: "Paused" }, { value: "completed", label: "Completed" }] },
    { key: "channel", label: "Channel", type: "select", options: [{ value: "email", label: "Email" }, { value: "social", label: "Social" }, { value: "sms", label: "SMS" }] },
  ],
  Projects: [
    { key: "name", label: "Name", type: "text", placeholder: "Search by name" },
    { key: "status", label: "Status", type: "select", options: [{ value: "open", label: "Open" }, { value: "in_progress", label: "In Progress" }, { value: "completed", label: "Completed" }] },
    { key: "priority", label: "Priority", type: "select", options: [{ value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }] },
  ],
  Manufacturing: [
    { key: "name", label: "Name", type: "text", placeholder: "Search by name" },
    { key: "status", label: "Status", type: "select", options: [{ value: "draft", label: "Draft" }, { value: "released", label: "Released" }, { value: "obsolete", label: "Obsolete" }] },
    { key: "type", label: "Type", type: "text", placeholder: "Item type" },
  ],
  Analytics: [
    { key: "name", label: "Dashboard Name", type: "text", placeholder: "Search by name" },
    { key: "dateRange", label: "Date Range", type: "text", placeholder: "Start-End" },
    { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "archived", label: "Archived" }] },
  ],
  Compliance: [
    { key: "name", label: "Control/Policy", type: "text", placeholder: "Search by name" },
    { key: "status", label: "Status", type: "select", options: [{ value: "compliant", label: "Compliant" }, { value: "in_progress", label: "In Progress" }, { value: "non_compliant", label: "Non-Compliant" }] },
    { key: "framework", label: "Framework", type: "select", options: [{ value: "soc2", label: "SOC 2" }, { value: "gdpr", label: "GDPR" }, { value: "hipaa", label: "HIPAA" }, { value: "iso27001", label: "ISO 27001" }] },
  ],
  AI: [
    { key: "query", label: "Search Query", type: "text", placeholder: "Ask something..." },
    { key: "category", label: "Category", type: "select", options: [{ value: "general", label: "General" }, { value: "technical", label: "Technical" }, { value: "business", label: "Business" }] },
  ],
};

// Extract module from detail page filename
export function extractModuleFromPageName(fileName: string): string {
  const match = fileName.match(/^([A-Z][a-z]+)/);
  return match ? match[1] : "Admin";
}

// Extract section from detail page filename
export function extractSectionFromPageName(fileName: string): string {
  const match = fileName.match(/Detail$/);
  if (!match) return "Overview";
  const cleaned = fileName.replace("Detail", "").replace(/^[A-Z][a-z]+/, "");
  return cleaned || "Overview";
}

// Generate breadcrumbs for a detail page
export function generateBreadcrumbs(moduleName: string, sectionName: string): BreadcrumbItem[] {
  const module = moduleMap[moduleName];
  if (!module) return [];
  return [
    { label: module.moduleName, path: module.modulePath },
    { label: sectionName, path: "#" },
  ];
}

// Get search fields for a module
export function getSearchFields(moduleName: string): SearchField[] {
  return searchFieldsMap[moduleName] || searchFieldsMap["Admin"];
}
