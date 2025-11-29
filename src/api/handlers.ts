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
        href: '/finance/ap/invoices',
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

  // Invoices endpoint
  http.get('/api/finance/ap/invoices', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    const allInvoices = [
      { id: '1', number: 'INV-5234', vendor: 'Acme Corp', amount: 12500, status: 'pending', date: '2024-01-15', dueDate: '2024-02-15' },
      { id: '2', number: 'INV-5235', vendor: 'Tech Industries', amount: 8750, status: 'approved', date: '2024-01-16', dueDate: '2024-02-16' },
      { id: '3', number: 'INV-5236', vendor: 'Global Solutions', amount: 15000, status: 'paid', date: '2024-01-10', dueDate: '2024-02-10' },
      { id: '4', number: 'INV-5237', vendor: 'DataFlow Inc', amount: 5600, status: 'rejected', date: '2024-01-17', dueDate: '2024-02-17' },
      { id: '5', number: 'INV-5238', vendor: 'Cloud Systems', amount: 22000, status: 'pending', date: '2024-01-18', dueDate: '2024-02-18' },
      { id: '6', number: 'INV-5239', vendor: 'Acme Corp', amount: 9800, status: 'approved', date: '2024-01-14', dueDate: '2024-02-14' },
      { id: '7', number: 'INV-5240', vendor: 'Tech Industries', amount: 7200, status: 'paid', date: '2024-01-12', dueDate: '2024-02-12' },
      { id: '8', number: 'INV-5241', vendor: 'Global Solutions', amount: 11500, status: 'pending', date: '2024-01-19', dueDate: '2024-02-19' },
      { id: '9', number: 'INV-5242', vendor: 'DataFlow Inc', amount: 6800, status: 'approved', date: '2024-01-20', dueDate: '2024-02-20' },
      { id: '10', number: 'INV-5243', vendor: 'Cloud Systems', amount: 13400, status: 'paid', date: '2024-01-11', dueDate: '2024-02-11' },
    ];

    const filtered = status ? allInvoices.filter((inv) => inv.status === status) : allInvoices;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({
      data,
      total: filtered.length,
      page,
      limit,
      pages: Math.ceil(filtered.length / limit),
    });
  }),

  // Employees endpoint
  http.get('/api/hr/employees', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');

    const allEmployees = [
      { id: '1', name: 'John Doe', email: 'john@company.com', role: 'Senior Developer', department: 'Engineering', status: 'active' },
      { id: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'Product Manager', department: 'Product', status: 'active' },
      { id: '3', name: 'Mike Johnson', email: 'mike@company.com', role: 'Designer', department: 'Design', status: 'active' },
      { id: '4', name: 'Sarah Williams', email: 'sarah@company.com', role: 'HR Manager', department: 'Human Resources', status: 'active' },
      { id: '5', name: 'Tom Brown', email: 'tom@company.com', role: 'QA Engineer', department: 'Quality Assurance', status: 'active' },
      { id: '6', name: 'Emily Davis', email: 'emily@company.com', role: 'Data Analyst', department: 'Analytics', status: 'on-leave' },
      { id: '7', name: 'Robert Wilson', email: 'robert@company.com', role: 'DevOps Engineer', department: 'Infrastructure', status: 'active' },
      { id: '8', name: 'Lisa Anderson', email: 'lisa@company.com', role: 'Accountant', department: 'Finance', status: 'active' },
      { id: '9', name: 'James Taylor', email: 'james@company.com', role: 'Sales Manager', department: 'Sales', status: 'active' },
      { id: '10', name: 'Mary Martinez', email: 'mary@company.com', role: 'Marketing Lead', department: 'Marketing', status: 'active' },
      { id: '11', name: 'David Lee', email: 'david@company.com', role: 'Backend Developer', department: 'Engineering', status: 'active' },
      { id: '12', name: 'Jennifer Garcia', email: 'jennifer@company.com', role: 'Frontend Developer', department: 'Engineering', status: 'inactive' },
    ];

    const start = (page - 1) * limit;
    const data = allEmployees.slice(start, start + limit);

    return HttpResponse.json({
      data,
      total: allEmployees.length,
      page,
      limit,
      pages: Math.ceil(allEmployees.length / limit),
    });
  }),

  // Dashboard KPIs
  http.get('/api/analytics/dashboard', () => {
    return HttpResponse.json({
      kpis: [
        { id: '1', label: 'Total Revenue', value: '$2.4M', change: '+12.5%', color: 'green' },
        { id: '2', label: 'Pending Invoices', value: '24', change: '-3.2%', color: 'blue' },
        { id: '3', label: 'Average Payment Days', value: '28.4', change: '+2.1%', color: 'yellow' },
        { id: '4', label: 'Active Employees', value: '156', change: '+5.0%', color: 'green' },
      ],
      chartData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Revenue',
            data: [400, 450, 380, 520, 490, 640],
            color: 'rgb(59, 130, 246)',
          },
          {
            label: 'Expenses',
            data: [200, 210, 190, 240, 220, 280],
            color: 'rgb(239, 68, 68)',
          },
        ],
      },
    });
  }),
];
