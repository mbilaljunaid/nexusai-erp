// Form metadata system - defines searchable fields and configuration for each form
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
}

// Define form metadata for all major forms
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
  },

  vendor: {
    id: "vendor",
    name: "Vendor",
    apiEndpoint: "/api/suppliers",
    fields: [
      { name: "vendorName", label: "Vendor Name", type: "text", required: true, searchable: true },
      { name: "email", label: "Email", type: "email", required: true, searchable: true },
      { name: "phone", label: "Phone", type: "text", required: true, searchable: true },
      { name: "paymentTerms", label: "Payment Terms", type: "select", required: false, searchable: false },
      { name: "bankAccount", label: "Bank Account", type: "text", required: false, searchable: false },
      { name: "category", label: "Category", type: "select", required: false, searchable: false },
      { name: "status", label: "Status", type: "select", required: false, searchable: false },
    ],
    searchFields: ["vendorName", "email", "phone"],
    displayField: "vendorName",
    createButtonText: "Add Vendor",
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
    searchFields: ["name", "accountId"],
    displayField: "name",
    createButtonText: "Add Opportunity",
  },

  campaign: {
    id: "campaign",
    name: "Campaign",
    apiEndpoint: "/api/marketing/campaigns",
    fields: [
      { name: "campaignName", label: "Campaign Name", type: "text", required: true, searchable: true },
      { name: "campaignType", label: "Campaign Type", type: "select", required: true, searchable: false },
      { name: "startDate", label: "Start Date", type: "date", required: true, searchable: false },
      { name: "endDate", label: "End Date", type: "date", required: true, searchable: false },
      { name: "budget", label: "Budget", type: "number", required: true, searchable: false },
      { name: "status", label: "Status", type: "select", required: false, searchable: false },
    ],
    searchFields: ["campaignName", "campaignType"],
    displayField: "campaignName",
    createButtonText: "Create Campaign",
  },

  budget: {
    id: "budget",
    name: "Budget",
    apiEndpoint: "/api/finance/budgets",
    fields: [
      { name: "budgetCycle", label: "Budget Cycle", type: "select", required: true, searchable: false },
      { name: "department", label: "Department", type: "select", required: true, searchable: true },
      { name: "costCenter", label: "Cost Center", type: "select", required: false, searchable: true },
      { name: "totalBudget", label: "Total Budget", type: "number", required: true, searchable: false },
    ],
    searchFields: ["department", "costCenter", "budgetCycle"],
    displayField: "department",
    createButtonText: "Create Budget",
  },
};

// Get searchable field labels for a form
export function getSearchableFields(formId: string): FormFieldConfig[] {
  const metadata = formMetadataRegistry[formId];
  if (!metadata) return [];
  return metadata.fields.filter(f => f.searchable);
}

// Build search query across all searchable fields
export function buildSearchQuery(query: string, formId: string, items: any[]): any[] {
  const metadata = formMetadataRegistry[formId];
  if (!metadata || !query) return items;

  const searchFields = metadata.searchFields;
  const lowerQuery = query.toLowerCase();

  return items.filter(item =>
    searchFields.some(field =>
      (item[field] || "").toString().toLowerCase().includes(lowerQuery)
    )
  );
}
