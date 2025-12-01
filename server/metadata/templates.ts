/**
 * Metadata Templates for Form Categories - Phase 1 Deliverable
 * Templates for rapid metadata generation across 810 forms
 */

import { FormMetadataAdvanced, FormFieldConfig, WorkflowTransition } from "@shared/types/metadata";
import { getGLMappingsForForm } from "./glMappings";

/**
 * Category A: Simple Master Data Template (600 forms)
 * Examples: Industries, Regions, Statuses, Tags, Customers, Vendors
 */
export function createSimpleMasterDataMetadata(
  id: string,
  name: string,
  module: string,
  description?: string
): FormMetadataAdvanced {
  return {
    id,
    name,
    apiEndpoint: `/api/${id.toLowerCase()}`,
    description: description || `Manage ${name.toLowerCase()}`,
    module,
    page: `/${module.toLowerCase()}/${id.toLowerCase()}`,
    version: 1,
    status: "active",

    fields: [
      {
        name: "name",
        label: "Name",
        type: "text",
        required: true,
        searchable: true,
        placeholder: `Enter ${name.toLowerCase()}`,
        category: "Basic Information",
        validations: [
          { type: "required", message: `${name} name is required` },
          { type: "min", value: 1, message: `${name} name cannot be empty` },
        ],
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: false,
        searchable: true,
        placeholder: "Optional description",
        category: "Basic Information",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: false,
        searchable: true,
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Draft", value: "draft" },
        ],
        defaultValue: "active",
        category: "Status",
      },
      {
        name: "code",
        label: "Code",
        type: "text",
        required: false,
        searchable: true,
        placeholder: "Unique code (optional)",
        category: "Identification",
      },
    ],

    searchFields: ["name", "code"],
    displayField: "name",
    createButtonText: `Create ${name}`,
    allowCreate: true,
    showSearch: true,

    sections: [
      {
        name: "basic",
        title: "Basic Information",
        fields: ["name", "description"],
      },
      {
        name: "status",
        title: "Status",
        fields: ["status", "code"],
      },
    ],

    theme: {
      layout: "single-column",
      width: "md",
      showHeader: true,
      showBreadcrumbs: true,
    },

    permissions: {
      create: ["admin", "manager"],
      edit: ["admin", "manager", "owner"],
      delete: ["admin"],
      view: ["everyone"],
    },

    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: module, path: `/${module.toLowerCase()}` },
      { label: name, path: `/${module.toLowerCase()}/${id.toLowerCase()}` },
    ],

    auditFields: true,
    trackChanges: true,
  };
}

/**
 * Category B: Standard Transaction Template (150 forms)
 * Examples: Invoices, Orders, POs, Leads, Expenses, Requisitions
 */
export function createStandardTransactionMetadata(
  id: string,
  name: string,
  module: string,
  fields: FormFieldConfig[],
  options?: {
    description?: string;
    requiresGL?: boolean;
    hasWorkflow?: boolean;
    linkedForms?: any[];
  }
): FormMetadataAdvanced {
  const glMappings = options?.requiresGL ? getGLMappingsForForm(id) : undefined;

  return {
    id,
    name,
    apiEndpoint: `/api/${id.toLowerCase()}`,
    description: options?.description || `Manage ${name.toLowerCase()}`,
    module,
    page: `/${module.toLowerCase()}/${id.toLowerCase()}`,
    version: 1,
    status: "active",

    fields,
    searchFields: ["name", "number", "status"].filter((f) =>
      fields.some((field) => field.name === f)
    ),
    displayField: fields.find((f) => f.name === "number" || f.name === "name")?.name || fields[0].name,
    createButtonText: `Create ${name}`,
    allowCreate: true,
    showSearch: true,

    sections: [
      {
        name: "basic",
        title: "Basic Information",
        fields: fields
          .filter((f) => ["number", "name", "description"].includes(f.name))
          .map((f) => f.name),
      },
      {
        name: "details",
        title: "Details",
        fields: fields
          .filter((f) => !["number", "name", "description", "status"].includes(f.name))
          .map((f) => f.name),
      },
      {
        name: "status",
        title: "Status & Administration",
        fields: fields.filter((f) => f.name === "status").map((f) => f.name),
      },
    ],

    theme: {
      layout: "two-column",
      width: "lg",
      showHeader: true,
      showBreadcrumbs: true,
    },

    // GL Configuration if required
    ...(options?.requiresGL &&
      glMappings && {
        glConfig: {
          autoCreateGL: true,
          requireBalance: true,
          glMappings,
        },
      }),

    // Workflow if required
    ...(options?.hasWorkflow && {
      statusWorkflow: [
        {
          fromStatus: "draft",
          toStatus: "submitted",
          permissions: ["creator", "manager"],
        },
        {
          fromStatus: "submitted",
          toStatus: "approved",
          permissions: ["manager", "admin"],
        },
        {
          fromStatus: "approved",
          toStatus: "active",
          permissions: ["system"],
        },
        {
          fromStatus: "active",
          toStatus: "completed",
          permissions: ["creator", "manager"],
        },
      ],
      initialStatus: "draft",
      allowedStatuses: ["draft", "submitted", "approved", "active", "completed", "cancelled"],
    }),

    // Linked forms if provided
    ...(options?.linkedForms && {
      linkedForms: options.linkedForms,
    }),

    permissions: {
      create: ["admin", "manager"],
      edit: ["admin", "manager", "owner"],
      delete: ["admin"],
      view: ["everyone"],
    },

    onSubmitActions: [
      ...(options?.requiresGL ? [{ type: "createGL", config: { useGLConfig: true } }] : []),
      { type: "sendNotification", config: { recipient: "owner", template: "record_created" } },
    ],

    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: module, path: `/${module.toLowerCase()}` },
      { label: name, path: `/${module.toLowerCase()}/${id.toLowerCase()}` },
    ],

    auditFields: true,
    trackChanges: true,
    retentionDays: 2555, // 7 years
  };
}

