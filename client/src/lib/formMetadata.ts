// Enhanced form metadata system with module/page mappings
export interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "date" | "select" | "textarea";
  required: boolean;
  searchable: boolean;
  validation?: string;
}

export interface FormMetadata {
  id: string;
  name: string;
  apiEndpoint: string;
  fields: FormFieldConfig[];
  searchFields: string[];
  displayField: string;
  createButtonText: string;
  module: string; // e.g., "CRM", "Finance", "HR"
  page: string; // e.g., "/crm/leads"
  allowCreate: boolean; // e.g., false for analytics pages
  showSearch: boolean;
  breadcrumbs: Array<{ label: string; path: string }>;
}

// Form metadata registry - searchable fields are FORM-SPECIFIC, not generic
export const formMetadataRegistry: Record<string, FormMetadata> = {
  lead: {
    id: "lead",
    name: "Lead",
    apiEndpoint: "/api/leads",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "email", label: "Email", type: "email", required: true, searchable: true },
      { name: "company", label: "Company", type: "text", required: false, searchable: true },
      { name: "score", label: "Lead Score", type: "number", required: false, searchable: false },
      { name: "status", label: "Status", type: "select", required: false, searchable: false },
    ],
    searchFields: ["name", "email", "company"],
    displayField: "name",
    createButtonText: "Add Lead",
    module: "CRM",
    page: "/crm/leads",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Leads", path: "/crm/leads" },
    ],
  },
  
  invoice: {
    id: "invoice",
    name: "Invoice",
    apiEndpoint: "/api/invoices",
    fields: [
      { name: "invoiceNumber", label: "Invoice Number", type: "text", required: true, searchable: true },
      { name: "customerId", label: "Customer ID", type: "text", required: false, searchable: true },
      { name: "amount", label: "Amount", type: "number", required: true, searchable: false },
      { name: "dueDate", label: "Due Date", type: "date", required: false, searchable: false },
      { name: "status", label: "Status", type: "select", required: false, searchable: true },
    ],
    searchFields: ["invoiceNumber", "customerId", "status"],
    displayField: "invoiceNumber",
    createButtonText: "Create Invoice",
    module: "Finance",
    page: "/finance/invoices",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Invoices", path: "/finance/invoices" },
    ],
  },

  employee: {
    id: "employee",
    name: "Employee",
    apiEndpoint: "/api/hr/employees",
    fields: [
      { name: "name", label: "Employee Name", type: "text", required: true, searchable: true },
      { name: "email", label: "Email", type: "email", required: false, searchable: true },
      { name: "department", label: "Department", type: "select", required: false, searchable: true },
      { name: "role", label: "Role", type: "text", required: false, searchable: true },
      { name: "salary", label: "Salary", type: "number", required: false, searchable: false },
    ],
    searchFields: ["name", "email", "department", "role"],
    displayField: "name",
    createButtonText: "Add Employee",
    module: "HR",
    page: "/hr/employees",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Employees", path: "/hr/employees" },
    ],
  },

  customer: {
    id: "customer",
    name: "Customer",
    apiEndpoint: "/api/crm/customers",
    fields: [
      { name: "customerName", label: "Customer Name", type: "text", required: true, searchable: true },
      { name: "email", label: "Email", type: "email", required: true, searchable: true },
      { name: "phone", label: "Phone", type: "text", required: true, searchable: true },
      { name: "company", label: "Company", type: "text", required: false, searchable: true },
      { name: "industry", label: "Industry", type: "select", required: false, searchable: false },
      { name: "creditLimit", label: "Credit Limit", type: "number", required: false, searchable: false },
      { name: "status", label: "Status", type: "select", required: false, searchable: false },
    ],
    searchFields: ["customerName", "email", "phone", "company"],
    displayField: "customerName",
    createButtonText: "Add Customer",
    module: "CRM",
    page: "/crm/customers",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Customers", path: "/crm/customers" },
    ],
  },

  opportunity: {
    id: "opportunity",
    name: "Opportunity",
    apiEndpoint: "/api/crm/opportunities",
    fields: [
      { name: "name", label: "Opportunity Name", type: "text", required: true, searchable: true },
      { name: "accountId", label: "Account", type: "select", required: true, searchable: false },
      { name: "stage", label: "Stage", type: "select", required: false, searchable: false },
      { name: "probability", label: "Probability %", type: "number", required: false, searchable: false },
      { name: "expectedValue", label: "Expected Value", type: "number", required: false, searchable: false },
      { name: "closeDate", label: "Close Date", type: "date", required: false, searchable: false },
    ],
    searchFields: ["name"],
    displayField: "name",
    createButtonText: "Add Opportunity",
    module: "CRM",
    page: "/crm/opportunities",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Opportunities", path: "/crm/opportunities" },
    ],
  },

  workorder: {
    id: "workorder",
    name: "Work Order",
    apiEndpoint: "/api/work-orders",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, searchable: true },
      { name: "description", label: "Description", type: "textarea", required: false, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: false },
      { name: "assignedTo", label: "Assigned To", type: "text", required: false, searchable: true },
      { name: "dueDate", label: "Due Date", type: "date", required: false, searchable: false },
    ],
    searchFields: ["title", "description", "assignedTo"],
    displayField: "title",
    createButtonText: "Create Work Order",
    module: "Manufacturing",
    page: "/manufacturing/workorders",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "Work Orders", path: "/manufacturing/workorders" },
    ],
  },

  // Analytics dashboard - NO create button, NO search
  analyticsDashboard: {
    id: "analytics",
    name: "Analytics",
    apiEndpoint: "/api/analytics",
    fields: [],
    searchFields: [],
    displayField: "name",
    createButtonText: "",
    module: "Analytics",
    page: "/analytics",
    allowCreate: false,
    showSearch: false,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
    ],
  },

  // Settings pages - NO create button, NO search
  crmSettings: {
    id: "crm-settings",
    name: "CRM Settings",
    apiEndpoint: "/api/crm/settings",
    fields: [],
    searchFields: [],
    displayField: "name",
    createButtonText: "",
    module: "CRM",
    page: "/crm/settings",
    allowCreate: false,
    showSearch: false,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Settings", path: "/crm/settings" },
    ],
  },

  hrSettings: {
    id: "hr-settings",
    name: "HR Settings",
    apiEndpoint: "/api/hr/settings",
    fields: [],
    searchFields: [],
    displayField: "name",
    createButtonText: "",
    module: "HR",
    page: "/hr/settings",
    allowCreate: false,
    showSearch: false,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Settings", path: "/hr/settings" },
    ],
  },

  financeSettings: {
    id: "finance-settings",
    name: "Finance Settings",
    apiEndpoint: "/api/finance/settings",
    fields: [],
    searchFields: [],
    displayField: "name",
    createButtonText: "",
    module: "Finance",
    page: "/finance/settings",
    allowCreate: false,
    showSearch: false,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Settings", path: "/finance/settings" },
    ],
  },

  // Sales Pipeline
  salesPipeline: {
    id: "opportunity",
    name: "Sales Pipeline",
    apiEndpoint: "/api/crm/opportunities",
    fields: [
      { name: "title", label: "Opportunity Title", type: "text", required: true, searchable: true },
      { name: "stage", label: "Stage", type: "select", required: true, searchable: true },
      { name: "value", label: "Value", type: "number", required: false, searchable: false },
      { name: "probability", label: "Probability", type: "number", required: false, searchable: false },
    ],
    searchFields: ["title", "stage"],
    displayField: "title",
    createButtonText: "Add Opportunity",
    module: "CRM",
    page: "/crm/sales-pipeline",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Sales Pipeline", path: "/crm/sales-pipeline" },
    ],
  },

  // Marketplace
  marketplace: {
    id: "marketplace",
    name: "Marketplace Extensions",
    apiEndpoint: "/api/marketplace/extensions",
    fields: [
      { name: "name", label: "Extension Name", type: "text", required: true, searchable: true },
      { name: "category", label: "Category", type: "select", required: true, searchable: true },
      { name: "version", label: "Version", type: "text", required: false, searchable: false },
      { name: "description", label: "Description", type: "textarea", required: false, searchable: false },
    ],
    searchFields: ["name", "category"],
    displayField: "name",
    createButtonText: "Publish Extension",
    module: "Marketplace",
    page: "/marketplace",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Marketplace", path: "/marketplace" },
    ],
  },

  // System Health (monitoring dashboard - no create/search)
  systemHealth: {
    id: "system-health",
    name: "System Health",
    apiEndpoint: "/api/system/health",
    fields: [],
    searchFields: [],
    displayField: "name",
    createButtonText: "",
    module: "Admin",
    page: "/admin/system-health",
    allowCreate: false,
    showSearch: false,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "System Health", path: "/admin/system-health" },
    ],
  },

  // Data Warehouse (analytics/monitoring - no create/search)
  dataWarehouse: {
    id: "data-warehouse",
    name: "Data Warehouse",
    apiEndpoint: "/api/data-warehouse",
    fields: [],
    searchFields: [],
    displayField: "name",
    createButtonText: "",
    module: "Analytics",
    page: "/analytics/data-warehouse",
    allowCreate: false,
    showSearch: false,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Analytics", path: "/analytics" },
      { label: "Data Warehouse", path: "/analytics/data-warehouse" },
    ],
  },

  // Compliance (monitoring dashboard - no create/search)
  compliance: {
    id: "compliance",
    name: "Compliance Dashboard",
    apiEndpoint: "/api/compliance",
    fields: [],
    searchFields: [],
    displayField: "name",
    createButtonText: "",
    module: "Governance",
    page: "/governance/compliance",
    allowCreate: false,
    showSearch: false,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Compliance", path: "/governance/compliance" },
    ],
  },

  // Procurement & Supply Chain
  vendor: {
    id: "vendor",
    name: "Vendor",
    apiEndpoint: "/api/vendors",
    fields: [
      { name: "name", label: "Vendor Name", type: "text", required: true, searchable: true },
      { name: "category", label: "Category", type: "select", required: true, searchable: true },
      { name: "rating", label: "Rating", type: "number", required: false, searchable: false },
    ],
    searchFields: ["name", "category"],
    displayField: "name",
    createButtonText: "Add Vendor",
    module: "Procurement",
    page: "/procurement/vendors",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Procurement", path: "/procurement" },
      { label: "Vendors", path: "/procurement/vendors" },
    ],
  },

  purchaseOrder: {
    id: "purchaseOrder",
    name: "Purchase Order",
    apiEndpoint: "/api/purchase-orders",
    fields: [
      { name: "id", label: "PO Number", type: "text", required: true, searchable: true },
      { name: "vendor", label: "Vendor", type: "text", required: true, searchable: true },
      { name: "amount", label: "Amount", type: "number", required: true, searchable: false },
      { name: "status", label: "Status", type: "select", required: true, searchable: true },
    ],
    searchFields: ["id", "vendor", "status"],
    displayField: "id",
    createButtonText: "Create PO",
    module: "Procurement",
    page: "/procurement/purchase-orders",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Procurement", path: "/procurement" },
      { label: "Purchase Orders", path: "/procurement/purchase-orders" },
    ],
  },

  // CRM & Contacts
  contact: {
    id: "contact",
    name: "Contact",
    apiEndpoint: "/api/contacts",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, searchable: true },
      { name: "email", label: "Email", type: "email", required: true, searchable: true },
      { name: "company", label: "Company", type: "text", required: false, searchable: true },
      { name: "phone", label: "Phone", type: "text", required: false, searchable: false },
    ],
    searchFields: ["name", "email", "company"],
    displayField: "name",
    createButtonText: "Add Contact",
    module: "CRM",
    page: "/crm/contacts",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Contacts", path: "/crm/contacts" },
    ],
  },

  // Service Desk
  serviceTicket: {
    id: "serviceTicket",
    name: "Service Ticket",
    apiEndpoint: "/api/service-tickets",
    fields: [
      { name: "id", label: "Ticket ID", type: "text", required: true, searchable: true },
      { name: "title", label: "Title", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: true, searchable: true },
      { name: "priority", label: "Priority", type: "select", required: false, searchable: false },
    ],
    searchFields: ["id", "title", "status"],
    displayField: "title",
    createButtonText: "Create Ticket",
    module: "ServiceDesk",
    page: "/service/tickets",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Service Desk", path: "/service" },
      { label: "Tickets", path: "/service/tickets" },
    ],
  },

  // HR
  leaveRequest: {
    id: "leaveRequest",
    name: "Leave Request",
    apiEndpoint: "/api/hr/leave-requests",
    fields: [
      { name: "employee", label: "Employee", type: "text", required: true, searchable: true },
      { name: "type", label: "Leave Type", type: "select", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true },
      { name: "startDate", label: "Start Date", type: "date", required: true, searchable: false },
    ],
    searchFields: ["employee", "type", "status"],
    displayField: "employee",
    createButtonText: "Request Leave",
    module: "HR",
    page: "/hr/leave-requests",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "HR", path: "/hr" },
      { label: "Leave Requests", path: "/hr/leave-requests" },
    ],
  },

  // Workflow & Automation
  approval: {
    id: "approval",
    name: "Approval Workflow",
    apiEndpoint: "/api/approvals",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true },
      { name: "assignee", label: "Assignee", type: "text", required: false, searchable: true },
    ],
    searchFields: ["title", "status", "assignee"],
    displayField: "title",
    createButtonText: "",
    module: "Workflow",
    page: "/workflow/approvals",
    allowCreate: false,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Workflow", path: "/workflow" },
      { label: "Approvals", path: "/workflow/approvals" },
    ],
  },

  // Developer & APIs
  apiManagement: {
    id: "apiManagement",
    name: "API Management",
    apiEndpoint: "/api/apis",
    fields: [
      { name: "name", label: "API Name", type: "text", required: true, searchable: true },
      { name: "version", label: "Version", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true },
    ],
    searchFields: ["name", "version", "status"],
    displayField: "name",
    createButtonText: "Add API",
    module: "Developer",
    page: "/developer/apis",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "APIs", path: "/developer/apis" },
    ],
  },

  webhook: {
    id: "webhook",
    name: "Webhook Management",
    apiEndpoint: "/api/webhooks",
    fields: [
      { name: "name", label: "Webhook Name", type: "text", required: true, searchable: true },
      { name: "event", label: "Event", type: "select", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true },
    ],
    searchFields: ["name", "event", "status"],
    displayField: "name",
    createButtonText: "Add Webhook",
    module: "Developer",
    page: "/developer/webhooks",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "Webhooks", path: "/developer/webhooks" },
    ],
  },

  automation: {
    id: "automation",
    name: "Automation Rules",
    apiEndpoint: "/api/automation",
    fields: [
      { name: "name", label: "Rule Name", type: "text", required: true, searchable: true },
      { name: "trigger", label: "Trigger", type: "select", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true },
    ],
    searchFields: ["name", "trigger", "status"],
    displayField: "name",
    createButtonText: "Create Rule",
    module: "Automation",
    page: "/automation/rules",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Automation", path: "/automation" },
      { label: "Rules", path: "/automation/rules" },
    ],
  },

  activity: {
    id: "activity",
    name: "Activity",
    apiEndpoint: "/api/activities",
    fields: [
      { name: "type", label: "Type", type: "select", required: true, searchable: true },
      { name: "subject", label: "Subject", type: "text", required: true, searchable: true },
      { name: "user", label: "User", type: "text", required: false, searchable: true },
    ],
    searchFields: ["type", "subject", "user"],
    displayField: "subject",
    createButtonText: "",
    module: "CRM",
    page: "/crm/activities",
    allowCreate: false,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "CRM", path: "/crm" },
      { label: "Activities", path: "/crm/activities" },
    ],
  },

  billing: {
    id: "billing",
    name: "Billing",
    apiEndpoint: "/api/billing",
    fields: [
      { name: "customerId", label: "Customer", type: "text", required: true, searchable: true },
      { name: "amount", label: "Amount", type: "number", required: true, searchable: false },
      { name: "status", label: "Status", type: "select", required: false, searchable: true },
    ],
    searchFields: ["customerId", "status"],
    displayField: "customerId",
    createButtonText: "Create Billing",
    module: "Finance",
    page: "/finance/billing",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Finance", path: "/finance" },
      { label: "Billing", path: "/finance/billing" },
    ],
  },

  bomManagement: {
    id: "bomManagement",
    name: "BOM Management",
    apiEndpoint: "/api/bom",
    fields: [
      { name: "name", label: "BOM Name", type: "text", required: true, searchable: true },
      { name: "product", label: "Product", type: "text", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true },
    ],
    searchFields: ["name", "product", "status"],
    displayField: "name",
    createButtonText: "Create BOM",
    module: "Manufacturing",
    page: "/manufacturing/bom",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "BOM", path: "/manufacturing/bom" },
    ],
  },

  apiLogs: {
    id: "apiLogs",
    name: "API Logs",
    apiEndpoint: "/api/logs",
    fields: [
      { name: "endpoint", label: "Endpoint", type: "text", required: true, searchable: true },
      { name: "method", label: "Method", type: "select", required: false, searchable: true },
      { name: "status", label: "Status", type: "text", required: false, searchable: true },
    ],
    searchFields: ["endpoint", "method", "status"],
    displayField: "endpoint",
    createButtonText: "",
    module: "Developer",
    page: "/developer/logs",
    allowCreate: false,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Developer", path: "/developer" },
      { label: "Logs", path: "/developer/logs" },
    ],
  },

  userManagement: {
    id: "userManagement",
    name: "User Management",
    apiEndpoint: "/api/users",
    fields: [
      { name: "email", label: "Email", type: "email", required: true, searchable: true },
      { name: "role", label: "Role", type: "select", required: true, searchable: true },
      { name: "status", label: "Status", type: "select", required: false, searchable: true },
    ],
    searchFields: ["email", "role", "status"],
    displayField: "email",
    createButtonText: "Add User",
    module: "Admin",
    page: "/admin/users",
    allowCreate: true,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Admin", path: "/admin" },
      { label: "Users", path: "/admin/users" },
    ],
  },

  auditLogs: {
    id: "auditLogs",
    name: "Audit Logs",
    apiEndpoint: "/api/audit",
    fields: [
      { name: "user", label: "User", type: "text", required: true, searchable: true },
      { name: "action", label: "Action", type: "text", required: true, searchable: true },
      { name: "resource", label: "Resource", type: "text", required: false, searchable: true },
    ],
    searchFields: ["user", "action", "resource"],
    displayField: "action",
    createButtonText: "",
    module: "Governance",
    page: "/governance/audit",
    allowCreate: false,
    showSearch: true,
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Governance", path: "/governance" },
      { label: "Audit Logs", path: "/governance/audit" },
    ],
  },

  qualityControl: { id: "qualityControl", name: "Quality Control", apiEndpoint: "/api/quality", fields: [], searchFields: ["product", "status"], displayField: "product", createButtonText: "", module: "Manufacturing", page: "/manufacturing/quality", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Manufacturing", path: "/manufacturing" }, { label: "Quality", path: "/manufacturing/quality" }] },
  
  financialReports: { id: "financialReports", name: "Financial Reports", apiEndpoint: "/api/reports", fields: [], searchFields: ["name", "period"], displayField: "name", createButtonText: "", module: "Finance", page: "/finance/reports", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Finance", path: "/finance" }, { label: "Reports", path: "/finance/reports" }] },
  
  orgChart: { id: "orgChart", name: "Organization Chart", apiEndpoint: "/api/org", fields: [], searchFields: ["name", "role"], displayField: "name", createButtonText: "", module: "HR", page: "/hr/org-chart", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "HR", path: "/hr" }, { label: "Org Chart", path: "/hr/org-chart" }] },
  
  inventory: { id: "inventory", name: "Inventory", apiEndpoint: "/api/inventory", fields: [], searchFields: ["sku", "name", "location"], displayField: "sku", createButtonText: "Add Item", module: "Procurement", page: "/procurement/inventory", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Procurement", path: "/procurement" }, { label: "Inventory", path: "/procurement/inventory" }] },
  
  warehouse: { id: "warehouse", name: "Warehouse", apiEndpoint: "/api/warehouse", fields: [], searchFields: ["name", "location", "status"], displayField: "name", createButtonText: "Add Warehouse", module: "Procurement", page: "/procurement/warehouse", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Procurement", path: "/procurement" }, { label: "Warehouse", path: "/procurement/warehouse" }] },
  
  campaign: { id: "campaign", name: "Campaign", apiEndpoint: "/api/campaigns", fields: [], searchFields: ["name", "status", "channel"], displayField: "name", createButtonText: "Create Campaign", module: "CRM", page: "/crm/campaigns", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "CRM", path: "/crm" }, { label: "Campaigns", path: "/crm/campaigns" }] },
  
  opportunity: { id: "opportunity", name: "Opportunity", apiEndpoint: "/api/opportunities", fields: [], searchFields: ["name", "stage", "account"], displayField: "name", createButtonText: "Add Opportunity", module: "CRM", page: "/crm/opportunities", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "CRM", path: "/crm" }, { label: "Opportunities", path: "/crm/opportunities" }] },
  
  territory: { id: "territory", name: "Territory", apiEndpoint: "/api/territories", fields: [], searchFields: ["name", "manager", "region"], displayField: "name", createButtonText: "Add Territory", module: "CRM", page: "/crm/territories", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "CRM", path: "/crm" }, { label: "Territories", path: "/crm/territories" }] },
  
  forecast: { id: "forecast", name: "Forecast", apiEndpoint: "/api/forecast", fields: [], searchFields: ["product", "period", "status"], displayField: "product", createButtonText: "Add Forecast", module: "CRM", page: "/crm/forecast", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "CRM", path: "/crm" }, { label: "Forecast", path: "/crm/forecast" }] },
  
  budgetPlanning: { id: "budgetPlanning", name: "Budget Planning", apiEndpoint: "/api/budget", fields: [], searchFields: ["department", "period", "status"], displayField: "department", createButtonText: "Create Budget", module: "Finance", page: "/finance/budget", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Finance", path: "/finance" }, { label: "Budget", path: "/finance/budget" }] },
  
  costAnalysis: { id: "costAnalysis", name: "Cost Analysis", apiEndpoint: "/api/costs", fields: [], searchFields: ["category", "period", "status"], displayField: "category", createButtonText: "", module: "Finance", page: "/finance/costs", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Finance", path: "/finance" }, { label: "Costs", path: "/finance/costs" }] },
  
  generalLedger: { id: "generalLedger", name: "General Ledger", apiEndpoint: "/api/ledger", fields: [], searchFields: ["account", "period", "type"], displayField: "account", createButtonText: "", module: "Finance", page: "/finance/ledger", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Finance", path: "/finance" }, { label: "Ledger", path: "/finance/ledger" }] },
  
  taxManagement: { id: "taxManagement", name: "Tax Management", apiEndpoint: "/api/tax", fields: [], searchFields: ["type", "period", "status"], displayField: "type", createButtonText: "Add Tax Record", module: "Finance", page: "/finance/tax", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Finance", path: "/finance" }, { label: "Tax", path: "/finance/tax" }] },
  
  trainingDevelopment: { id: "trainingDevelopment", name: "Training Development", apiEndpoint: "/api/training", fields: [], searchFields: ["title", "instructor", "status"], displayField: "title", createButtonText: "Create Training", module: "HR", page: "/hr/training", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "HR", path: "/hr" }, { label: "Training", path: "/hr/training" }] },
  
  performanceManagement: { id: "performanceManagement", name: "Performance Management", apiEndpoint: "/api/performance", fields: [], searchFields: ["employee", "period", "rating"], displayField: "employee", createButtonText: "", module: "HR", page: "/hr/performance", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "HR", path: "/hr" }, { label: "Performance", path: "/hr/performance" }] },
  
  ticketManagement: { id: "ticketManagement", name: "Ticket Management", apiEndpoint: "/api/tickets", fields: [], searchFields: ["id", "title", "status"], displayField: "title", createButtonText: "Create Ticket", module: "ServiceDesk", page: "/service/ticket-management", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Service Desk", path: "/service" }, { label: "Tickets", path: "/service/ticket-management" }] },
  
  knowledgeBase: { id: "knowledgeBase", name: "Knowledge Base", apiEndpoint: "/api/knowledge", fields: [], searchFields: ["title", "category", "status"], displayField: "title", createButtonText: "Add Article", module: "ServiceDesk", page: "/service/knowledge", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Service Desk", path: "/service" }, { label: "Knowledge", path: "/service/knowledge" }] },
  
  slaTracking: { id: "slaTracking", name: "SLA Tracking", apiEndpoint: "/api/sla", fields: [], searchFields: ["ticket", "sla", "status"], displayField: "ticket", createButtonText: "", module: "ServiceDesk", page: "/service/sla", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Service Desk", path: "/service" }, { label: "SLA", path: "/service/sla" }] },
  
  customerPortal: { id: "customerPortal", name: "Customer Portal", apiEndpoint: "/api/portal", fields: [], searchFields: ["customer", "status", "type"], displayField: "customer", createButtonText: "", module: "ServiceDesk", page: "/service/portal", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Service Desk", path: "/service" }, { label: "Portal", path: "/service/portal" }] },
  
  shippingManagement: { id: "shippingManagement", name: "Shipping Management", apiEndpoint: "/api/shipping", fields: [], searchFields: ["trackingId", "destination", "status"], displayField: "trackingId", createButtonText: "Create Shipment", module: "Procurement", page: "/procurement/shipping", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Procurement", path: "/procurement" }, { label: "Shipping", path: "/procurement/shipping" }] },
  
  productionSchedule: { id: "productionSchedule", name: "Production Schedule", apiEndpoint: "/api/schedule", fields: [], searchFields: ["product", "period", "status"], displayField: "product", createButtonText: "Create Schedule", module: "Manufacturing", page: "/manufacturing/schedule", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Manufacturing", path: "/manufacturing" }, { label: "Schedule", path: "/manufacturing/schedule" }] },
  
  contractManagement: { id: "contractManagement", name: "Contract Management", apiEndpoint: "/api/contracts", fields: [], searchFields: ["vendor", "type", "status"], displayField: "vendor", createButtonText: "Create Contract", module: "Procurement", page: "/procurement/contracts", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Procurement", path: "/procurement" }, { label: "Contracts", path: "/procurement/contracts" }] },
  
  roleManagement: { id: "roleManagement", name: "Role Management", apiEndpoint: "/api/roles", fields: [], searchFields: ["name", "type", "status"], displayField: "name", createButtonText: "Create Role", module: "Admin", page: "/admin/roles", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Admin", path: "/admin" }, { label: "Roles", path: "/admin/roles" }] },
  
  incidentManagement: { id: "incidentManagement", name: "Incident Management", apiEndpoint: "/api/incidents", fields: [], searchFields: ["id", "title", "severity"], displayField: "title", createButtonText: "Report Incident", module: "ServiceDesk", page: "/service/incidents", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Service Desk", path: "/service" }, { label: "Incidents", path: "/service/incidents" }] },

  feedbackManagement: { id: "feedbackManagement", name: "Feedback Management", apiEndpoint: "/api/feedback", fields: [], searchFields: ["source", "status", "rating"], displayField: "source", createButtonText: "Add Feedback", module: "ServiceDesk", page: "/service/feedback", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Service Desk", path: "/service" }, { label: "Feedback", path: "/service/feedback" }] },

  ticketDashboard: { id: "ticketDashboard", name: "Ticket Dashboard", apiEndpoint: "/api/tickets/dashboard", fields: [], searchFields: ["status", "priority"], displayField: "status", createButtonText: "", module: "ServiceDesk", page: "/service/ticket-dashboard", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Service Desk", path: "/service" }, { label: "Ticket Dashboard", path: "/service/ticket-dashboard" }] },

  talentPool: { id: "talentPool", name: "Talent Pool", apiEndpoint: "/api/talent", fields: [], searchFields: ["name", "readiness"], displayField: "name", createButtonText: "", module: "HR", page: "/hr/talent-pool", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "HR", path: "/hr" }, { label: "Talent", path: "/hr/talent-pool" }] },

  attendanceDashboard: { id: "attendanceDashboard", name: "Attendance Dashboard", apiEndpoint: "/api/attendance", fields: [], searchFields: ["employee", "status"], displayField: "employee", createButtonText: "", module: "HR", page: "/hr/attendance", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "HR", path: "/hr" }, { label: "Attendance", path: "/hr/attendance" }] },

  hrAnalytics: { id: "hrAnalytics", name: "HR Analytics", apiEndpoint: "/api/hr/analytics", fields: [], searchFields: ["metric", "period"], displayField: "metric", createButtonText: "", module: "HR", page: "/hr/analytics", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "HR", path: "/hr" }, { label: "Analytics", path: "/hr/analytics" }] },

  serviceAnalytics: { id: "serviceAnalytics", name: "Service Analytics", apiEndpoint: "/api/service/analytics", fields: [], searchFields: ["metric", "period"], displayField: "metric", createButtonText: "", module: "ServiceDesk", page: "/service/analytics", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Service Desk", path: "/service" }, { label: "Analytics", path: "/service/analytics" }] },

  salesAnalytics: { id: "salesAnalytics", name: "Sales Analytics", apiEndpoint: "/api/sales/analytics", fields: [], searchFields: ["metric", "period"], displayField: "metric", createButtonText: "", module: "CRM", page: "/crm/sales-analytics", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "CRM", path: "/crm" }, { label: "Analytics", path: "/crm/sales-analytics" }] },

  operationalAnalytics: { id: "operationalAnalytics", name: "Operational Analytics", apiEndpoint: "/api/operations/analytics", fields: [], searchFields: ["metric", "period"], displayField: "metric", createButtonText: "", module: "Operations", page: "/operations/analytics", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Operations", path: "/operations" }, { label: "Analytics", path: "/operations/analytics" }] },

  dataExplorer: { id: "dataExplorer", name: "Data Explorer", apiEndpoint: "/api/data/explorer", fields: [], searchFields: ["dataset", "type"], displayField: "dataset", createButtonText: "", module: "Analytics", page: "/analytics/explorer", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Analytics", path: "/analytics" }, { label: "Explorer", path: "/analytics/explorer" }] },

  exportManager: { id: "exportManager", name: "Export Manager", apiEndpoint: "/api/exports", fields: [], searchFields: ["name", "format", "status"], displayField: "name", createButtonText: "Create Export", module: "Analytics", page: "/analytics/exports", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Analytics", path: "/analytics" }, { label: "Exports", path: "/analytics/exports" }] },

  scheduledReports: { id: "scheduledReports", name: "Scheduled Reports", apiEndpoint: "/api/reports/scheduled", fields: [], searchFields: ["name", "frequency", "status"], displayField: "name", createButtonText: "Schedule Report", module: "Analytics", page: "/analytics/reports", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Analytics", path: "/analytics" }, { label: "Reports", path: "/analytics/reports" }] },

  workflowExecution: { id: "workflowExecution", name: "Workflow Execution", apiEndpoint: "/api/workflow/execution", fields: [], searchFields: ["id", "status", "type"], displayField: "id", createButtonText: "", module: "Workflow", page: "/workflow/execution", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Workflow", path: "/workflow" }, { label: "Execution", path: "/workflow/execution" }] },

  webhookManagement: { id: "webhookManagement", name: "Webhook Management", apiEndpoint: "/api/webhooks", fields: [], searchFields: ["name", "event", "status"], displayField: "name", createButtonText: "Add Webhook", module: "Developer", page: "/developer/webhooks", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Developer", path: "/developer" }, { label: "Webhooks", path: "/developer/webhooks" }] },

  apiLogs: { id: "apiLogs", name: "API Logs", apiEndpoint: "/api/logs", fields: [], searchFields: ["endpoint", "method", "status"], displayField: "endpoint", createButtonText: "", module: "Developer", page: "/developer/logs", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Developer", path: "/developer" }, { label: "Logs", path: "/developer/logs" }] },

  rateLimiting: { id: "rateLimiting", name: "Rate Limiting", apiEndpoint: "/api/rate-limits", fields: [], searchFields: ["endpoint", "limit", "status"], displayField: "endpoint", createButtonText: "Add Limit", module: "Developer", page: "/developer/rate-limits", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Developer", path: "/developer" }, { label: "Rate Limits", path: "/developer/rate-limits" }] },

  backupRestore: { id: "backupRestore", name: "Backup & Restore", apiEndpoint: "/api/backup", fields: [], searchFields: ["name", "date", "status"], displayField: "name", createButtonText: "Create Backup", module: "Admin", page: "/admin/backup", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Admin", path: "/admin" }, { label: "Backup", path: "/admin/backup" }] },

  marketplace: { id: "marketplace", name: "Marketplace", apiEndpoint: "/api/marketplace", fields: [], searchFields: ["name", "category", "rating"], displayField: "name", createButtonText: "", module: "Integrations", page: "/integrations/marketplace", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Integrations", path: "/integrations" }, { label: "Marketplace", path: "/integrations/marketplace" }] },

  shopFloor: { id: "shopFloor", name: "Shop Floor", apiEndpoint: "/api/shop-floor", fields: [], searchFields: ["line", "status", "product"], displayField: "line", createButtonText: "", module: "Manufacturing", page: "/manufacturing/shop-floor", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Manufacturing", path: "/manufacturing" }, { label: "Shop Floor", path: "/manufacturing/shop-floor" }] },

  accountHierarchy: { id: "accountHierarchy", name: "Account Hierarchy", apiEndpoint: "/api/accounts/hierarchy", fields: [], searchFields: ["name", "type", "parent"], displayField: "name", createButtonText: "", module: "CRM", page: "/crm/account-hierarchy", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "CRM", path: "/crm" }, { label: "Hierarchy", path: "/crm/account-hierarchy" }] },

  apiDocumentation: { id: "apiDocumentation", name: "API Documentation", apiEndpoint: "/api/docs", fields: [], searchFields: ["endpoint", "method"], displayField: "endpoint", createButtonText: "", module: "Developer", page: "/developer/docs", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Developer", path: "/developer" }, { label: "Documentation", path: "/developer/docs" }] },

  apiGateway: { id: "apiGateway", name: "API Gateway", apiEndpoint: "/api/gateway", fields: [], searchFields: ["name", "status", "method"], displayField: "name", createButtonText: "Add Route", module: "Developer", page: "/developer/gateway", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Developer", path: "/developer" }, { label: "Gateway", path: "/developer/gateway" }] },

  auditTrails: { id: "auditTrails", name: "Audit Trails", apiEndpoint: "/api/audit-trails", fields: [], searchFields: ["user", "action", "resource"], displayField: "action", createButtonText: "", module: "Governance", page: "/governance/audit-trails", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Governance", path: "/governance" }, { label: "Audit", path: "/governance/audit-trails" }] },

  backendIntegration: { id: "backendIntegration", name: "Backend Integration", apiEndpoint: "/api/integrations", fields: [], searchFields: ["name", "type", "status"], displayField: "name", createButtonText: "Add Integration", module: "Admin", page: "/admin/integrations", allowCreate: true, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Admin", path: "/admin" }, { label: "Integrations", path: "/admin/integrations" }] },

  invoiceDetail: { id: "invoiceDetail", name: "Invoice Detail", apiEndpoint: "/api/invoices", fields: [], searchFields: ["number", "customer", "status"], displayField: "number", createButtonText: "", module: "Finance", page: "/finance/invoice-detail", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Finance", path: "/finance" }, { label: "Invoices", path: "/finance/invoice-detail" }] },

  responsAnalytics: { id: "responseAnalytics", name: "Response Analytics", apiEndpoint: "/api/response/analytics", fields: [], searchFields: ["metric", "period"], displayField: "metric", createButtonText: "", module: "ServiceDesk", page: "/service/response-analytics", allowCreate: false, showSearch: true, breadcrumbs: [{ label: "Dashboard", path: "/" }, { label: "Service Desk", path: "/service" }, { label: "Response", path: "/service/response-analytics" }] },
};

export function getFormMetadata(formId: string): FormMetadata | undefined {
  return formMetadataRegistry[formId];
}

export function getModuleForms(module: string): FormMetadata[] {
  return Object.values(formMetadataRegistry).filter(f => f.module === module);
}
