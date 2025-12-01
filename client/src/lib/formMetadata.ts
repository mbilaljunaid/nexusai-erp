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
};

export function getFormMetadata(formId: string): FormMetadata | undefined {
  return formMetadataRegistry[formId];
}

export function getModuleForms(module: string): FormMetadata[] {
  return Object.values(formMetadataRegistry).filter(f => f.module === module);
}
