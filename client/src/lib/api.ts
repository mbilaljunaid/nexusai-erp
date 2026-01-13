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
    accounts: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/ar/accounts`, data).then(r => r.json()),
      list: (customerId?: string) => fetch(`${API_BASE}/api/ar/accounts${customerId ? `?customerId=${customerId}` : ""}`, { credentials: "include" }).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/ar/accounts/${id}`, { credentials: "include" }).then(r => r.json()),
      toggleHold: (id: string, hold: boolean) => apiRequest("POST", `${API_BASE}/api/ar/accounts/${id}/hold`, { hold }).then(r => r.json()),
    },
    sites: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/ar/sites`, data).then(r => r.json()),
      list: (accountId: string) => fetch(`${API_BASE}/api/ar/sites?accountId=${accountId}`, { credentials: "include" }).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/ar/sites/${id}`, { credentials: "include" }).then(r => r.json()),
    },
    invoices: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/ar/invoices`, data).then(r => r.json()),
      createCreditMemo: (data: any) => apiRequest("POST", `${API_BASE}/api/ar/invoices/credit-memo`, data).then(r => r.json()),
      createDebitMemo: (data: any) => apiRequest("POST", `${API_BASE}/api/ar/invoices/debit-memo`, data).then(r => r.json()),
      createChargeback: (data: any) => apiRequest("POST", `${API_BASE}/api/ar/invoices/chargeback`, data).then(r => r.json()),
      list: (params?: { limit?: number; offset?: number }) => {
        const query = params ? `?limit=${params.limit}&offset=${params.offset}` : "";
        return fetch(`${API_BASE}/api/ar/invoices${query}`, { credentials: "include" }).then(r => r.json());
      },
      get: (id: string) => fetch(`${API_BASE}/api/ar/invoices/${id}`, { credentials: "include" }).then(r => r.json()),
      getAccounting: (id: string) => fetch(`${API_BASE}/api/ar/invoices/${id}/accounting`, { credentials: "include" }).then(r => r.json()),
      createAdjustment: (data: any) => apiRequest("POST", `${API_BASE}/api/ar/adjustments`, data).then(r => r.json()),
      listAdjustments: (invoiceId: string) => fetch(`${API_BASE}/api/ar/adjustments?invoiceId=${invoiceId}`, { credentials: "include" }).then(r => r.json()),
    },
    receipts: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/ar/receipts`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/ar/receipts`, { credentials: "include" }).then(r => r.json()),
      getAccounting: (id: string) => fetch(`${API_BASE}/api/ar/receipts/${id}/accounting`, { credentials: "include" }).then(r => r.json()),
    },
    revenueSchedules: {
      list: (invoiceId?: string) => fetch(`${API_BASE}/api/ar/revenue-schedules${invoiceId ? `?invoiceId=${invoiceId}` : ""}`, { credentials: "include" }).then(r => r.json()),
      recognize: (id: string | number) => apiRequest("POST", `${API_BASE}/api/ar/revenue-schedules/${id}/recognize`, {}).then(r => r.json()),
    },
    // Collections
    dunning: {
      templates: {
        list: () => fetch(`${API_BASE}/api/ar/dunning/templates`, { credentials: "include" }).then(r => r.json()),
        create: (data: any) => apiRequest("POST", `${API_BASE}/api/ar/dunning/templates`, data).then(r => r.json()),
      },
      run: {
        create: () => apiRequest("POST", `${API_BASE}/api/ar/dunning/run`, {}).then(r => r.json()),
      }
    },
    collections: {
      tasks: {
        list: (assignedTo?: string, status?: string) => {
          const params = new URLSearchParams();
          if (assignedTo) params.append("assignedTo", assignedTo);
          if (status) params.append("status", status);
          return fetch(`${API_BASE}/api/ar/collections/tasks?${params.toString()}`, { credentials: "include" }).then(r => r.json());
        },
        update: (id: string, data: any) => apiRequest("PATCH", `${API_BASE}/api/ar/collections/tasks/${id}`, data).then(r => r.json()),
        generateEmail: (id: string, invoiceId: string) => apiRequest("POST", `${API_BASE}/api/ar/collections/tasks/${id}/email`, { invoiceId }).then(r => r.json()),
      }
    },
    // Period Close
    periods: {
      list: async () => {
        const res = await apiRequest("GET", `${API_BASE}/api/ar/periods`);
        return res.json();
      },
      close: async (name: string) => {
        const res = await apiRequest("POST", `${API_BASE}/api/ar/periods/${name}/close`);
        return res.json();
      },
      getReconciliation: async () => {
        const res = await apiRequest("GET", `${API_BASE}/api/ar/reconciliation`);
        return res.json();
      }
    },
    seed: () => apiRequest("POST", `${API_BASE}/api/ar/seed`, {}).then(r => r.json()),
  },
  // Fixed Assets (FA)
  fa: {
    assets: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/fa/assets`, data).then(r => r.json()),
      list: (params?: { limit?: number; offset?: number }) => {
        const query = params ? `?limit=${params.limit}&offset=${params.offset}` : "";
        return fetch(`${API_BASE}/api/fa/assets${query}`, { credentials: "include" }).then(r => r.json());
      },
      getStats: () => fetch(`${API_BASE}/api/fa/stats`, { credentials: "include" }).then(r => r.json()),
      retire: (id: string, data: any) => apiRequest("POST", `${API_BASE}/api/fa/assets/${id}/retire`, data).then(r => r.json()),
    },
    massAdditions: {
      prepare: () => apiRequest("POST", `${API_BASE}/api/fa/mass-additions/prepare`, {}).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/fa/mass-additions`, { credentials: "include" }).then(r => r.json()),
      post: (id: string, data: any) => apiRequest("POST", `${API_BASE}/api/fa/mass-additions/${id}/post`, data).then(r => r.json()),
    },
    depreciation: {
      run: (data: any) => apiRequest("POST", `${API_BASE}/api/fa/depreciation/run`, data).then(r => r.json()),
    },
    reports: {
      rollForward: (bookId: string, periodName: string) =>
        fetch(`${API_BASE}/api/fa/reports/roll-forward?bookId=${bookId}&periodName=${periodName}`, { credentials: "include" }).then(r => r.json()),
    }
  },

  // Inventory
  inventory: {
    products: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/inventory/products`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/inventory/products`, { credentials: "include" }).then(r => r.json()),
    },
    lots: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/inventory/lots`, data).then(r => r.json()),
      list: (params?: { limit?: number; offset?: number; search?: string; status?: string; itemId?: string }) => {
        const query = new URLSearchParams();
        if (params?.limit) query.append("limit", params.limit.toString());
        if (params?.offset) query.append("offset", params.offset.toString());
        if (params?.search) query.append("search", params.search);
        if (params?.status) query.append("status", params.status);
        if (params?.itemId) query.append("itemId", params.itemId);
        return fetch(`${API_BASE}/api/inventory/lots?${query.toString()}`, { credentials: "include" }).then(r => r.json());
      },
      get: (id: string) => fetch(`${API_BASE}/api/inventory/lots/${id}`, { credentials: "include" }).then(r => r.json()),
      update: (id: string, data: any) => apiRequest("PUT", `${API_BASE}/api/inventory/lots/${id}`, data).then(r => r.json()),
    },
    serials: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/inventory/serials`, data).then(r => r.json()),
      list: (params?: { limit?: number; offset?: number; search?: string; status?: string; itemId?: string }) => {
        const query = new URLSearchParams();
        if (params?.limit) query.append("limit", params.limit.toString());
        if (params?.offset) query.append("offset", params.offset.toString());
        if (params?.search) query.append("search", params.search);
        if (params?.status) query.append("status", params.status);
        if (params?.itemId) query.append("itemId", params.itemId);
        return fetch(`${API_BASE}/api/inventory/serials?${query.toString()}`, { credentials: "include" }).then(r => r.json());
      },
      get: (id: string) => fetch(`${API_BASE}/api/inventory/serials/${id}`, { credentials: "include" }).then(r => r.json()),
      update: (id: string, data: any) => apiRequest("PUT", `${API_BASE}/api/inventory/serials/${id}`, data).then(r => r.json()),
    },
  },

  // Procurement
  procurement: {
    purchaseOrders: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/procurement/purchase-orders`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/procurement/purchase-orders`, { credentials: "include" }).then(r => r.json()),
    },
    suppliers: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/procurement/suppliers`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/procurement/suppliers`, { credentials: "include" }).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/procurement/suppliers/${id}`, { credentials: "include" }).then(r => r.json()),
      update: (id: string, data: any) => apiRequest("PUT", `${API_BASE}/api/procurement/suppliers/${id}`, data).then(r => r.json()),
      delete: (id: string) => apiRequest("DELETE", `${API_BASE}/api/procurement/suppliers/${id}`, undefined),
      sites: {
        create: (supplierId: string, data: any) => apiRequest("POST", `${API_BASE}/api/procurement/suppliers/${supplierId}/sites`, data).then(r => r.json()),
        list: (supplierId: string) => fetch(`${API_BASE}/api/procurement/suppliers/${supplierId}/sites`, { credentials: "include" }).then(r => r.json()),
        update: (siteId: string, data: any) => apiRequest("PUT", `${API_BASE}/api/procurement/suppliers/sites/${siteId}`, data).then(r => r.json()),
        delete: (siteId: string) => apiRequest("DELETE", `${API_BASE}/api/procurement/suppliers/sites/${siteId}`, undefined),
      }
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
  // Tax
  tax: {
    codes: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/tax/codes`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/tax/codes`, { credentials: "include" }).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/tax/codes/${id}`, { credentials: "include" }).then(r => r.json()),
    },
    jurisdictions: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/tax/jurisdictions`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/tax/jurisdictions`, { credentials: "include" }).then(r => r.json()),
    },
    exemptions: {
      create: (data: any) => apiRequest("POST", `${API_BASE}/api/tax/exemptions`, data).then(r => r.json()),
      list: () => fetch(`${API_BASE}/api/tax/exemptions`, { credentials: "include" }).then(r => r.json()),
    },
    calculate: (invoiceId: string) => apiRequest("POST", `${API_BASE}/api/tax/calculate/${invoiceId}`, {}).then(r => r.json()),
  },
  // Cash Management (CM)
  cash: {
    accounts: {
      list: () => fetch(`${API_BASE}/api/cash/accounts`, { credentials: "include" }).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/cash/accounts/${id}`, { credentials: "include" }).then(r => r.json()),
      getStatementLines: (id: string, params?: { limit?: number; offset?: number }) => {
        const query = params ? `?limit=${params.limit}&offset=${params.offset}` : "";
        return fetch(`${API_BASE}/api/cash/accounts/${id}/statement-lines${query}`, { credentials: "include" }).then(r => r.json());
      },
      getTransactions: (id: string, params?: { limit?: number; offset?: number }) => {
        const query = params ? `?limit=${params.limit}&offset=${params.offset}` : "";
        return fetch(`${API_BASE}/api/cash/accounts/${id}/transactions${query}`, { credentials: "include" }).then(r => r.json());
      },
      autoReconcile: (id: string) => apiRequest("POST", `${API_BASE}/api/cash/accounts/${id}/reconcile`, {}).then(r => r.json()),
    },
    reconcile: {
      manual: (data: any) => apiRequest("POST", `${API_BASE}/api/cash/reconcile/manual`, data).then(r => r.json()),
      unmatch: (matchingGroupId: string) => apiRequest("POST", `${API_BASE}/api/cash/reconcile/unmatch`, { matchingGroupId }).then(r => r.json()),
    }
  },
  // General Ledger (GL)
  gl: {
    journals: {
      list: (params?: { status?: string, ledgerId?: string, search?: string, limit?: number, offset?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append("status", params.status);
        if (params?.ledgerId) queryParams.append("ledgerId", params.ledgerId);
        if (params?.search) queryParams.append("search", params.search);
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.offset) queryParams.append("offset", params.offset.toString());
        return fetch(`${API_BASE}/api/gl/journals?${queryParams.toString()}`, { credentials: "include" }).then(r => r.json());
      },
      get: (id: string) => fetch(`${API_BASE}/api/gl/journals/${id}`, { credentials: "include" }).then(r => r.json()),
      post: (id: string | number) => apiRequest("POST", `${API_BASE}/api/finance/gl/journals/${id}/post`, {}).then(r => r.json()),
      getStats: () => fetch(`${API_BASE}/api/gl/stats`, { credentials: "include" }).then(r => r.json()),
    }
  }
};