/**
 * Invoice Metadata - Category B Example
 */
export function createInvoiceMetadata(): FormMetadataAdvanced {
  return createStandardTransactionMetadata(
    "invoices",
    "Invoices",
    "Finance",
    [
      {
        name: "invoiceNumber",
        label: "Invoice Number",
        type: "text",
        required: true,
        searchable: true,
        placeholder: "INV-2024-001",
        validations: [
          { type: "required", message: "Invoice number is required" },
          { type: "pattern", value: "^INV-\\d{4}-\\d{3}$", message: "Format: INV-YYYY-###" },
        ],
      },
      {
        name: "customerId",
        label: "Customer",
        type: "select",
        required: true,
        searchable: true,
        linkedEntity: "customers",
        linkedField: "id",
        optionLabelField: "name",
        optionValueField: "id",
        optionsEndpoint: "/api/customers",
        validations: [{ type: "required", message: "Customer is required" }],
      },
      {
        name: "amount",
        label: "Amount",
        type: "number",
        required: true,
        searchable: false,
        placeholder: "0.00",
        validations: [
          { type: "required", message: "Amount is required" },
          { type: "min", value: 0.01, message: "Amount must be greater than 0" },
        ],
      },
      {
        name: "dueDate",
        label: "Due Date",
        type: "date",
        required: false,
        searchable: false,
        validations: [{ type: "custom", message: "Due date must be after today" }],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: false,
        searchable: true,
        options: [
          { label: "Draft", value: "draft" },
          { label: "Sent", value: "sent" },
          { label: "Paid", value: "paid" },
          { label: "Overdue", value: "overdue" },
          { label: "Cancelled", value: "cancelled" },
        ],
        defaultValue: "draft",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: false,
        searchable: true,
        placeholder: "Invoice notes",
      },
    ],
    {
      description: "Create and manage customer invoices",
      requiresGL: true,
      hasWorkflow: true,
      linkedForms: [
        {
          targetFormId: "payments",
          relationshipType: "child",
          linkField: "invoiceId",
          displayField: "paymentNumber",
        },
      ],
    }
  );
}

/**
 * Employee Metadata - Category B Example
 */
