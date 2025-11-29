import { apiRequest } from "./queryClient";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const api = {
  // ERP - GL Entries
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

  // EPM - Budgets
  epm: {
    budgets: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/epm/budgets`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/epm/budgets`, { credentials: "include" }).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/epm/budgets/${id}`, { credentials: "include" }).then(r => r.json()),
      update: (id: string, data: any) => apiRequest("PUT", `${API_BASE}/api/epm/budgets/${id}`, data).then(r => r.json()),
      delete: (id: string) => apiRequest("DELETE", `${API_BASE}/api/epm/budgets/${id}`, undefined),
    },
  },

  // CRM - Leads
  crm: {
    leads: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/crm/leads`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/crm/leads`, { credentials: "include" }).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/crm/leads/${id}`, { credentials: "include" }).then(r => r.json()),
      update: (id: string, data: any) => apiRequest("PUT", `${API_BASE}/api/crm/leads/${id}`, data).then(r => r.json()),
      delete: (id: string) => apiRequest("DELETE", `${API_BASE}/api/crm/leads/${id}`, undefined),
    },
  },

  // Health
  health: {
    status: () => fetch(`${API_BASE}/api/health`, { credentials: "include" }).then(r => r.json()),
    diagnostics: () => fetch(`${API_BASE}/api/health/diagnostics`, { credentials: "include" }).then(r => r.json()),
  },
};
