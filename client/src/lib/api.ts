import { apiRequest } from "./queryClient";

const API_BASE = import.meta.env.VITE_API_URL || "";

export const api = {
  // ERP
  erp: {
    glEntries: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/erp/gl-entries`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/erp/gl-entries`, { credentials: "include" }).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/erp/gl-entries/${id}`, { credentials: "include" }).then(r => r.json()),
      update: (id: string, data: any) => apiRequest("PUT", `${API_BASE}/api/erp/gl-entries/${id}`, data).then(r => r.json()),
      delete: (id: string) => apiRequest("DELETE", `${API_BASE}/api/erp/gl-entries/${id}`, undefined),
    },
    invoices: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/erp/invoices`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/erp/invoices`, { credentials: "include" }).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/erp/invoices/${id}`, { credentials: "include" }).then(r => r.json()),
      update: (id: string, data: any) => apiRequest("PUT", `${API_BASE}/api/erp/invoices/${id}`, data).then(r => r.json()),
      delete: (id: string) => apiRequest("DELETE", `${API_BASE}/api/erp/invoices/${id}`, undefined),
    },
  },

  // EPM
  epm: {
    budgets: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/epm/budgets`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/epm/budgets`, { credentials: "include" }).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/epm/budgets/${id}`, { credentials: "include" }).then(r => r.json()),
      update: (id: string, data: any) => apiRequest("PUT", `${API_BASE}/api/epm/budgets/${id}`, data).then(r => r.json()),
      delete: (id: string) => apiRequest("DELETE", `${API_BASE}/api/epm/budgets/${id}`, undefined),
    },
    forecasts: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/epm/forecasts`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/epm/forecasts`, { credentials: "include" }).then(r => r.json()),
    },
    scenarios: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/epm/scenarios`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/epm/scenarios`, { credentials: "include" }).then(r => r.json()),
    },
  },

  // CRM
  crm: {
    leads: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/crm/leads`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/crm/leads`, { credentials: "include" }).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/crm/leads/${id}`, { credentials: "include" }).then(r => r.json()),
      update: (id: string, data: any) => apiRequest("PUT", `${API_BASE}/api/crm/leads/${id}`, data).then(r => r.json()),
      delete: (id: string) => apiRequest("DELETE", `${API_BASE}/api/crm/leads/${id}`, undefined),
    },
    opportunities: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/crm/opportunities`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/crm/opportunities`, { credentials: "include" }).then(r => r.json()),
    },
  },

  // HR
  hr: {
    employees: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/hr/employees`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/hr/employees`, { credentials: "include" }).then(r => r.json()),
    },
    leaves: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/hr/leaves`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/hr/leaves`, { credentials: "include" }).then(r => r.json()),
    },
    timesheets: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/hr/timesheets`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/hr/timesheets`, { credentials: "include" }).then(r => r.json()),
    },
  },

  // Projects
  projects: {
    tasks: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/projects/tasks`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/projects/tasks`, { credentials: "include" }).then(r => r.json()),
    },
  },

  // Service
  service: {
    tickets: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/service/tickets`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/service/tickets`, { credentials: "include" }).then(r => r.json()),
    },
  },

  // Marketing
  marketing: {
    campaigns: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/marketing/campaigns`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/marketing/campaigns`, { credentials: "include" }).then(r => r.json()),
    },
  },

  // Finance
  finance: {
    expenses: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/finance/expenses`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/finance/expenses`, { credentials: "include" }).then(r => r.json()),
    },
  },

  // Accounts Payable (AP)
  ap: {
    suppliers: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/ap/suppliers`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/ap/suppliers`, { credentials: "include" }).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/ap/suppliers/${id}`, { credentials: "include" }).then(r => r.json()),
      // update: (id: string, data: any) => apiRequest("PUT", `${API_BASE}/api/ap/suppliers/${id}`, data).then(r => r.json()),
    },
    invoices: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/ap/invoices`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/ap/invoices`, { credentials: "include" }).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/ap/invoices/${id}`, { credentials: "include" }).then(r => r.json()),
      approve: (id: string, comments?: string) => apiRequest("POST", `${API_BASE}/api/ap/invoices/${id}/approve`, { comments }).then(r => r.json()),
      validate: (id: string) => apiRequest("POST", `${API_BASE}/api/ap/invoices/${id}/validate`, {}).then(r => r.json()),
      match: (id: string, data: any) => apiRequest("POST", `${API_BASE}/api/ap/invoices/${id}/match`, data).then(r => r.json()),
      getHolds: (id: string) => fetch(`${API_BASE}/api/ap/invoices/${id}/holds`, { credentials: "include" }).then(r => r.json()),
    },
    holds: {
      release: (id: string, releaseCode: string) => apiRequest("POST", `${API_BASE}/api/ap/holds/${id}/release`, { releaseCode }).then(r => r.json()),
    },
    payments: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/ap/payments`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/ap/payments`, { credentials: "include" }).then(r => r.json()),
    },
    ai: {
      simulate: (action: string) => apiRequest("POST", `${API_BASE}/api/ap/ai/simulate`, { action }).then(r => r.json()),
    },
    paymentBatches: {
      list: () => fetch(`${API_BASE}/api/ap/payment-batches`, { credentials: "include" }).then(r => r.json()),
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/ap/payment-batches`, data).then(r => r.json()),
      select: (id: string | number) => apiRequest("POST", `${API_BASE}/api/ap/payment-batches/${id}/select`, {}).then(r => r.json()),
      confirm: (id: string | number) => apiRequest("POST", `${API_BASE}/api/ap/payment-batches/${id}/confirm`, {}).then(r => r.json()),
    },
  },

  // Accounts Receivable (AR)
  ar: {
    customers: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/ar/customers`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/ar/customers`, { credentials: "include" }).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/ar/customers/${id}`, { credentials: "include" }).then(r => r.json()),
    },
    invoices: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/ar/invoices`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/ar/invoices`, { credentials: "include" }).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/ar/invoices/${id}`, { credentials: "include" }).then(r => r.json()),
    },
    receipts: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/ar/receipts`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/ar/receipts`, { credentials: "include" }).then(r => r.json()),
    },
  },

  // Inventory
  inventory: {
    products: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/inventory/products`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/inventory/products`, { credentials: "include" }).then(r => r.json()),
    },
  },

  // Procurement
  procurement: {
    purchaseOrders: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/procurement/purchase-orders`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/procurement/purchase-orders`, { credentials: "include" }).then(r => r.json()),
    },
  },

  // Industries
  industries: {
    list: () => fetch(`${API_BASE}/api/industries`, { credentials: "include" }).then(r => r.json()),
    get: (id: string) => fetch(`${API_BASE}/api/industries/${id}`, { credentials: "include" }).then(r => r.json()),
    getModules: (id: string) => fetch(`${API_BASE}/api/industries/${id}/modules`, { credentials: "include" }).then(r => r.json()),
    getCapabilities: (id: string) => fetch(`${API_BASE}/api/industries/${id}/capabilities`, { credentials: "include" }).then(r => r.json()),
  },

  // Configuration
  configuration: {
    save: (data: any) => apiRequest("POST", `${API_BASE}/api/configuration`, data).then(r => r.json()),
    getByTenantAndIndustry: (tenantId: string, industryId: string) =>
      fetch(`${API_BASE}/api/configuration/tenant/${tenantId}/industry/${industryId}`, { credentials: "include" }).then(r => r.json()),
    getByTenant: (tenantId: string) =>
      fetch(`${API_BASE}/api/configuration/tenant/${tenantId}`, { credentials: "include" }).then(r => r.json()),
  },

  // Health
  health: {
    status: () => fetch(`${API_BASE}/api/health`, { credentials: "include" }).then(r => r.json()),
    diagnostics: () => fetch(`${API_BASE}/api/health/diagnostics`, { credentials: "include" }).then(r => r.json()),
  },
};