export function createEmployeeMetadata(): FormMetadataAdvanced {
  return createStandardTransactionMetadata(
    "employees",
    "Employees",
    "HR",
    [
      {
        name: "employeeId",
        label: "Employee ID",
        type: "text",
        required: true,
        searchable: true,
        placeholder: "EMP-001",
        readOnly: true,
      },
      {
        name: "firstName",
        label: "First Name",
        type: "text",
        required: true,
        searchable: true,
        validations: [{ type: "required", message: "First name is required" }],
      },
      {
        name: "lastName",
        label: "Last Name",
        type: "text",
        required: true,
        searchable: true,
        validations: [{ type: "required", message: "Last name is required" }],
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        searchable: true,
        validations: [
          { type: "required", message: "Email is required" },
          { type: "email", message: "Invalid email format" },
        ],
      },
      {
        name: "department",
        label: "Department",
        type: "select",
        required: true,
        searchable: true,
        linkedEntity: "departments",
      },
      {
        name: "jobTitle",
        label: "Job Title",
        type: "text",
        required: false,
        searchable: true,
      },
      {
        name: "hireDate",
        label: "Hire Date",
        type: "date",
        required: true,
        searchable: false,
      },
      {
        name: "salary",
        label: "Salary",
        type: "number",
        required: true,
        searchable: false,
        validations: [{ type: "min", value: 0, message: "Salary must be positive" }],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: false,
        options: [
          { label: "Active", value: "active" },
          { label: "On Leave", value: "on_leave" },
          { label: "Terminated", value: "terminated" },
        ],
        defaultValue: "active",
      },
    ],
    {
      description: "Manage employee records and information",
      requiresGL: false,
      hasWorkflow: true,
      linkedForms: [
        {
          targetFormId: "payroll",
          relationshipType: "child",
          linkField: "employeeId",
          displayField: "payrollId",
        },
      ],
    }
  );
}

/**
 * Purchase Order Metadata - Category B Example
 */
export function createPurchaseOrderMetadata(): FormMetadataAdvanced {
  return createStandardTransactionMetadata(
    "purchaseOrders",
    "Purchase Orders",
    "Procurement",
    [
      {
        name: "poNumber",
        label: "PO Number",
        type: "text",
        required: true,
        searchable: true,
        placeholder: "PO-2024-001",
      },
      {
        name: "vendorId",
        label: "Vendor",
        type: "select",
        required: true,
        searchable: true,
        linkedEntity: "vendors",
      },
      {
        name: "itemName",
        label: "Item",
        type: "text",
        required: true,
        searchable: true,
      },
      {
        name: "quantity",
        label: "Quantity",
        type: "number",
        required: true,
        searchable: false,
        validations: [{ type: "min", value: 1, message: "Quantity must be at least 1" }],
      },
      {
        name: "unitPrice",
        label: "Unit Price",
        type: "number",
        required: true,
        searchable: false,
      },
      {
        name: "amount",
        label: "Total Amount",
        type: "calculated",
        required: false,
        searchable: false,
        formula: "quantity * unitPrice",
        readOnly: true,
      },
      {
        name: "deliveryDate",
        label: "Expected Delivery",
        type: "date",
        required: false,
        searchable: false,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: false,
        options: [
          { label: "Draft", value: "draft" },
          { label: "Submitted", value: "submitted" },
          { label: "Approved", value: "approved" },
          { label: "Received", value: "received" },
          { label: "Cancelled", value: "cancelled" },
        ],
        defaultValue: "draft",
      },
    ],
    {
      description: "Create purchase orders for vendor procurement",
      requiresGL: true,
      hasWorkflow: true,
    }
  );
}

/**
 * Payroll Metadata - Category B Example
 */
export function createPayrollMetadata(): FormMetadataAdvanced {
  return createStandardTransactionMetadata(
    "payroll",
    "Payroll",
    "HR",
    [
      {
        name: "payrollPeriod",
        label: "Payroll Period",
        type: "text",
        required: true,
        searchable: true,
        placeholder: "2024-01",
      },
      {
        name: "employeeId",
        label: "Employee",
        type: "select",
        required: true,
        searchable: true,
        linkedEntity: "employees",
      },
      {
        name: "grossAmount",
        label: "Gross Amount",
        type: "number",
        required: true,
        searchable: false,
        validations: [{ type: "min", value: 0, message: "Gross amount must be positive" }],
      },
      {
        name: "deductions",
        label: "Deductions",
        type: "number",
        required: false,
        searchable: false,
        defaultValue: 0,
      },
      {
        name: "taxWithheld",
        label: "Tax Withheld",
        type: "number",
        required: false,
        searchable: false,
        defaultValue: 0,
      },
      {
        name: "netAmount",
        label: "Net Amount",
        type: "calculated",
        required: false,
        searchable: false,
        formula: "grossAmount - deductions - taxWithheld",
        readOnly: true,
      },
      {
        name: "paymentDate",
        label: "Payment Date",
        type: "date",
        required: true,
        searchable: false,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: false,
        options: [
          { label: "Draft", value: "draft" },
          { label: "Approved", value: "approved" },
          { label: "Paid", value: "paid" },
        ],
        defaultValue: "draft",
      },
    ],
    {
      description: "Process employee payroll",
      requiresGL: true,
      hasWorkflow: true,
    }
  );
}
