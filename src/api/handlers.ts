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
];
