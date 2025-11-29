import { apiRequest } from "./queryClient";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

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

  // Health
  health: {
    status: () => fetch(`${API_BASE}/api/health`, { credentials: "include" }).then(r => r.json()),
    diagnostics: () => fetch(`${API_BASE}/api/health/diagnostics`, { credentials: "include" }).then(r => r.json()),
  },
};
