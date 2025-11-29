import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/modules', () => {
    return HttpResponse.json([
      { id: 'crm', name: 'CRM', icon: 'Users' },
      { id: 'erp', name: 'ERP', icon: 'Briefcase' },
      { id: 'hr', name: 'HR', icon: 'Users' },
      { id: 'analytics', name: 'Analytics', icon: 'BarChart3' },
    ]);
  }),

  http.get('/api/user', () => {
    return HttpResponse.json({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      avatar: 'JD',
    });
  }),

  http.get('/api/recent-activity', () => {
    return HttpResponse.json([
      { id: '1', type: 'created', message: 'Created new opportunity', timestamp: '2 hours ago' },
      { id: '2', type: 'updated', message: 'Updated invoice #1234', timestamp: '4 hours ago' },
      { id: '3', type: 'deleted', message: 'Archived old lead', timestamp: '1 day ago' },
    ]);
  }),

  http.get('/api/menu-items', () => {
    return HttpResponse.json([
      { id: 'dashboard', label: 'Dashboard', icon: 'Home', href: '/' },
      { id: 'crm', label: 'CRM', icon: 'Users', href: '/crm' },
      { id: 'erp', label: 'ERP', icon: 'Briefcase', href: '/erp' },
      { id: 'reports', label: 'Reports', icon: 'BarChart3', href: '/reports' },
      { id: 'settings', label: 'Settings', icon: 'Cog', href: '/settings' },
    ]);
  }),

  http.get('/api/commands', () => {
    return HttpResponse.json([
      // Actions
      {
        id: 'create-invoice',
        title: 'Create Invoice',
        subtitle: 'New invoice in Accounts Payable',
        category: 'Actions',
        tag: 'AP',
        icon: '📄',
        keystroke: '⌘I',
        action: 'createInvoice',
      },
      {
        id: 'create-bill',
        title: 'Create Bill',
        subtitle: 'New vendor bill',
        category: 'Actions',
        tag: 'AP',
        icon: '💰',
        keystroke: '⌘B',
        action: 'createBill',
      },
      {
        id: 'create-lead',
        title: 'Create Lead',
        subtitle: 'New sales lead',
        category: 'Actions',
        tag: 'CRM',
        icon: '👤',
        action: 'createLead',
      },
      // Pages
      {
        id: 'page-ap-invoices',
        title: 'Invoices',
        subtitle: 'Accounts Payable invoices list',
        category: 'Pages',
        tag: 'AP',
        icon: '📋',
        href: '/ap/invoices',
      },
      {
        id: 'page-crm-contacts',
        title: 'Contacts',
        subtitle: 'CRM contacts database',
        category: 'Pages',
        tag: 'CRM',
        icon: '👥',
        href: '/crm/contacts',
      },
      {
        id: 'page-reports-revenue',
        title: 'Revenue Report',
        subtitle: 'Monthly revenue analysis',
        category: 'Pages',
        tag: 'Reports',
        icon: '📊',
        href: '/reports/revenue',
      },
      // Records
      {
        id: 'record-acme-corp',
        title: 'Acme Corporation',
        subtitle: 'Vendor record',
        category: 'Records',
        tag: 'Vendor',
        icon: '🏢',
        href: '/vendors/acme-corp',
      },
      {
        id: 'record-inv-5234',
        title: 'INV-5234',
        subtitle: '$12,500 - Pending approval',
        category: 'Records',
        tag: 'Invoice',
        icon: '📄',
        href: '/invoices/5234',
      },
      {
        id: 'record-john-smith',
        title: 'John Smith',
        subtitle: 'Lead - Tech Company',
        category: 'Records',
        tag: 'Lead',
        icon: '👤',
        href: '/leads/john-smith',
      },
      // Reports
      {
        id: 'report-ap-aging',
        title: 'AP Aging Report',
        subtitle: 'Aged payables analysis',
        category: 'Reports',
        tag: 'Finance',
        icon: '⏰',
        href: '/reports/ap-aging',
      },
      {
        id: 'report-vendor-spend',
        title: 'Vendor Spend Analysis',
        subtitle: 'Top vendors by spend',
        category: 'Reports',
        tag: 'Finance',
        icon: '💸',
        href: '/reports/vendor-spend',
      },
    ]);
  }),

  http.post('/api/commands/execute', async ({ request }) => {
    const body = await request.json() as { action: string; params?: Record<string, unknown> };
    
    // Mock action handlers
    const results: Record<string, unknown> = {
      createInvoice: { id: 'inv-999', status: 'created', message: 'Invoice created successfully' },
      createBill: { id: 'bill-888', status: 'created', message: 'Bill created successfully' },
      createLead: { id: 'lead-777', status: 'created', message: 'Lead created successfully' },
    };

    return HttpResponse.json(results[body.action] || { error: 'Unknown action' });
  }),
];
